import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import './App.css';

// --- EXACT PREDEFINED PACKAGES ---
const PREDEFINED_SERVICES = {
  "Bastion Server (Linux)": { items: [ { m: "Compute E4 Standard - OCPU", p: 1, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 4, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 50, u: 730, i: 1 }, { m: "Public IP", p: 1, u: 730, i: 1 } ] },
  "Bastion Server (Windows)": { items: [ { m: "Compute E4 Standard - OCPU", p: 4, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 24, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 300, u: 730, i: 1 }, { m: "Windows Operating System", p: 4, u: 730, i: 1 }, { m: "Public IP", p: 1, u: 730, i: 1 } ] },
  "Compute Instance (Linux)": { items: [ { m: "Compute - E4 Standard - OCPU", p: 8, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 16, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 200, u: 730, i: 1 } ] },
  "Compute Instance (Windows)": { items: [ { m: "Compute E4 Standard - OCPU", p: 4, u: 730, i: 1 }, { m: "Windows Operating System", p: 4, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 24, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 300, u: 730, i: 1 } ] },
  "Compute Instance (Windows) - Intel": { items: [ { m: "Compute X9 Standard - OCPU", p: 72, u: 730, i: 1 }, { m: "Windows Operating System", p: 72, u: 730, i: 1 }, { m: "Compute - X9 Standard - Memory (GB)", p: 256, u: 730, i: 1 }, { m: "Block Storage (GB)", p: 15360, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 512, u: 730, i: 1 } ] },
  "Backup Storage": { items: [ { m: "Block Storage (GB)", p: 10704, u: 730, i: 1 } ] },
  "Object Storage": { items: [ { m: "Object Storage - Storage (GB Capacity Per Month)", p: 500, u: 1, i: 1 }, { m: "Object Storage - Requests (10,000 Requests per Month)", p: 200, u: 1, i: 1, req: false } ] },
  "ATP Database / Autonomous Database": { items: [ { m: "Oracle Autonomous Transaction Processing (ECPU Per Hour)", p: 6, u: 730, i: 1 }, { m: "Autonomous Database Storage for Transaction Processing  (GB Per Month)", p: 500, u: 1, i: 1 }, { m: "Backup - Oracle Autonomous Database Storage (GB)", p: 1000, u: 1, i: 1 } ] },
  "MySQL HeatWave Database": { items: [ { m: "MySQL Database - Storage (Gigabyte Storage Capacity Per Month)", p: 300, u: 1, i: 1 }, { m: "OCI - HeatWave (HeatWave Capacity Per Month)", p: 4, u: 1, i: 1 }, { m: "MySQL Database - ECPU (ECPU Per Month)", p: 8, u: 730, i: 1 } ] },
  "Oralce Base Database": { items: [ { m: "Oracle Base Database Service - Extreme Performance (OCPU per Month)", p: 48, u: 730, i: 1 }, { m: "Block Storage (GB)", p: 10440, u: 1, i: 1 } ] },
  "PostgreSQL Database": { items: [ { m: "Database Optimized Storage (GB)", p: 400, u: 1, i: 1 }, { m: "Database with PostgreSQL - X86 - OCPU", p: 171, u: 730, i: 1 }, { m: "Compute - Standard - E4 - OCPU", p: 57, u: 730, i: 3 }, { m: "Compute - Standard - E4  - Memory", p: 216, u: 730, i: 3 } ] },
  "Email Delivery Service": { items: [ { m: "Oracle Cloud Infrastructure - Email Delivery - 1,000 Emails Sent", p: 500, u: 730, i: 1 } ] },
  "Monitoring dashboard": { items: [ { m: "Oracle Cloud Infrastructure - Monitoring - Retrieval", p: 100, u: 1, i: 1 } ] },
  "DRCC Analytics Cloud - Enterprise": { items: [ { m: "BDCCL-DRCC Analytics Cloud - Enterprise (OCPU per Month)", p: 32, u: 730, i: 1 } ] },
  "Oracle Kubernetes Engine (OKE)": { items: [ { m: "OCI Kubernetes Engine - Enhanced Cluster (Cluster Per Hour)", p: 1, u: 730, i: 1 }, { m: "Compute - Standard - E4 - OCPU (OCPU Per Hour)", p: 63, u: 730, i: 2 }, { m: "Compute - E4 Standard - Memory (GB)", p: 308, u: 730, i: 2 }, { m: "Boot Storage (GB)", p: 300, u: 730, i: 2 } ] },
  "Cache with Redis": { items: [ { m: "Oracle Cloud Infrastructure Cache with Redis - Low Memory (up to 10 GB per node) (Redis Memory Gigabyte per Month)", p: 30, u: 730, i: 1 }, { m: "Oracle Cloud Infrastructure Cache with Redis - High Memory (over 10 GB per node) (Redis Memory Gigabyte per Month)", p: 1122, u: 730, i: 1 } ] },
  "Vulnerability Scanning Service": { items: [ { m: "BDCCL-DRCC Vulnerability Scanning Service (Instance Per Month)", p: 1, u: 1, i: 1 } ] },
  "Cloud Guard": { items: [ { m: "Oracle Cloud Guard", p: 1, u: 1, i: 1 }, { m: "Oracle Cloud Guard - Threat Detector - OCI Audit Logs", p: 1, u: 1, i: 1 }, { m: "Oracle Cloud Guard Instance Security Enterprise (Node per month)", p: 1, u: 730, i: 1 }, { m: "Oracle Cloud Guard Instance Security Ad hoc Queries Enterprise (First 950,000 Requests)", p: 1, u: 1, i: 1 } ] },
  "Network Firewall": { items: [ { m: "Network Firewall Instance (Instance Per month)", p: 1, u: 1, i: 1 }, { m: "Network Firewall Data Processing-Greater than 10240 Gigabytes of Data Processed (GB Data Processed/Month)", p: 20480, u: 1, i: 1 } ] },
  "Load Balancer & WAF": { items: [ { m: "Load Balancer - Base", p: 1, u: 1, i: 1 }, { m: "Load Balancer Bandwidth (Mbps)", p: 50, u: 730, i: 1 }, { m: "Public IP", p: 1, u: 730, i: 1 }, { m: "Web Application Firewall - Requests (0 - 1,000,000 Incoming Requests)", p: 100, u: 730, i: 1 }, { m: "Web Application Firewall - Instance", p: 1, u: 730, i: 1 } ] },
  "IPsec VPN": { items: [ { m: "Site to site GRE over IPsec VPN over private data connectivity", p: 1, u: 1, i: 1 }, { m: "Set up (one time cost)", p: 1, u: 1, i: 1 } ] },
  "FastConnect": { items: [ { m: "FastConnect 1 Gbps (Port Month)", p: 1, u: 1, i: 1 } ] },
  "Reserved Public IP": { items: [ { m: "Public IP", p: 1, u: 730, i: 35 } ] },
  "Data Connectivity": { items: [ { m: "Data Connectivity Bandwidth (Per 10 Mbps)", p: 20, u: 1, i: 1 } ] }
};

const CUSTOM_METRIC_OPTIONS = [
  { label: "Public IP", value: "Public IP" },
  { label: "Block Storage (GB)", value: "Block Storage (GB)" }
];

function App() {
  const [orgName, setOrgName] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [todayDate, setTodayDate] = useState('');

  const [lineItems, setLineItems] = useState([
    { id: Date.now(), groupId: Date.now(), isPending: true, reqGroup: 'Req. 1' }
  ]);

  useEffect(() => {
    // Generate accurate local date for the system
    const d = new Date();
    const localDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setTodayDate(localDate);

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

  const getNextReqNumber = () => {
    const masterCount = lineItems.filter(i => i.isMaster || i.isPending).length;
    return `Req. ${masterCount + 1}`;
  };

  const handleAddPredefinedService = (serviceName, replaceGroupId = null) => {
    if (!serviceName) return;
    const config = PREDEFINED_SERVICES[serviceName];
    let newItems = [...lineItems];
    let currentReq = getNextReqNumber();
    let insertIndex = newItems.length;
    let masterGroupId = replaceGroupId || Date.now();

    if (replaceGroupId) {
      insertIndex = newItems.findIndex(i => i.groupId === replaceGroupId);
      if (insertIndex !== -1) {
        currentReq = newItems[insertIndex].reqGroup;
        newItems.splice(insertIndex, 1);
      }
    }

    // Isolate sub-groups by assigning a unique ID to items with different default instance quantities
    let currentSubGroupId = 0;
    let lastI = null;

    const newPackage = config.items.map((item, index) => {
      if (item.i !== lastI) {
        currentSubGroupId++;
        lastI = item.i;
      }
      return {
        id: Date.now() + index,
        groupId: masterGroupId,
        subGroupId: `${masterGroupId}-${currentSubGroupId}`,
        isMaster: index === 0,
        reqGroup: index === 0 ? currentReq : '',
        serverName: index === 0 ? serviceName : '',
        instanceQty: item.i, 
        metricName: item.m,
        partQty: item.p,
        usageHours: item.u,
        isMandatory: item.req !== false,
        isCustom: false
      };
    });
    
    newItems.splice(insertIndex, 0, ...newPackage);
    setLineItems(newItems);
  };

  const addPendingRequirementRow = () => {
    setLineItems([...lineItems, { id: Date.now(), groupId: Date.now(), isPending: true, reqGroup: getNextReqNumber() }]);
  };

  const addSubItemToGroup = (groupId) => {
    const newItems = [...lineItems];
    let insertIndex = newItems.length;
    let inheritedInstQty = 1;
    let inheritedSubGroupId = null;

    for (let i = newItems.length - 1; i >= 0; i--) {
      if (newItems[i].groupId === groupId) {
        insertIndex = i + 1;
        inheritedInstQty = newItems[i].instanceQty; 
        inheritedSubGroupId = newItems[i].subGroupId;
        break;
      }
    }
    
    newItems.splice(insertIndex, 0, {
      id: Date.now(),
      groupId: groupId,
      subGroupId: inheritedSubGroupId,
      isMaster: false,
      reqGroup: '', serverName: '',
      instanceQty: inheritedInstQty, 
      metricName: '', partQty: 1, usageHours: 730,
      isMandatory: false, isCustom: true 
    });
    setLineItems(newItems);
  };

  const updateItem = (id, field, value) => setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));

  // Updates instanceQty for ALL items sharing the exact same sub-group block
  const updateSubGroupInstQty = (subGroupId, newQty) => {
    setLineItems(lineItems.map(item => item.subGroupId === subGroupId ? { ...item, instanceQty: newQty } : item));
  };

  const removeItem = (id) => {
    const itemToRemove = lineItems.find(i => i.id === id);
    if (itemToRemove && (itemToRemove.isMaster || itemToRemove.isPending)) {
        setLineItems(lineItems.filter(item => item.groupId !== itemToRemove.groupId));
    } else {
        setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const subTotal = lineItems.reduce((sum, item) => {
    if (item.isPending) return sum;
    return sum + (Number(item.instanceQty) * Number(item.partQty) * getPrice(item.metricName));
  }, 0);
  
  const vat = subTotal * 0.05;
  const grandTotal = subTotal + vat;

  const handleGenerateBoQ = async () => {
    if (!orgName.trim()) return alert("Organization Name is mandatory.");
    const payloadItems = lineItems.filter(item => !item.isPending).map(item => ({ ...item, unitPrice: getPrice(item.metricName) }));
    if (payloadItems.length === 0) return alert("Please add at least one valid requirement.");

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
        <p className="brand-subtext">Address: E-14/X, ICT Tower (11th Floor), Agargaon, Dhaka-1207 | Phone: +88-02-55006441</p>
      </div>

      <div className="control-panel" style={{ marginBottom: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <label className="input-label">Organization Name <span style={{color: 'red'}}>*</span></label>
          <input type="text" className="text-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g., Department of Shipping" />
        </div>
        <div style={{ width: '200px' }}>
          <label className="input-label">Date</label>
          <input type="text" className="text-input" value={todayDate} disabled style={{ background: '#f8fafc' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: '1', maxWidth: '400px' }}>
          <select 
            className="text-input" 
            style={{ fontWeight: 'bold', cursor: 'pointer', height: '42px', color: '#164e50' }}
            onChange={(e) => { handleAddPredefinedService(e.target.value); e.target.value = ""; }}
            defaultValue=""
          >
            <option value="" disabled>Select a service to add...</option>
            {Object.keys(PREDEFINED_SERVICES).map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="server-card" style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table className="metric-table" style={{ minWidth: '1100px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--teal-dark)', color: 'white' }}>
            <tr>
              <th style={{ color: 'white', padding: '15px', border: '1px solid #333', width: '90px' }}>SL No.</th>
              <th style={{ color: 'white', border: '1px solid #333', width: '20%' }}>Service Name</th>
              <th style={{ color: 'white', border: '1px solid #333', width: '80px' }}>Inst Qty</th>
              <th style={{ color: 'white', width: '30%', border: '1px solid #333' }}>Requirements/Metric</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Part Qty</th>
              <th style={{ color: 'white', background: '#2c6b6d', border: '1px solid #333' }}>Req Qty</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Usage Hrs</th>
              <th style={{ color: 'white', border: '1px solid #333' }}>Unit Price</th>
              <th style={{ color: 'white', background: '#1a5456', border: '1px solid #333' }}>Total (BDT)</th>
              <th style={{ border: '1px solid #333', width: '60px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => {
              
              if (item.isPending) {
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <input type="text" className="text-input" style={{ width: '100%', padding: '6px', textAlign: 'center', background: 'transparent' }} value={item.reqGroup} disabled />
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      <select className="text-input" style={{ fontWeight: 'bold', cursor: 'pointer', height: '36px', width: '100%' }} onChange={(e) => handleAddPredefinedService(e.target.value, item.groupId)} defaultValue="">
                        <option value="" disabled>Select a service to add...</option>
                        {Object.keys(PREDEFINED_SERVICES).map(service => (<option key={service} value={service}>{service}</option>))}
                      </select>
                    </td>
                    <td colSpan="7" style={{ borderRight: '1px solid #e2e8f0' }}></td>
                    <td style={{ padding: '10px', textAlign: 'center' }}><button className="remove-btn" onClick={() => removeItem(item.id)}><Trash2 size={16} /></button></td>
                  </tr>
                );
              }

              const masterItem = lineItems.find(i => i.groupId === item.groupId && i.isMaster) || item;
              const groupItems = lineItems.filter(i => i.groupId === item.groupId);
              const isLastInGroup = index === lineItems.length - 1 || lineItems[index + 1].groupId !== item.groupId;
              
              const isBastionOrCompute = masterItem.serverName.includes('Bastion') || masterItem.serverName.includes('Compute Instance');
              
              // Calculate Sub-Group Instance Qty Merging
              let showInstQty = false;
              let instRowSpan = 1;
              if (index === 0 || lineItems[index - 1].subGroupId !== item.subGroupId) {
                showInstQty = true;
                for (let i = index + 1; i < lineItems.length; i++) {
                  if (lineItems[i].subGroupId === item.subGroupId) instRowSpan++;
                  else break;
                }
                // If this sub-group touches the end of a Bastion/Compute group, extend the merge down to cover the Add Metric row
                if (isBastionOrCompute && lineItems.slice(index, index + instRowSpan).some(i => i.groupId !== lineItems[Math.min(lineItems.length - 1, index + instRowSpan)]?.groupId)) {
                  instRowSpan++;
                }
              }

              const hasPublicIP = groupItems.some(i => i.metricName === 'Public IP');
              const dynamicOptions = hasPublicIP ? CUSTOM_METRIC_OPTIONS.filter(o => o.value !== 'Public IP') : CUSTOM_METRIC_OPTIONS;
              const reqQty = Number(item.instanceQty) * Number(item.partQty);
              const price = getPrice(item.metricName);

              return (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: isLastInGroup && (!isBastionOrCompute) ? '1px solid #e2e8f0' : '1px solid #e2e8f0' }}>
                    
                    {item.isMaster && (
                      <>
                        <td rowSpan={groupItems.length + (isLastInGroup && isBastionOrCompute ? 1 : 0)} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>
                          <input type="text" className="text-input" style={{ width: '100%', padding: '6px', textAlign: 'center', fontWeight: 'normal' }} value={item.reqGroup} onChange={(e) => updateItem(item.id, 'reqGroup', e.target.value)} placeholder="Req." />
                        </td>
                        <td rowSpan={groupItems.length + (isLastInGroup && isBastionOrCompute ? 1 : 0)} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>
                          <input type="text" className="text-input" style={{ padding: '6px', fontWeight: 'bold', width: '100%' }} value={item.serverName} onChange={(e) => updateItem(item.id, 'serverName', e.target.value)} />
                        </td>
                      </>
                    )}
                    
                    {showInstQty && (
                      <td rowSpan={isLastInGroup && isBastionOrCompute ? instRowSpan + 1 : instRowSpan} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <input type="number" className="text-input" style={{ padding: '6px', width: '100%', minWidth: '50px', textAlign: 'center', fontWeight: 'bold' }} value={item.instanceQty} onChange={(e) => updateSubGroupInstQty(item.subGroupId, e.target.value)} min="1" />
                      </td>
                    )}
                    
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      {!item.isCustom ? (
                        <div style={{ fontWeight: '500', fontSize: '0.85rem', color: '#1e293b' }}>{item.metricName}</div>
                      ) : (
                        <Select options={dynamicOptions} value={item.metricName ? { label: item.metricName, value: item.metricName } : null} onChange={(opt) => updateItem(item.id, 'metricName', opt.value)} menuPortalTarget={document.body} placeholder="Select..." styles={{ control: base => ({ ...base, minHeight: '36px', fontSize: '0.85rem' }), menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
                      )}
                    </td>
                    
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}><input type="number" className="text-input" style={{ padding: '6px', width: '100%' }} value={item.partQty} onChange={(e) => updateItem(item.id, 'partQty', e.target.value)} min="1" /></td>
                    <td style={{ background: '#f8fafc', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{reqQty}</td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}><input type="number" className="text-input" style={{ padding: '6px', width: '100%' }} value={item.usageHours} onChange={(e) => updateItem(item.id, 'usageHours', e.target.value)} /></td>
                    <td style={{ fontWeight: '500', fontSize: '0.9rem', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td style={{ fontWeight: '700', color: 'var(--teal-dark)', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{(reqQty * price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {(item.isMaster || !item.isMandatory) && (
                        <button className="remove-btn" onClick={() => removeItem(item.id)} title={item.isMaster ? "Delete Entire Package" : "Delete Item"}><Trash2 size={16} /></button>
                      )}
                    </td>
                  </tr>

                  {/* Render the Add Metric Button DIRECTLY UNDER the Metric Column */}
                  {isLastInGroup && isBastionOrCompute && (
                    <tr key={`add-more-row-${item.groupId}`} style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '8px 12px', background: '#fafafa', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <button onClick={() => addSubItemToGroup(item.groupId)} style={{ background: 'transparent', color: 'var(--teal-main)', border: '1px dashed var(--teal-main)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Plus size={14} /> Add other metric
                        </button>
                      </td>
                      <td colSpan="6" style={{ background: '#fafafa', borderRight: '1px solid #e2e8f0' }}></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            <tr>
              <td colSpan="10" style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <button onClick={addPendingRequirementRow} style={{ background: '#164e50', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Plus size={16} /> Add new requirement
                </button>
              </td>
            </tr>

            {/* --- WEB UI BILLING CALCULATION (Special Notes Hidden) --- */}
            <tr>
              <td colSpan="6" style={{ background: 'transparent', border: 'none' }}></td>
              <td colSpan="2" style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc' }}>Subtotal of Prod (Per Month)</td>
              <td colSpan="2" style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc' }}>{subTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td colSpan="6" style={{ background: 'transparent', border: 'none' }}></td>
              <td colSpan="2" style={{ padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc' }}>VAT Rate</td>
              <td colSpan="2" style={{ padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc' }}>0.05</td>
            </tr>
            <tr>
              <td colSpan="6" style={{ background: 'transparent', border: 'none' }}></td>
              <td colSpan="2" style={{ padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc' }}>VAT</td>
              <td colSpan="2" style={{ padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc' }}>{vat.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td colSpan="6" style={{ background: 'transparent', border: 'none' }}></td>
              <td colSpan="1" style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc', fontSize: '1.1rem' }}>Total (Per Month)</td>
              <td colSpan="1" style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #333', textAlign: 'center', background: '#f8fafc', fontSize: '1.1rem' }}>BDT</td>
              <td colSpan="2" style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #333', textAlign: 'right', background: '#f8fafc', fontSize: '1.1rem' }}>{grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '40px' }}>
        <button className="btn btn-gold" onClick={handleGenerateBoQ} style={{ height: '50px', fontSize: '1.1rem', padding: '0 30px' }}>
          <FileSpreadsheet size={22} style={{marginRight: '10px'}}/> Generate Excel Output
        </button>
      </div>

    </div>
  );
}

export default App;
