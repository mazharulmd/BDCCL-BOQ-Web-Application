const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
const pool = new Pool({
    user: 'boq_user',
    host: 'localhost',
    database: 'boq_db',
    password: 'Admin@1324', // Your secure password
    port: 5432,
});

// --- 2. DATABASE INITIALIZATION & SEEDING ---
async function initializeDatabase() {
    try {
        // Drop and recreate table to ensure it matches the exact DOS BOQ requirements
        await pool.query('DROP TABLE IF EXISTS product_catalog;');
        
        await pool.query(`
            CREATE TABLE product_catalog (
                id SERIAL PRIMARY KEY,
                metric_name VARCHAR(255),
                unit_price_bdt NUMERIC
            );
        `);
        
        // Exact catalog extracted from DOS BOQ.csv
        await pool.query(`
            INSERT INTO product_catalog (metric_name, unit_price_bdt) VALUES
            ('Compute - Standard - E4 - OCPU (OCPU Per Hour)', 2168),
            ('Compute - Standard - E4  - Memory (Gigabyte Per Hour)', 130),
            ('Boot Storage - Block Volume - Storage (Gigabyte Storage Capacity Per Month)', 20),
            ('Data Storage - Block Volume - Storage (Gigabyte Storage Capacity Per Month)', 20),
            ('Oracle Database Cloud Service - Enterprise Edition - OCPU Per Hour', 75899.4),
            ('Oracle Database Cloud Service - Enterprise Edition - BYOL - OCPU Per Hour', 16973.9),
            ('Database Cloud Service - Enterprise Edition - Extra Storage - Block Volume (Gigabyte Storage Capacity Per Month)', 20),
            ('OCI - FastConnect 1 Gbps (Port Month)', 19111),
            ('Oracle Cloud Infrastructure - Monitoring - Retrieval', 0.25),
            ('Object Storage - Storage (GB Capacity Per Month)', 12),
            ('Load Balancer - Base', 1000),
            ('Load Balancer Bandwidth (Mbps)', 10),
            ('Public IP', 500),
            ('Web Application Firewall - Requests (0 - 1,000,000 Incoming Requests)', 85),
            ('Web Application Firewall - Instance ', 600)
        `);
        console.log("Database seeded successfully with DOS BOQ catalog.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}
initializeDatabase();

// --- 3. API: FETCH FULL CATALOG ---
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_catalog ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. API: SEARCH CATALOG (For legacy components if needed) ---
app.get('/api/products/search', async (req, res) => {
    const query = req.query.q || '';
    try {
        const result = await pool.query(
            'SELECT * FROM product_catalog WHERE metric_name ILIKE $1 LIMIT 20',
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. API: GENERATE EXCEL WITH FORMULAS & MERGED CELLS ---
app.post('/api/quotes/generate', async (req, res) => {
    const { organizationName, quoteDate, lineItems } = req.body;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('BoQ');

    // Branding: Bangladesh Data Center Company Limited (BDCCL)
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = 'Bangladesh Data Center Company Limited (BDCCL)';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = 'Address: E-14/X, ICT Tower (11th Floor), Agargaon, Dhaka-1207 | Phone: +88-02-55006441';
    worksheet.getCell('A2').font = { size: 10 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Standard Quotation Title
    worksheet.mergeCells('A4:I4');
    worksheet.getCell('A4').value = 'Quotation';
    worksheet.getCell('A4').font = { size: 14, bold: true, underline: true };
    worksheet.getCell('A4').alignment = { horizontal: 'center' };

    // Customer Information Block
    worksheet.getCell('A6').value = 'Customer Information';
    worksheet.getCell('A6').font = { bold: true };
    
    worksheet.getCell('H6').value = 'Quotation Date';
    worksheet.getCell('H6').font = { bold: true };
    worksheet.getCell('I6').value = quoteDate;

    worksheet.getCell('A7').value = 'Organization Name';
    worksheet.getCell('A7').font = { bold: true };
    worksheet.getCell('B7').value = organizationName;

    // Table Headers (Row 14)
    worksheet.getRow(14).values = [
        'SL No.', 'Server', 'Instance Quantity', 'Requirements/Metric', 
        'Part QTY', 'Requirements/Qty', 'Usage QTY (Monthly hour)', 
        'Unit Price (BDT)', 'Total (Per Month) (BDT)'
    ];
    
    // Style the headers
    const headerRow = worksheet.getRow(14);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF164E50' } }; // Matches UI Teal
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    headerRow.height = 30;

    // Set Column Widths for readability
    worksheet.getColumn('A').width = 10;
    worksheet.getColumn('B').width = 35;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 50;
    worksheet.getColumn('E').width = 10;
    worksheet.getColumn('F').width = 15;
    worksheet.getColumn('G').width = 25;
    worksheet.getColumn('H').width = 15;
    worksheet.getColumn('I').width = 20;

    // Inject Line Items with DYNAMIC MERGING & ABSOLUTE FORMULAS
    let currentRow = 15;
    let groupStartRow = 15;
    let currentInstQtyCell = 'C15'; // Tracks the master cell for formulas
    let currentParentInstQty = 1;   // Tracks the master value for initial calculation

    lineItems.forEach((item, index) => {
        const row = worksheet.getRow(currentRow);
        
        // 1. Detect if this is a NEW group / package
        if (item.reqGroup !== '') {
            groupStartRow = currentRow;
            currentInstQtyCell = `$C$${currentRow}`; // Lock the formula to this specific row (e.g., $C$15)
            currentParentInstQty = Number(item.instanceQty) || 1;
        }

        const partQty = Number(item.partQty) || 1;
        const usageHours = Number(item.usageHours) || 730;
        const unitPrice = Number(item.unitPrice) || 0;

        // 2. Write the row data
        row.values = [
            item.reqGroup, 
            item.serverName, 
            item.instanceQty, 
            item.metricName, 
            partQty, 
            // Formula Column F: Requirement Qty = Master Instance Qty * Part Qty
            { 
                formula: `IF(ISBLANK(${currentInstQtyCell}), 1, ${currentInstQtyCell})*E${currentRow}`, 
                result: currentParentInstQty * partQty 
            },
            usageHours, 
            unitPrice,
            // Formula Column I: Total = Requirement Qty * Unit Price
            { 
                formula: `F${currentRow}*H${currentRow}`, 
                result: (currentParentInstQty * partQty) * unitPrice 
            }
        ];

        // Format currencies
        row.getCell('H').numFmt = '#,##0.00';
        row.getCell('I').numFmt = '#,##0.00';

        // 3. Detect if this is the END of a group to apply Merging
        const isLastItem = index === lineItems.length - 1;
        const nextItemStartsNewGroup = !isLastItem && lineItems[index + 1].reqGroup !== '';

        if (isLastItem || nextItemStartsNewGroup) {
            // Only merge if there is more than 1 item in the group
            if (currentRow > groupStartRow) {
                worksheet.mergeCells(`A${groupStartRow}:A${currentRow}`);
                worksheet.mergeCells(`B${groupStartRow}:B${currentRow}`);
                worksheet.mergeCells(`C${groupStartRow}:C${currentRow}`);
            }
            
            // Apply beautiful vertical centering to the merged blocks
            worksheet.getCell(`A${groupStartRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell(`B${groupStartRow}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            worksheet.getCell(`C${groupStartRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
        }
        
        currentRow++;
    });

    // Grand Total Row
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const totalLabelCell = worksheet.getCell(`A${currentRow}`);
    totalLabelCell.value = 'Grand Total (Per Month):';
    totalLabelCell.font = { bold: true };
    totalLabelCell.alignment = { horizontal: 'right' };
    
    // Formula for Grand Total
    const grandTotalCell = worksheet.getCell(`I${currentRow}`);
    grandTotalCell.value = { formula: `SUM(I15:I${currentRow - 1})` };
    grandTotalCell.font = { bold: true };
    grandTotalCell.numFmt = '#,##0.00';

    // Send the file back to the browser
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Generated_BOQ.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
});

// --- 6. SERVE REACT FRONTEND ---
const frontendPath = path.join(__dirname, '../boq-frontend/dist');
app.use(express.static(frontendPath));
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- START SERVER ---
const PORT = 3000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
