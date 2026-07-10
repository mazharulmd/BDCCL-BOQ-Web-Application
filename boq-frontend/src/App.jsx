import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Plus, Trash2, FileSpreadsheet, Package, Server } from 'lucide-react';
import './App.css';

function App() {
  const [orgName, setOrgName] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`/api/products`);
        setCatalog(response.data);
      } catch (error) {
        console.error("Error fetching catalog", error);
      }
    };
    fetchCatalog();
  }, []);

  const getPrice = (metricName) => {
    const product = catalog.find(p => p.metric_name === metricName);
    return product ? Number(product.unit_price_bdt) : 0;
  };

  const addComputePackage = () => {
    const groupId = Date.now();
    const currentReq = `Req. ${new Set(lineItems.filter(i => i.isMaster).map(i => i.reqGroup)).size + 1}`;
    
    const newPackage = [
      { id: groupId + 1, groupId, isMaster: true, reqGroup: currentReq, serverName: 'Application Server', instanceQty: 1, metricName: 'Compute - Standard - E4 - OCPU (OCPU Per Hour)', partQty: 16, usageHours: 730 },
      { id: groupId + 2, groupId, isMaster: false, reqGroup: '', serverName: '', instanceQty: '', metricName: 'Compute - Standard - E4  - Memory (Gigabyte Per Hour)', partQty: 64, usageHours: 730 },
      { id: groupId + 3, groupId, isMaster: false, reqGroup: '', serverName: '', instanceQty: '', metricName: 'Boot Storage - Block Volume - Storage (Gigabyte Storage Capacity Per Month)', partQty: 100, usageHours: 730 }
    ];
    setLineItems([...lineItems, ...newPackage]);
  };

  const addLoadBalancerPackage = () => {
    const groupId = Date.now();
    const currentReq = `Req. ${new Set(lineItems.filter(i => i.isMaster).map(i => i.reqGroup)).size + 1}`;
    
    const newPackage = [
      { id: groupId + 1, groupId, isMaster: true, reqGroup: currentReq, serverName: 'Load Balancer & WAF', instanceQty: 1, metricName: 'Load Balancer - Base', partQty: 1, usageHours: 1 },
      { id: groupId + 2, groupId, isMaster: false, reqGroup: '', serverName: '', instanceQty: '', metricName: 'Load Balancer Bandwidth (Mbps)', partQty: 50, usageHours: 730 },
      { id: groupId + 3, groupId, isMaster: false, reqGroup: '', serverName: '', instanceQty: '', metricName: 'Public IP', partQty: 1, usageHours: 730 },
      { id: groupId + 4, groupId, isMaster: false, reqGroup: '', serverName: '', instanceQty: '', metricName: 'Web Application Firewall - Requests (0 - 1,000,000 Incoming Requests)', partQty: 10, usageHours: 730 },
      { id: groupId + 5, groupId, isMaster: false, reqGroup: '', serverName: '', instanceQty: '', metricName: 'Web Application Firewall - Instance ', partQty: 1, usageHours: 730 }
    ];
    setLineItems([...lineItems, ...newPackage]);
  };

  const addSingleRow = () => {
    const groupId = Date.now();
    const currentReq = `Req. ${new Set(lineItems.filter(i => i.isMaster).map(i => i.reqGroup)).size + 1}`;
    setLineItems([...lineItems, { 
      id: groupId, groupId, isMaster: true, reqGroup: currentReq, serverName: 'Custom Service', instanceQty: 1, metricName: '', partQty: 1, usageHours: 730 
    }]);
  };

  const addSubItemToGroup = (groupId) => {
    const newItems = [...lineItems];
    let insertIndex = newItems.length;
    for (let i = newItems.length - 1; i >= 0; i--) {
      if (newItems[i].groupId === groupId) {
        insertIndex = i + 1;
        break;
      }
    }
    newItems.splice(insertIndex, 0, {
      id: Date.now(),
      groupId: groupId,
      isMaster: false,
      reqGroup: '', 
      serverName: '',
      instanceQty: '',
      metricName: '', 
      partQty: 1,
      usageHours: 730
    });
    setLineItems(newItems);
  };

  const updateItem = (id, field, value) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => {
    const itemToRemove = lineItems.find(i => i.id === id);
    if (itemToRemove && itemToRemove.isMaster) {
        setLineItems(lineItems.filter(item => item.groupId !== itemToRemove.groupId));
    } else {
        setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const calculateRowTotal = (item) => {
    const masterItem = item.isMaster ? item : lineItems.find(i => i.groupId === item.groupId && i.isMaster) || item;
    const inst = Number(masterItem.instanceQty) || 1;
    const part = Number(item.partQty) || 0;
    const price = getPrice(item.metricName);
    return inst * part * price;
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);

  const handleGenerateBoQ = async () => {
    if (!orgName.trim()) return alert("Organization Name is mandatory.");

    const payloadItems = lineItems.map(item => ({
      ...item,
      unitPrice: getPrice(item.metricName)
    }));

    try {
      const response = await axios.post(`/api/quotes/generate`, {
        organizationName: orgName, quoteDate: todayDate, lineItems: payloadItems
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `${orgName}_BOQ.xlsx`);
      document.body.appendChild(link); link.click();
    } catch (error) {
      console.error("Error generating BoQ", error);
    }
  };

  return (
    <div className="app-container">
      
      <div className="brand-header">
        <div className="brand-logo-text" style={{ fontSize: '1.8rem' }}>Bangladesh Data Center Company Limited (BDCCL)</div>
        <p className="brand-subtext">Address: E-14/X, ICT Tower (11th Floor), Agargaon, Dhaka-1207</p>
        <p className="brand-subtext">Phone: +88-02-55006441</p>
      </div>

      <div className="control-panel">
        <div style={{ flex: '1', minWidth: '300px' }}>
          <label className="input-label">Organization Name <span style={{color: 'red'}}>*</span></label>
          <input type="text" className="text-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g., Department of Shipping" />
        </div>
        <div style={{ width: '200px' }}>
          <label className="input-label">Date</label>
          <input type="text" className="text-input" value={todayDate} disabled style={{ background: '#f8fafc' }} />
        </div>
        <button className="btn btn-gold" onClick={handleGenerateBoQ} style={{ height: '42px', marginTop: '18px' }}>
          <FileSpreadsheet size={18} /> Generate Excel Output
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={addComputePackage}>
          <Server size={18} /> Add Compute Package (3 Items)
        </button>
        <button className="btn btn-primary" onClick={addLoadBalancerPackage}>
          <Package size={18} /> Add Load Balancer Package (5 Items)
        </button>
        <button className="btn btn-ghost" onClick={addSingleRow}>
          <Plus size={18} /> Add Custom Blank Row
        </button>
      </div>

      <div className="server-card" style={{ overflowX: 'auto' }}>
        <table className="metric-table" style={{ minWidth: '1000px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--teal-dark)', color: 'white' }}>
            <tr>
              <th style={{ color: 'white', padding: '15px', border: '1px solid #333' }}>Req Group</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Service Name</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Inst Qty</th>
              <th style={{ color: 'white', width: '30%', border: '1px solid #333' }}>Metric Name</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Part Qty</th>
              <th style={{ color: 'white', background: '#2c6b6d', border: '1px solid #333' }}>Req Qty (Auto)</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Usage Hrs</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Unit Price</th>
              <th style={{ color: 'white', background: '#1a5456', border: '1px solid #333' }}>Total (BDT)</th>
              <th style={{ border: '1px solid #333' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => {
              const masterItem = item.isMaster ? item : lineItems.find(i => i.groupId === item.groupId && i.isMaster) || item;
              const inst = Number(masterItem.instanceQty) || 1;
              const part = Number(item.partQty) || 0;
              const reqQty = inst * part;
              const price = getPrice(item.metricName);
              
              const groupItems = lineItems.filter(i => i.groupId === item.groupId);
              const rowSpanCount = groupItems.length + 1;

              const isLastInGroup = index === lineItems.length - 1 || lineItems[index + 1].groupId !== item.groupId;

              return (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: isLastInGroup ? 'none' : '1px solid #e2e8f0' }}>
                    
                    {item.isMaster && (
                      <>
                        <td rowSpan={rowSpanCount} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>
                          <input type="text" className="text-input" style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }} value={item.reqGroup} onChange={(e) => updateItem(item.id, 'reqGroup', e.target.value)} placeholder="Req." />
                        </td>
                        <td rowSpan={rowSpanCount} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>
                          <input type="text" className="text-input" style={{ padding: '6px', fontWeight: 'bold' }} value={item.serverName} onChange={(e) => updateItem(item.id, 'serverName', e.target.value)} />
                        </td>
                        <td rowSpan={rowSpanCount} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>
                          <input type="number" className="text-input" style={{ padding: '6px', width: '70px', textAlign: 'center', fontWeight: 'bold' }} value={item.instanceQty} onChange={(e) => updateItem(item.id, 'instanceQty', e.target.value)} min="1" />
                        </td>
                      </>
                    )}
                    
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      <Select 
                        options={catalog.map(c => ({ label: c.metric_name, value: c.metric_name }))}
                        value={item.metricName ? { label: item.metricName, value: item.metricName } : null}
                        onChange={(opt) => updateItem(item.id, 'metricName', opt.value)}
                        menuPortalTarget={document.body}
                        placeholder="Select Public IP, Data Storage..."
                        styles={{ control: base => ({ ...base, minHeight: '36px', fontSize: '0.85rem' }), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    </td>
                    
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      <input type="number" className="text-input" style={{ padding: '6px', width: '80px' }} value={item.partQty} onChange={(e) => updateItem(item.id, 'partQty', e.target.value)} min="1" />
                    </td>
                    
                    <td style={{ background: '#f8fafc', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                      {reqQty}
                    </td>
                    
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      <input type="number" className="text-input" style={{ padding: '6px', width: '80px' }} value={item.usageHours} onChange={(e) => updateItem(item.id, 'usageHours', e.target.value)} />
                    </td>
                    
                    <td style={{ fontWeight: '500', fontSize: '0.9rem', padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      {price.toLocaleString()}
                    </td>
                    
                    <td style={{ fontWeight: '700', color: 'var(--teal-dark)', padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      {(reqQty * price).toLocaleString()}
                    </td>
                    
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button className="remove-btn" onClick={() => removeItem(item.id)} title={item.isMaster ? "Delete Entire Package" : "Delete Metric"}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>

                  {isLastInGroup && (
                    <tr key={`add-more-row-${item.groupId}`} style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <td colSpan="7" style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '2px solid #cbd5e1' }}>
                        <button 
                          onClick={() => addSubItemToGroup(item.groupId)} 
                          style={{ 
                            background: 'transparent', 
                            color: 'var(--teal-main)', 
                            border: '1px dashed var(--teal-main)', 
                            padding: '5px 12px', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Plus size={14} /> Add other services
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        
        {lineItems.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Start by adding a package or single metric above.
          </div>
        )}
      </div>

      <div className="totals-bar">
        <span>Estimated Monthly Grand Total</span>
        <span>{grandTotal.toLocaleString()} BDT</span>
      </div>

    </div>
  );
}

export default App;
