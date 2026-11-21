import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></>,
  arrows: <><path d="M7 7h13l-3-3M20 7l-3 3M17 17H4l3 3M4 17l3-3"/></>,
  chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  water: <><path d="M12 2.7S5 10 5 14a7 7 0 0 0 14 0c0-4-7-11.3-7-11.3Z"/><path d="M9 15a3 3 0 0 0 3 3"/></>,
  filter: <><path d="M4 5h16M7 12h10m-7 7h4"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>
};
function Icon({name,size=18}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name] || icons.box}</svg>; }
const money = n => '₱' + Number(n || 0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateLabel = d => d ? new Date(d).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}) : '—';

async function api(path, token, options={}) {
  const response = await fetch('/api'+path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{ }), ...(options.headers||{})}
  });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}

function Login({onLogin}) {
  const [email,setEmail]=useState('admin@stockcore.test');
  const [password,setPassword]=useState('Admin123!');
  const [show,setShow]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { const result=await api('/login',null,{method:'POST',body:JSON.stringify({email,password})}); onLogin(result); }
    catch(err){setError(err.message);}
    finally{setBusy(false);}
  }
  return <div className="login-shell">
    <section className="login-visual">
      <div className="brand"><div className="brand-mark"><Icon name="water" size={25}/></div><div><b>SYNCORE</b><span>STOCKCORE</span></div></div>
      <div className="visual-copy"><span className="eyebrow">INVENTORY MANAGEMENT SYSTEM</span><h1>Every stock.<br/><em>In sync.</em></h1><p>Keep your inventory moving with clarity, control, and confidence.</p>
        <div className="visual-stats"><div><strong>01</strong><span>Monitor stock</span></div><div><strong>02</strong><span>Track movement</span></div><div><strong>03</strong><span>Make decisions</span></div></div>
      </div>
      <div className="visual-footer">SMARTER INVENTORY. BETTER OPERATIONS.</div>
      <div className="orb orb-one"/><div className="orb orb-two"/>
    </section>
    <section className="login-panel"><div className="login-card">
      <div className="mobile-brand"><div className="brand-mark"><Icon name="water"/></div><b>SYNCORE StockCore</b></div>
      <span className="eyebrow teal">WELCOME BACK</span><h2>Sign in to your workspace</h2><p className="muted">Enter your account details to continue.</p>
      <form onSubmit={submit}>
        <label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com" required/>
        <div className="password-label"><label>Password</label><button type="button" className="text-button" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div>
        <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/>
        {error && <div className="error-message">{error}</div>}
        <button className="primary-button login-button" disabled={busy}>{busy?'Signing in…':'Sign in'} <span>→</span></button>
      </form>
      <div className="login-hint"><b>Demo access</b><span>Admin: admin@stockcore.test / Admin123!</span><span>Staff: staff@stockcore.test / Staff123!</span></div>
      <p className="copyright">© 2026 SYNCORE StockCore. All rights reserved.</p>
    </div></section>
  </div>;
}

function App() {
  const [auth,setAuth]=useState(()=>{try{return JSON.parse(localStorage.getItem('stockcore-auth')||'null')}catch{return null}});
  const [page,setPage]=useState('Overview');
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [products,setProducts]=useState([]);
  const [dashboard,setDashboard]=useState({});
  const [transactions,setTransactions]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [modal,setModal]=useState('');
  const [editing,setEditing]=useState(null);
  const [toast,setToast]=useState('');

  const notify=msg=>{setToast(msg);window.setTimeout(()=>setToast(''),2600)};
  const refresh=useCallback(async()=>{
    if(!auth?.token)return;
    setLoading(true);setError('');
    try{
      const [p,d,t]=await Promise.all([api('/products',auth.token),api('/dashboard',auth.token),api('/transactions',auth.token)]);
      setProducts(p);setDashboard(d);setTransactions(t);
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  },[auth]);
  useEffect(()=>{if(auth?.token)refresh();},[auth,refresh]);
  useEffect(()=>{if(auth?.token)localStorage.setItem('stockcore-auth',JSON.stringify(auth));else localStorage.removeItem('stockcore-auth');},[auth]);
  const filtered=useMemo(()=>products.filter(p=>`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase())),[products,query]);
  function login(result){setAuth(result);setPage('Overview');}
  async function logout(){try{await api('/logout',auth.token,{method:'POST'});}catch{}setAuth(null);}
  async function saveProduct(e){
    e.preventDefault();const form=new FormData(e.currentTarget);
    const body=Object.fromEntries(form.entries());['quantity','reorder_level','unit_price'].forEach(k=>body[k]=Number(body[k]));
    try{await api(editing?`/products/${editing.id}`:'/products',auth.token,{method:editing?'PUT':'POST',body:JSON.stringify(body)});setModal('');setEditing(null);await refresh();notify(editing?'Product updated':'Product added');}
    catch(e){setError(e.message);}
  }
  async function saveTransaction(e){
    e.preventDefault();const body=Object.fromEntries(new FormData(e.currentTarget).entries());body.product_id=Number(body.product_id);body.quantity=Number(body.quantity);
    try{await api('/transactions',auth.token,{method:'POST',body:JSON.stringify(body)});setModal('');await refresh();notify('Stock transaction recorded');}
    catch(e){setError(e.message);}
  }
  async function deleteProduct(id){
    if(!window.confirm('Delete this product? This cannot be undone.'))return;
    try{await api(`/products/${id}`,auth.token,{method:'DELETE'});await refresh();notify('Product deleted');}
    catch(e){setError(e.message);}
  }
  if(!auth?.token)return <Login onLogin={login}/>;

  const nav=[['Overview','grid'],['Inventory','box'],['Stock Transactions','arrows'],['Analytics','chart']];
  const isAdmin=auth.user?.role==='admin';
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'open':''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><Icon name="water" size={23}/></div><div><b>SYNCORE</b><span>STOCKCORE</span></div><button className="close-sidebar" onClick={()=>setSidebarOpen(false)}><Icon name="close"/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(([label,icon])=><button key={label} className={`nav-item ${page===label?'active':''}`} onClick={()=>{setPage(label);setSidebarOpen(false);}}><Icon name={icon}/><span>{label}</span>{label==='Inventory'&&<small>{products.length}</small>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Icon name="water"/></div><b>Stock under control</b><p>Stay on top of every item and movement.</p></div>
        <div className="profile"><div className="avatar">{(auth.user?.name||'U').split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div className="profile-info"><b>{auth.user?.name}</b><span>{auth.user?.role||'staff'}</span></div><button title="Sign out" onClick={logout}><Icon name="logout"/></button></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="menu-button" onClick={()=>setSidebarOpen(true)}><Icon name="menu"/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><div className="date-chip">{new Date().toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'})}</div><button className="icon-button" title="Notifications"><Icon name="bell"/><i/></button><div className="top-avatar">{(auth.user?.name||'U')[0]}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><span className="eyebrow teal">SYNCORE STOCKCORE</span><h1>{page==='Overview'?'Inventory overview':page}</h1><p>{page==='Overview'?'Here’s what’s happening with your inventory today.':page==='Inventory'?'Manage and monitor every item in your stock.':page==='Analytics'?'A clear view of your stock health and inventory value.':'Review every stock-in and stock-out movement.'}</p></div>
          {page==='Inventory'&&<button className="primary-button" onClick={()=>{setEditing(null);setModal('product')}}><Icon name="plus"/> Add product</button>}
          {page==='Stock Transactions'&&<button className="primary-button" onClick={()=>setModal('transaction')}><Icon name="plus"/> Record movement</button>}
        </div>
        {error&&<div className="error-banner">{error}<button onClick={()=>setError('')}>Dismiss</button></div>}
        {loading&&<div className="loading-line">Updating inventory…</div>}
        {page==='Overview'&&<Overview dashboard={dashboard} products={products} transactions={transactions} onInventory={()=>setPage('Inventory')} onTransactions={()=>setPage('Stock Transactions')}/>}
        {page==='Inventory'&&<Inventory products={filtered} query={query} setQuery={setQuery} onEdit={p=>{setEditing(p);setModal('product')}} onDelete={deleteProduct} isAdmin={isAdmin}/>}
        {page==='Stock Transactions'&&<Transactions transactions={transactions} products={products}/>}
        {page==='Analytics'&&<Analytics dashboard={dashboard} products={products}/>}
      </div>
      <footer className="app-footer">SYNCORE StockCore <span>•</span> Inventory Management System <span className="footer-right">Built for smarter stock decisions</span></footer>
    </main>
    {sidebarOpen&&<div className="scrim" onClick={()=>setSidebarOpen(false)}/>}
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('')}}><div className="modal">
      <div className="modal-head"><div><span className="eyebrow teal">{modal==='product'?'INVENTORY':'STOCK MOVEMENT'}</span><h2>{modal==='product'?(editing?'Edit product':'Add new product'):'Record stock movement'}</h2></div><button className="icon-button" onClick={()=>setModal('')}><Icon name="close"/></button></div>
      {modal==='product'?<form className="modal-form" onSubmit={saveProduct}>
        <div className="form-grid"><div><label>Product name</label><input name="name" defaultValue={editing?.name||''} required/></div><div><label>SKU</label><input name="sku" defaultValue={editing?.sku||''} required/></div>
        <div><label>Category</label><input name="category" defaultValue={editing?.category||'General'}/></div><div><label>Unit</label><input name="unit" defaultValue={editing?.unit||'pcs'}/></div>
        <div><label>Quantity</label><input name="quantity" type="number" min="0" defaultValue={editing?.quantity??0} required/></div><div><label>Reorder level</label><input name="reorder_level" type="number" min="0" defaultValue={editing?.reorder_level??10} required/></div>
        <div className="full"><label>Unit price (₱)</label><input name="unit_price" type="number" step="0.01" min="0" defaultValue={editing?.unit_price??0} required/></div></div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal('')}>Cancel</button><button className="primary-button">{editing?'Save changes':'Add product'}</button></div>
      </form>:<form className="modal-form" onSubmit={saveTransaction}>
        <div><label>Product</label><select name="product_id" required defaultValue=""><option value="" disabled>Select a product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.quantity} {p.unit} available</option>)}</select></div>
        <div className="form-grid"><div><label>Movement type</label><select name="type"><option value="stock_in">Stock in</option><option value="stock_out">Stock out</option></select></div><div><label>Quantity</label><input name="quantity" type="number" min="1" required/></div>
        <div className="full"><label>Reference number</label><input name="reference" placeholder="e.g. PO-2026-001"/></div><div className="full"><label>Notes</label><textarea name="notes" rows="3" placeholder="Optional details…"/></div></div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal('')}>Cancel</button><button className="primary-button">Save transaction</button></div>
      </form>}
    </div></div>}
    {toast&&<div className="toast"><Icon name="check"/>{toast}</div>}
  </div>;
}

function StatCard({label,value,detail,icon,tone}){return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} size={20}/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>}
function Overview({dashboard:d,products,onInventory,onTransactions,transactions}){
 const max=Math.max(1,...products.map(p=>Number(p.quantity)));
 return <><div className="stats-grid">
  <StatCard label="Total products" value={d.total_products??products.length} detail="Active inventory items" icon="box" tone="blue"/>
  <StatCard label="Units in stock" value={Number(d.total_units||0).toLocaleString()} detail="Across all products" icon="arrows" tone="teal"/>
  <StatCard label="Low stock alerts" value={d.low_stock??0} detail="Items need attention" icon="bell" tone="orange"/>
  <StatCard label="Inventory value" value={money(d.inventory_value)} detail="Estimated stock value" icon="chart" tone="purple"/>
 </div>
 <div className="dashboard-grid"><section className="panel stock-panel"><div className="panel-heading"><div><h3>Stock levels</h3><p>Current quantity by product</p></div><button className="link-button" onClick={onInventory}>View inventory →</button></div>
  {products.slice(0,6).map(p=><div className="stock-row" key={p.id}><div className="product-initial">{p.name?.[0]}</div><div className="stock-name"><b>{p.name}</b><span>{p.sku}</span></div><div className="stock-meter"><div><span style={{width:`${Math.min(100,(p.quantity/max)*100)}%`,background:p.quantity<=p.reorder_level?'#e69a4a':'#1ba89b'}}/></div></div><div className="stock-count"><b>{p.quantity}</b><span>{p.unit}</span></div></div>)}
  {!products.length&&<Empty text="No products yet. Add your first inventory item."/>}
 </section>
 <section className="panel low-panel"><div className="panel-heading"><div><h3>Needs attention</h3><p>At or below reorder level</p></div><span className="alert-count">{d.low_stock||0}</span></div>
 {products.filter(p=>Number(p.quantity)<=Number(p.reorder_level)).slice(0,5).map(p=><div className="alert-row" key={p.id}><div className="alert-dot"/><div><b>{p.name}</b><span>{p.quantity} left · reorder at {p.reorder_level}</span></div><span className="low-tag">Low</span></div>)}
 {!products.some(p=>Number(p.quantity)<=Number(p.reorder_level))&&<div className="all-good"><span>✓</span><b>All stock levels look good</b><p>No products are below their reorder level.</p></div>}
 </section></div>
 <section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent stock movements</h3><p>Latest inventory activity</p></div><button className="link-button" onClick={onTransactions}>View all →</button></div><TransactionTable rows={transactions.slice(0,5)}/></section>
 </>;
}
function Empty({text}){return <div className="empty-state">{text}</div>}
function Inventory({products,query,setQuery,onEdit,onDelete,isAdmin}){
 return <section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, SKU or category…"/></div><span className="result-count">{products.length} items</span></div>
 <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>QUANTITY</th><th>UNIT PRICE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
 {products.map(p=><tr key={p.id}><td><div className="table-product"><div className="product-initial">{p.name?.[0]}</div><b>{p.name}</b></div></td><td className="mono">{p.sku}</td><td>{p.category}</td><td><b>{p.quantity}</b> <span className="muted">{p.unit}</span></td><td>{money(p.unit_price)}</td><td><span className={`status ${p.quantity<=p.reorder_level?'status-low':'status-good'}`}>{p.quantity<=p.reorder_level?'Low stock':'In stock'}</span></td><td><div className="action-group"><button onClick={()=>onEdit(p)}>Edit</button>{isAdmin&&<button className="danger-link" onClick={()=>onDelete(p.id)}>Delete</button>}</div></td></tr>)}
 {!products.length&&<tr><td colSpan="7"><Empty text="No matching products found."/></td></tr>}
 </tbody></table></div>
 </section>;
}
function TransactionTable({rows}){return <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>TYPE</th><th>QUANTITY</th><th>REFERENCE</th><th>DATE</th><th>RECORDED BY</th></tr></thead><tbody>
 {rows.map(r=><tr key={r.id}><td><b>{r.product_name||`Product #${r.product_id}`}</b></td><td><span className={`movement ${r.type==='stock_in'?'in':'out'}`}>{r.type==='stock_in'?'↑ Stock in':'↓ Stock out'}</span></td><td><b>{r.quantity}</b></td><td className="mono">{r.reference||'—'}</td><td>{dateLabel(r.created_at)}</td><td>{r.user_name||'—'}</td></tr>)}
 {!rows.length&&<tr><td colSpan="6"><Empty text="No stock transactions recorded yet."/></td></tr>}
 </tbody></table></div>}
function Transactions({transactions}){return <section className="panel table-panel"><div className="panel-heading inside"><div><h3>Transaction history</h3><p>All recorded stock-in and stock-out movements</p></div><span className="result-count">{transactions.length} records</span></div><TransactionTable rows={transactions}/></section>}
function Analytics({dashboard:d,products}){
 const categories=Object.values(products.reduce((a,p)=>{a[p.category]=(a[p.category]||0)+Number(p.quantity);return a;},{}));
 const names=Object.keys(products.reduce((a,p)=>{a[p.category]=(a[p.category]||0)+Number(p.quantity);return a;},{}));
 const total=categories.reduce((a,b)=>a+b,0)||1;
 return <><div className="stats-grid"><StatCard label="Inventory value" value={money(d.inventory_value)} detail="Total estimated value" icon="chart" tone="purple"/><StatCard label="Product categories" value={names.length} detail="Distinct categories" icon="box" tone="blue"/><StatCard label="Stock availability" value={`${Math.max(0,products.length-(d.low_stock||0))} / ${products.length}`} detail="Products above reorder level" icon="check" tone="teal"/><StatCard label="Low stock items" value={d.low_stock||0} detail="Require replenishment" icon="bell" tone="orange"/></div>
 <div className="analytics-grid"><section className="panel"><div className="panel-heading"><div><h3>Stock distribution</h3><p>Units by product category</p></div></div>
 {names.map((n,i)=><div className="category-bar" key={n}><div><b>{n}</b><span>{categories[i].toLocaleString()} units</span></div><div className="bar-track"><span style={{width:`${categories[i]/total*100}%`}}/></div></div>)}
 {!names.length&&<Empty text="Add products to see category analytics."/>}</section>
 <section className="panel value-card"><span className="eyebrow teal">INVENTORY SNAPSHOT</span><h3>Your stock at a glance</h3><div className="snapshot-number">{Number(d.total_units||0).toLocaleString()} <small>units</small></div><p>Total available quantity across your inventory.</p><div className="snapshot-divider"/><div className="snapshot-line"><span>Inventory items</span><b>{d.total_products||0}</b></div><div className="snapshot-line"><span>Items needing reorder</span><b className="orange-text">{d.low_stock||0}</b></div><div className="snapshot-line"><span>Estimated value</span><b>{money(d.inventory_value)}</b></div></section></div></>;
}
export default App;
