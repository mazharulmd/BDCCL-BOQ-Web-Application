const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const toWordsBDT = (number) => {
    const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const convert = (num) => {
        if ((num = num.toString()).length > 9) return 'Overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim();
    };
    const num = Number(number);
    if (num === 0) return 'Zero Taka Only';
    const split = num.toFixed(2).split('.');
    const taka = parseInt(split[0], 10);
    const paisa = parseInt(split[1], 10);
    let res = taka > 0 ? convert(taka) + ' Taka' : '';
    if (paisa > 0) res += (res ? ' and ' : '') + convert(paisa) + ' Paisa';
    return res + ' Only';
};

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
        await pool.query('DROP TABLE IF EXISTS product_catalog;');
        await pool.query(`
            CREATE TABLE product_catalog (
                id SERIAL PRIMARY KEY,
                metric_name VARCHAR(255),
                unit_price_bdt NUMERIC
            );
        `);
        
        await pool.query(`
            INSERT INTO product_catalog (metric_name, unit_price_bdt) VALUES
            ('Compute E4 Standard - OCPU', 2168.0),
            ('Compute - E4 Standard - Memory (GB)', 130.0),
            ('Boot Storage (GB)', 20.0),
            ('Public IP', 500.0),
            ('Windows Operating System', 7905.0),
            ('Compute - E4 Standard - OCPU', 2168.0),
            ('Compute X9 Standard - OCPU', 3597.0),
            ('Compute - X9 Standard - Memory (GB)', 130.0),
            ('Block Storage (GB)', 25.0),
            ('Object Storage - Storage (GB Capacity Per Month)', 12.0),
            ('Object Storage - Requests (10,000 Requests per Month)', 1.0),
            ('Oracle Autonomous Transaction Processing (ECPU Per Hour)', 31050.0),
            ('Autonomous Database Storage for Transaction Processing  (GB Per Month)', 18.0),
            ('Backup - Oracle Autonomous Database Storage (GB)', 6.0),
            ('MySQL Database - Storage (Gigabyte Storage Capacity Per Month)', 6.0),
            ('OCI - HeatWave (HeatWave Capacity Per Month)', 1090.0),
            ('MySQL Database - ECPU (ECPU Per Month)', 3468.0),
            ('Oracle Base Database Service - Extreme Performance (OCPU per Month)', 116565.73),
            ('Database Optimized Storage (GB)', 12.57),
            ('Database with PostgreSQL - X86 - OCPU', 12484.95),
            ('Compute - Standard - E4 - OCPU', 2168.0),
            ('Compute - Standard - E4  - Memory', 130.0),
            ('Oracle Cloud Infrastructure - Email Delivery - 1,000 Emails Sent', 12.0),
            ('Oracle Cloud Infrastructure - Monitoring - Retrieval', 0.25),
            ('BDCCL-DRCC Analytics Cloud - Enterprise (OCPU per Month)', 193416.0),
            ('OCI Kubernetes Engine - Enhanced Cluster (Cluster Per Hour)', 8696.0),
            ('Compute - Standard - E4 - OCPU (OCPU Per Hour)', 2168.0),
            ('Oracle Cloud Infrastructure Cache with Redis - Low Memory (up to 10 GB per node) (Redis Memory Gigabyte per Month)', 2471.51),
            ('Oracle Cloud Infrastructure Cache with Redis - High Memory (over 10 GB per node) (Redis Memory Gigabyte per Month)', 1732.61),
            ('BDCCL-DRCC Vulnerability Scanning Service (Instance Per Month)', 100.0),
            ('Oracle Cloud Guard', 0.0),
            ('Oracle Cloud Guard - Threat Detector - OCI Audit Logs', 0.0),
            ('Oracle Cloud Guard Instance Security Enterprise (Node per month)', 879.04),
            ('Oracle Cloud Guard Instance Security Ad hoc Queries Enterprise (First 950,000 Requests)', 0.0),
            ('Network Firewall Instance (Instance Per month)', 350343.07),
            ('Network Firewall Data Processing-Greater than 10240 Gigabytes of Data Processed (GB Data Processed/Month)', 1.75),
            ('Load Balancer - Base', 1000.0),
            ('Load Balancer Bandwidth (Mbps)', 10.0),
            ('Web Application Firewall - Requests (0 - 1,000,000 Incoming Requests)', 85.0),
            ('Web Application Firewall - Instance', 600.0),
            ('Site to site GRE over IPsec VPN over private data connectivity', 10000.0),
            ('Set up (one time cost)', 10000.0),
            ('FastConnect 1 Gbps (Port Month)', 19111.0),
            ('Data Connectivity Bandwidth (Per 10 Mbps)', 2500.0);
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

    // Branding
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = 'Bangladesh Data Center Company Limited (BDCCL)';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = 'Address: E-14/X, ICT Tower (11th Floor), Agargaon, Dhaka-1207 | Phone: +88-02-55006441';
    worksheet.getCell('A2').font = { size: 10 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:I4');
    worksheet.getCell('A4').value = 'Quotation';
    worksheet.getCell('A4').font = { size: 14, bold: true, underline: true };
    worksheet.getCell('A4').alignment = { horizontal: 'center' };

    worksheet.getCell('A6').value = 'Customer Information';
    worksheet.getCell('A6').font = { bold: true };
    worksheet.getCell('H6').value = 'Quotation Date';
    worksheet.getCell('H6').font = { bold: true };
    worksheet.getCell('I6').value = quoteDate;
    worksheet.getCell('A7').value = 'Organization Name';
    worksheet.getCell('A7').font = { bold: true };
    worksheet.getCell('B7').value = organizationName;

    // Headers
    worksheet.getRow(14).values = [ 'SL No.', 'Service Name', 'Instance Quantity', 'Requirements/Metric', 'Part QTY', 'Requirements/Qty', 'Usage QTY (Monthly hour)', 'Unit Price (BDT)', 'Total (Per Month) (BDT)' ];
    const headerRow = worksheet.getRow(14);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF164E50' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });
    headerRow.height = 30;

    worksheet.getColumn('A').width = 10;
    worksheet.getColumn('B').width = 40;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 60;
    worksheet.getColumn('E').width = 10;
    worksheet.getColumn('F').width = 15;
    worksheet.getColumn('G').width = 20;
    worksheet.getColumn('H').width = 15;
    worksheet.getColumn('I').width = 20;

    let currentRow = 15;
    let groupStartRow = 15;
    let instSubGroupStartRow = 15;

    lineItems.forEach((item, index) => {
        const row = worksheet.getRow(currentRow);
        
        if (item.isMaster) {
            groupStartRow = currentRow;
            instSubGroupStartRow = currentRow;
        } else {
            // Split instance quantity merging purely by subGroupId
            if (lineItems[index - 1] && lineItems[index - 1].subGroupId !== item.subGroupId) {
                instSubGroupStartRow = currentRow;
            }
        }

        const partQty = Number(item.partQty) || 1;
        const usageHours = Number(item.usageHours) || 730;
        const unitPrice = Number(item.unitPrice) || 0;

        row.values = [
            item.reqGroup, item.serverName, Number(item.instanceQty), item.metricName, partQty, 
            { formula: `C${instSubGroupStartRow}*E${currentRow}`, result: Number(item.instanceQty) * partQty },
            usageHours, unitPrice,
            { formula: `F${currentRow}*H${currentRow}`, result: (Number(item.instanceQty) * partQty) * unitPrice }
        ];

        row.eachCell((cell) => { cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }; });
        row.getCell('H').numFmt = '#,##0.00';
        row.getCell('I').numFmt = '#,##0.00';

        // Merge Instance Quantity Cell based on subGroupId
        const isLastInSubGroup = index === lineItems.length - 1 || lineItems[index + 1].subGroupId !== item.subGroupId;
        if (isLastInSubGroup && currentRow > instSubGroupStartRow) {
            worksheet.mergeCells(`C${instSubGroupStartRow}:C${currentRow}`);
            worksheet.getCell(`C${instSubGroupStartRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Merge Master Group Cells (Req Group and Service Name)
        const isLastInGroup = index === lineItems.length - 1 || lineItems[index + 1].groupId !== item.groupId;
        if (isLastInGroup && currentRow > groupStartRow) {
            worksheet.mergeCells(`A${groupStartRow}:A${currentRow}`);
            worksheet.mergeCells(`B${groupStartRow}:B${currentRow}`);
            worksheet.getCell(`A${groupStartRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell(`B${groupStartRow}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
        
        currentRow++;
    });

// --- VAT & SPECIAL NOTES BLOCK ---
    const lastDataRow = currentRow - 1;
    let rowOffset = currentRow;

    // Subtotal (Aligned to Col F-G and H, Value in I)
    worksheet.mergeCells(`F${rowOffset}:H${rowOffset}`);
    worksheet.getCell(`F${rowOffset}`).value = 'Subtotal (Per Month)';
    worksheet.getCell(`F${rowOffset}`).font = { bold: false };
    worksheet.getCell(`F${rowOffset}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`I${rowOffset}`).value = { formula: `SUM(I15:I${lastDataRow})` };
    worksheet.getCell(`I${rowOffset}`).font = { bold: false };
    worksheet.getCell(`I${rowOffset}`).numFmt = '#,##0.00';
    rowOffset++;
    
    // VAT Rate
    worksheet.mergeCells(`F${rowOffset}:H${rowOffset}`);
    worksheet.getCell(`F${rowOffset}`).value = 'VAT Rate';
    worksheet.getCell(`F${rowOffset}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`I${rowOffset}`).value = 0.05;
    rowOffset++;
    
    // VAT Calculation
    worksheet.mergeCells(`F${rowOffset}:H${rowOffset}`);
    worksheet.getCell(`F${rowOffset}`).value = 'VAT';
    worksheet.getCell(`F${rowOffset}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`I${rowOffset}`).value = { formula: `I${rowOffset-2}*I${rowOffset-1}` };
    worksheet.getCell(`I${rowOffset}`).numFmt = '#,##0.00';
    rowOffset++;

    // Total Grand
    worksheet.mergeCells(`F${rowOffset}:G${rowOffset}`);
    worksheet.getCell(`F${rowOffset}`).value = 'Total (Per Month)';
    worksheet.getCell(`F${rowOffset}`).font = { bold: true };
    worksheet.getCell(`F${rowOffset}`).alignment = { horizontal: 'right' };
    
    worksheet.getCell(`H${rowOffset}`).value = 'BDT';
    worksheet.getCell(`H${rowOffset}`).font = { bold: true };
    worksheet.getCell(`H${rowOffset}`).alignment = { horizontal: 'center' };
    
    worksheet.getCell(`I${rowOffset}`).value = { formula: `I${rowOffset-3}+I${rowOffset-1}` };
    worksheet.getCell(`I${rowOffset}`).font = { bold: true };
    worksheet.getCell(`I${rowOffset}`).numFmt = '#,##0.00';
    rowOffset++;

    // Apply strict borders to the calculation block
    for(let r = currentRow; r < rowOffset; r++) {
        worksheet.getRow(r).eachCell((cell) => { cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }; });
    }

    // In Words Row (Now positioned AFTER the Total)
    worksheet.mergeCells(`A${rowOffset}:I${rowOffset}`);
    const wordsCell = worksheet.getCell(`A${rowOffset}`);
    
    let rawSubTotal = 0;
    lineItems.forEach(item => { rawSubTotal += (Number(item.instanceQty) * Number(item.partQty) * Number(item.unitPrice || 0)); });
    const calculatedGrandTotal = rawSubTotal * 1.05;
    
    wordsCell.value = 'In Words: ' + toWordsBDT(calculatedGrandTotal);
    wordsCell.alignment = { vertical: 'middle', horizontal: 'left' };
    wordsCell.font = { italic: true, bold: true };
    wordsCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    
    rowOffset += 2; // Add a visual gap before special notes

    // Special Notes Box
    const noteEndRow = rowOffset + 3;
    worksheet.mergeCells(`A${rowOffset}:I${noteEndRow}`);
    const noteCell = worksheet.getCell(`A${rowOffset}`);
    noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
    noteCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    noteCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    noteCell.value = {
        richText: [
            { font: { bold: true, color: { argb: 'FFFFFFFF' } }, text: 'Special Note\n' },
            { font: { color: { argb: 'FFFFFFFF' } }, text: '(i) 1 OCPU is equivalent to 2 VCPU\n(ii) Boot Storage price is 20 taka per GB, Block Storage(High performance) price is 25 taka per GB\n(iii) Object Storage & Backup Stoage price is 12 taka per GB, All types of storage is NVMe disk.\n(iv) Regular BOQ prepared based on EC provided current infrastructure capacity with 80% utilization rate at 12K RPS\n(v) Given that resources in the Bangladesh Government Cloud (BGC) can be escalated at any time, BDCCL recommends initiating operations with the minimum requirements and expanding as necessary.\n' },
            { font: { color: { argb: 'FFFF0000' }, bold: true }, text: '(vi) The use of a Web Application Firewall (WAF) is strongly recommended by BDCCL. In the event of any malicious activity occurring without the implementation of BDCCL’s WAF, BDCCL shall not be held responsible for any resulting security vulnerabilities or incidents.' }
        ]
    };

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
