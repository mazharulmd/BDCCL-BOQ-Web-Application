import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Plus, Trash2, FileSpreadsheet, CheckCircle2, AlertTriangle, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react';
import './index.css';

// --- EXACT PREDEFINED PACKAGES ---
const PREDEFINED_SERVICES = {
  "Bastion Server (Linux)": { items: [ { m: "Compute E4 Standard - OCPU", p: 1, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 4, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 50, u: 730, i: 1 }, { m: "Public IP", p: 1, u: 730, i: 1 } ] },
  "Bastion Server (Windows)": { items: [ { m: "Compute E4 Standard - OCPU", p: 4, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 24, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 300, u: 730, i: 1 }, { m: "Windows Operating System", p: 4, u: 730, i: 1 }, { m: "Public IP", p: 1, u: 730, i: 1 } ] },
  "Compute Instance (Linux)": { items: [ { m: "Compute - E4 Standard - OCPU", p: 8, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 16, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 200, u: 730, i: 1 } ] },
  "Compute Instance (Windows) - AMD": { items: [ { m: "Compute E4 Standard - OCPU", p: 4, u: 730, i: 1 }, { m: "Windows Operating System", p: 4, u: 730, i: 1 }, { m: "Compute - E4 Standard - Memory (GB)", p: 24, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 300, u: 730, i: 1 } ] },
  "Compute Instance (Windows) - Intel": { items: [ { m: "Compute X9 Standard - OCPU", p: 72, u: 730, i: 1 }, { m: "Windows Operating System", p: 72, u: 730, i: 1 }, { m: "Compute - X9 Standard - Memory (GB)", p: 256, u: 730, i: 1 }, { m: "Boot Storage (GB)", p: 512, u: 730, i: 1 } ] },
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

// --- CATEGORISED PICKER (grouped, searchable) ---
const SERVICE_CATEGORIES = [
  { label: "Compute", services: ["Bastion Server (Linux)", "Bastion Server (Windows)", "Compute Instance (Linux)", "Compute Instance (Windows) - AMD", "Compute Instance (Windows) - Intel"] },
  { label: "Storage", services: ["Backup Storage", "Object Storage"] },
  { label: "Database", services: ["ATP Database / Autonomous Database", "MySQL HeatWave Database", "Oralce Base Database", "PostgreSQL Database"] },
  { label: "Platform & Analytics", services: ["Email Delivery Service", "Monitoring dashboard", "DRCC Analytics Cloud - Enterprise", "Oracle Kubernetes Engine (OKE)", "Cache with Redis"] },
  { label: "Security", services: ["Vulnerability Scanning Service", "Cloud Guard", "Network Firewall", "Load Balancer & WAF"] },
  { label: "Connectivity", services: ["IPsec VPN", "FastConnect", "Reserved Public IP", "Data Connectivity"] },
];
const GROUPED_OPTIONS = SERVICE_CATEGORIES.map(cat => ({
  label: cat.label,
  options: cat.services.map(s => ({ label: s, value: s }))
}));

const CUSTOM_METRIC_OPTIONS = [
  { label: "Public IP", value: "Public IP" },
  { label: "Block Storage (GB)", value: "Block Storage (GB)" }
];

// Custom Number to Words Converter (BDT Format: Lakh, Crore)
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

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// react-select theming to match brand
const selectStyles = {
  control: (base, s) => ({ ...base, minHeight: '36px', fontSize: '0.85rem', borderColor: s.isFocused ? '#248a8c' : '#e2e8f0', boxShadow: s.isFocused ? '0 0 0 3px rgba(36,138,140,.18)' : 'none', '&:hover': { borderColor: '#248a8c' } }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  groupHeading: base => ({ ...base, color: '#124d4e', fontWeight: 700, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.4px' }),
  option: (base, s) => ({ ...base, backgroundColor: s.isFocused ? '#e6f2f2' : '#fff', color: '#16232a', fontSize: '.85rem' }),
};

function App() {
  const [orgName, setOrgName] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [todayDate, setTodayDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [lineItems, setLineItems] = useState([
    { id: Date.now(), groupId: Date.now(), isPending: true, reqGroup: 'Req. 1' }
  ]);

  const pushToast = useCallback((type, msg) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  useEffect(() => {
    const d = new Date();
    const localDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setTodayDate(localDate);

    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`/api/products`);
        setCatalog(response.data);
      } catch (error) {
        console.error("Error fetching catalog", error);
        pushToast('err', 'Could not load price catalog.');
      }
    };
    fetchCatalog();
  }, [pushToast]);

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
    pushToast('ok', `${serviceName} added.`);
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

  const moveGroup = (groupId, dir) => {
    const order = [];
    lineItems.forEach(i => { if (!order.includes(i.groupId)) order.push(i.groupId); });
    const idx = order.indexOf(groupId);
    const swap = idx + dir;
    if (swap < 0 || swap >= order.length) return;
    [order[idx], order[swap]] = [order[swap], order[idx]];
    let rebuilt = [];
    order.forEach(gid => rebuilt.push(...lineItems.filter(i => i.groupId === gid)));
    let n = 0;
    rebuilt = rebuilt.map(i => (i.isMaster || i.isPending) ? { ...i, reqGroup: `Req. ${++n}` } : i);
    setLineItems(rebuilt);
  };

  const subTotal = lineItems.reduce((sum, item) => {
    if (item.isPending) return sum;
    return sum + (Number(item.instanceQty) * Number(item.partQty) * getPrice(item.metricName));
  }, 0);

  const vat = subTotal * 0.05;
  const grandTotal = subTotal + vat;
  const hasActiveItems = lineItems.some(item => !item.isPending);

  const handleGenerateBoQ = async () => {
    if (!orgName.trim()) return pushToast('err', 'Organization Name is mandatory.');
    const payloadItems = lineItems.filter(item => !item.isPending).map(item => ({ ...item, unitPrice: getPrice(item.metricName) }));
    if (payloadItems.length === 0) return pushToast('err', 'Add at least one valid requirement.');

    setIsGenerating(true);
    try {
      const response = await axios.post(`/api/quotes/generate`, {
        organizationName: orgName, quoteDate: todayDate, lineItems: payloadItems
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `${orgName}_BOQ.xlsx`);
      document.body.appendChild(link); link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      pushToast('ok', 'Excel BoQ generated.');
    } catch (error) {
      console.error("Error generating BoQ", error);
      pushToast('err', 'Generation failed. Check server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="brand-header">
        <img src="/logo.png" alt="BDCCL" className="brand-logo-img" />
        <div>
          <div className="brand-logo-text">Bangladesh Data Center Company Limited</div>
          <p className="brand-subtext">Bill of Quantities Generator &middot; ICT Tower (11th Floor), Agargaon, Dhaka-1207 &middot; +88-02-55006441</p>
        </div>
      </div>

      {/* Control panel */}
      <div className="panel control-panel">
        <div style={{ flex: '1 1 320px' }}>
          <label className="input-label">Organization Name <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input type="text" className="text-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Please Enter an Organization Name" />
        </div>
        <div style={{ width: '190px' }}>
          <label className="input-label">Quotation Date</label>
          <input type="text" className="text-input" value={todayDate} disabled />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-muted)', fontSize: '.85rem', fontWeight: 600, marginBottom: 10 }}>
          <LayoutGrid size={16} color="var(--teal-600)" />
          {lineItems.filter(i => i.isMaster).length} service{lineItems.filter(i => i.isMaster).length !== 1 ? 's' : ''} configured
        </div>
      </div>

      {/* Table */}
      <div className="server-card" style={{ overflowX: 'auto' }}>
        <table className="metric-table" style={{ minWidth: '1250px' }}>
          <thead>
            <tr>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '9%' }}>SL No.</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '22%', textAlign: 'left' }}>Service Name</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '8%' }}>Inst Qty</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '28%', textAlign: 'left' }}>Requirements/Metric</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '9%' }}>Part Qty</th>
              <th style={{ color: 'white', background: 'var(--teal-600)', border: '1px solid var(--teal-900)', width: '7%' }}>Req Qty</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '7%' }}>Usage Hrs</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '9%' }}>Unit Price</th>
              <th style={{ color: 'white', background: 'var(--teal-900)', border: '1px solid var(--teal-900)', width: '10%' }}>Total (BDT)</th>
              <th style={{ color: 'white', background: 'var(--teal-800)', border: '1px solid var(--teal-900)', width: '5%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => {

              if (item.isPending) {
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span className="chip">{item.reqGroup}</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      <Select
                        options={GROUPED_OPTIONS}
                        value={null}
                        onChange={(opt) => handleAddPredefinedService(opt.value, item.groupId)}
                        menuPortalTarget={document.body}
                        placeholder="Search & select a service..."
                        styles={selectStyles}
                      />
                    </td>
                    <td colSpan="7" style={{ borderRight: '1px solid #e2e8f0' }}></td>
                    <td style={{ padding: '10px', textAlign: 'center' }}><button className="remove-btn" onClick={() => removeItem(item.id)}><Trash2 size={16} /></button></td>
                  </tr>
                );
              }

              const groupItems = lineItems.filter(i => i.groupId === item.groupId);
              const masterItem = groupItems.find(i => i.isMaster) || item;
              const isLastInGroup = index === lineItems.length - 1 || lineItems[index + 1].groupId !== item.groupId;

              const isBastionOrCompute = masterItem.serverName.includes('Bastion') || masterItem.serverName.includes('Compute Instance');

              const hasAddMoreRow = isBastionOrCompute;
              const masterRowSpan = groupItems.length + (hasAddMoreRow ? 1 : 0);

              let showInstQty = false;
              let instRowSpan = 1;

              if (index === 0 || lineItems[index - 1].subGroupId !== item.subGroupId) {
                showInstQty = true;
                for (let i = index + 1; i < lineItems.length; i++) {
                  if (lineItems[i].subGroupId === item.subGroupId) instRowSpan++;
                  else break;
                }
                const lastIndexInSubGroup = index + instRowSpan - 1;
                const isLastInGroupForInst = lastIndexInSubGroup === lineItems.length - 1 || lineItems[lastIndexInSubGroup + 1].groupId !== item.groupId;
                if (isLastInGroupForInst && hasAddMoreRow) instRowSpan++;
              }

              const mandatoryCount = groupItems.filter(i => i.isMandatory).length;
              const actionRowSpan = Math.max(1, mandatoryCount);

              const hasPublicIP = groupItems.some(i => i.metricName === 'Public IP');
              const dynamicOptions = hasPublicIP ? CUSTOM_METRIC_OPTIONS.filter(o => o.value !== 'Public IP') : CUSTOM_METRIC_OPTIONS;
              const reqQty = Number(item.instanceQty) * Number(item.partQty);
              const price = getPrice(item.metricName);

              return (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: isLastInGroup && !hasAddMoreRow ? '2px solid #cbd5e1' : '1px solid #e2e8f0' }}>

                    {item.isMaster && (
                      <>
                        <td rowSpan={masterRowSpan} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>
                          <input type="text" className="text-input" style={{ width: '100%', padding: '6px', textAlign: 'center', fontWeight: 'normal' }} value={item.reqGroup} onChange={(e) => updateItem(item.id, 'reqGroup', e.target.value)} placeholder="Req." />
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                            <button className="move-btn" title="Move up" onClick={() => moveGroup(item.groupId, -1)}><ChevronUp size={16} /></button>
                            <button className="move-btn" title="Move down" onClick={() => moveGroup(item.groupId, 1)}><ChevronDown size={16} /></button>
                          </div>
                        </td>
                        <td rowSpan={masterRowSpan} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>
                          <textarea
                            className="text-input"
                            rows={item.serverName.length > 25 ? 2 : 1}
                            style={{ padding: '6px', fontWeight: 600, color: 'var(--teal-800)', width: '100%', resize: 'none', minHeight: '36px', height: 'auto', fontFamily: 'inherit', lineHeight: '1.4', overflow: 'hidden' }}
                            value={item.serverName}
                            onChange={(e) => updateItem(item.id, 'serverName', e.target.value)}
                          />
                        </td>
                      </>
                    )}

                    {showInstQty && (
                      <td rowSpan={instRowSpan} style={{ background: '#f1f5f9', verticalAlign: 'middle', padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <input type="number" className="text-input" style={{ padding: '6px', width: '100%', minWidth: '50px', textAlign: 'center', fontWeight: 'normal' }} value={item.instanceQty} onChange={(e) => updateSubGroupInstQty(item.subGroupId, e.target.value)} min="1" />
                      </td>
                    )}

                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                      {!item.isCustom ? (
                        <div style={{ fontWeight: 'normal', fontSize: '0.85rem', color: '#1e293b' }}>{item.metricName}</div>
                      ) : (
                        <Select options={dynamicOptions} value={item.metricName ? { label: item.metricName, value: item.metricName } : null} onChange={(opt) => updateItem(item.id, 'metricName', opt.value)} menuPortalTarget={document.body} placeholder="Select..." styles={selectStyles} />
                      )}
                    </td>

                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}><input type="number" className="text-input" style={{ padding: '6px', width: '100%', fontWeight: 'normal' }} value={item.partQty} onChange={(e) => updateItem(item.id, 'partQty', e.target.value)} min="1" /></td>
                    <td style={{ background: '#f0f7f7', fontWeight: 700, color: 'var(--teal-700)', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{reqQty}</td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}><input type="number" className="text-input" style={{ padding: '6px', width: '100%', fontWeight: 'normal' }} value={item.usageHours} onChange={(e) => updateItem(item.id, 'usageHours', e.target.value)} /></td>
                    <td style={{ fontWeight: 'normal', fontSize: '0.9rem', padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>{fmt(price)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--teal-800)', padding: '10px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>{fmt(reqQty * price)}</td>

                    {item.isMaster ? (
                      <td rowSpan={actionRowSpan} style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #e2e8f0' }}>
                        <button className="remove-btn" onClick={() => removeItem(item.id)} title="Delete Entire Package"><Trash2 size={18} /></button>
                      </td>
                    ) : (
                      !item.isMandatory && (
                        <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #e2e8f0' }}>
                          <button className="remove-btn" onClick={() => removeItem(item.id)} title="Delete Item"><Trash2 size={16} /></button>
                        </td>
                      )
                    )}
                  </tr>

                  {isLastInGroup && hasAddMoreRow && (
                    <tr key={`add-more-row-${item.groupId}`} style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '8px 12px', background: '#fafafa', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <button className="add-metric-btn" onClick={() => addSubItemToGroup(item.groupId)}>
                          <Plus size={14} /> Add other metric
                        </button>
                      </td>
                      <td colSpan="5" style={{ background: '#fafafa', borderRight: '1px solid #e2e8f0' }}></td>
                      <td style={{ background: '#fafafa' }}></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            <tr>
              <td colSpan="10" style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <button className="add-req-btn" onClick={addPendingRequirementRow}>
                  <Plus size={16} /> Add new requirement
                </button>
              </td>
            </tr>

            {!hasActiveItems && (
              <tr>
                <td colSpan="10">
                  <div className="empty-state">
                    <LayoutGrid size={40} color="var(--teal-500)" />
                    <h3>No services yet</h3>
                    <p>Pick a service from the dropdown above to start building the Bill of Quantities.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

{/* Totals dock */}
      {hasActiveItems && (
        <div className="totals-dock">
          <div className="dock-words"><strong>In Words:</strong> {toWordsBDT(grandTotal)}</div>
          <div className="dock-figures">
            <div className="dock-fig"><small>Subtotal / Month</small><b>{fmt(subTotal)}</b></div>
            <div className="dock-fig"><small>VAT (5%)</small><b>{fmt(vat)}</b></div>
            <div className="dock-fig grand"><small>Grand Total (BDT)</small><b>{fmt(grandTotal)}</b></div>
          </div>
        </div>
      )}

      {/* Generate button — last on page */}
      <div style={{ textAlign: 'center', marginTop: '28px', marginBottom: '40px' }}>
        <button className="btn btn-gold" onClick={handleGenerateBoQ} disabled={isGenerating} style={{ height: '52px', fontSize: '1.05rem', padding: '0 34px' }}>
          {isGenerating ? <><span className="spin" /> Generating…</> : <><FileSpreadsheet size={22} /> Generate Excel Output</>}
        </button>
      </div>

      <footer className="app-footer">
        Developed by <strong>Md Mazharul Islam</strong>, Assistant Manager (Cloud), BDCCL
        <span className="footer-links">
          <a href="https://www.linkedin.com/in/mazharul-i-tusar/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/mazharulmd" target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
      </footer>

    </div>
  );
}

export default App;
