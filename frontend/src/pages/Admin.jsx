import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowUp, FaBolt, FaCalendarAlt, FaChartLine, FaDownload, FaFire, FaLayerGroup, FaRedo, FaUsers } from "react-icons/fa";
import API from "../services/api";
import SearchBar from "../components/SearchBar";
import LeadTable from "../components/LeadTable";
import Pipeline from "../components/Pipeline";
import "../styles/Admin.css";

const statusOrder=["New","Contacted","Closed"];

export default function Admin(){
  const [leads,setLeads]=useState([]);
  const [analytics,setAnalytics]=useState(null);
  const [loading,setLoading]=useState(true);
  const [filters,setFilters]=useState({q:"",status:"All",priority:"All",source:"All"});
  const [notice,setNotice]=useState(null);

  const notify=(type,message)=>{setNotice({type,message});setTimeout(()=>setNotice(null),2800);};

  const fetchAll=useCallback(async()=>{
    try{
      setLoading(true);
      const [leadRes,analyticsRes]=await Promise.all([
        API.get("/leads",{params:{search:filters.q,status:filters.status,priority:filters.priority,source:filters.source,limit:200}}),
        API.get("/leads/analytics")
      ]);
      setLeads(leadRes.data?.leads||[]);
      setAnalytics(analyticsRes.data?.analytics||null);
    }catch(err){notify("error",err.response?.data?.message||"Unable to load CRM data.");}
    finally{setLoading(false);}
  },[filters]);

  useEffect(()=>{const t=setTimeout(fetchAll,180);return()=>clearTimeout(t);},[fetchAll]);

  const stats=useMemo(()=>{
    const total=leads.length;
    const closed=leads.filter(x=>x.status==="Closed").length;
    const high=leads.filter(x=>x.priority==="High").length;
    const due=leads.filter(x=>x.followUpDate&&x.status!=="Closed"&&new Date(x.followUpDate).setHours(0,0,0,0)<=new Date().setHours(0,0,0,0)).length;
    const score=total?Math.round(leads.reduce((s,x)=>s+(x.leadScore||0),0)/total):0;
    return {total,closed,high,due,score,conversion:total?Math.round(closed/total*100):0};
  },[leads]);

  const greeting=(()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":h<21?"Good evening":"Good night";})();
  let user={};try{user=JSON.parse(localStorage.getItem("user")||"{}");}catch{}
  const first=user.name?.split(" ")[0]||"Admin";

  const exportCSV=()=>{
    if(!leads.length)return notify("error","No leads available to export.");
    const headers=["Name","Email","Project","Budget","Status","Priority","Source","Follow-up","Score"];
    const rows=leads.map(x=>[x.name,x.email,x.projectType,x.budget,x.status,x.priority,x.source,x.followUpDate?new Date(x.followUpDate).toLocaleDateString("en-IN"):"",x.leadScore]);
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    const a=document.createElement("a");a.href=url;a.download="leaddesk-crm-leads.csv";a.click();URL.revokeObjectURL(url);
    notify("success","Lead report exported.");
  };

  const reset=()=>setFilters({q:"",status:"All",priority:"All",source:"All"});

  return <div className="admin-page">
    {notice&&<div className={`toast ${notice.type}`}>{notice.type==="success"?"✓":"!"}<span>{notice.message}</span></div>}

    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="admin-kicker"><i/> CRM CONTROL CENTER</span>
          <h1>{greeting}, <strong>{first}</strong>.</h1>
          <p>One workspace for every enquiry, follow-up and conversion.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={fetchAll} title="Refresh"><FaRedo/></button>
          <button className="export-btn" onClick={exportCSV}><FaDownload/> Export report</button>
        </div>
      </header>

      <section className="kpi-grid">
        <Kpi icon={FaUsers} label="Total leads" value={stats.total} meta="All enquiries" accent="blue"/>
        <Kpi icon={FaChartLine} label="Conversion" value={`${stats.conversion}%`} meta={`${stats.closed} closed opportunities`} accent="violet"/>
        <Kpi icon={FaFire} label="High priority" value={stats.high} meta="Requires attention" accent="orange"/>
        <Kpi icon={FaCalendarAlt} label="Follow-ups due" value={stats.due} meta={stats.due?"Action required":"You're clear"} accent="cyan"/>
      </section>

      <section className="intelligence-row">
        <div className="score-ring"><div><strong>{analytics?.intelligence?.averageLeadScore||stats.score}</strong><small>/100</small></div></div>
        <div><span>LEAD INTELLIGENCE</span><h3>Average lead score</h3><p>Weighted from budget, priority, status and follow-up signals.</p></div>
        <div className="intel-stat"><small>HOT</small><b>{analytics?.intelligence?.hotLeads??0}</b></div>
        <div className="intel-stat"><small>WARM</small><b>{analytics?.intelligence?.warmLeads??0}</b></div>
        <div className="intel-stat"><small>COLD</small><b>{analytics?.intelligence?.coldLeads??0}</b></div>
      </section>

      <section className="analytics-grid">
        <div className="panel chart-panel">
          <PanelHead eyebrow="PIPELINE PERFORMANCE" title="Lead distribution" />
          <div className="bar-chart">
            {statusOrder.map(s=>{const n=analytics?.statusStats?.[s]??0;const max=Math.max(analytics?.total||1,1);return <div className="bar-item" key={s}><div className="bar-value">{n}</div><div className="bar-track"><i style={{height:`${Math.max(n/max*100,n?8:2)}%`}}/></div><span>{s}</span></div>})}
          </div>
        </div>
        <div className="panel source-panel">
          <PanelHead eyebrow="CHANNEL MIX" title="Where leads come from" />
          <div className="source-list">
            {Object.entries(analytics?.sourceStats||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,n])=><div className="source-row" key={name}><span>{name}</span><b>{n}</b><i><em style={{width:`${Math.min(100,n/(stats.total||1)*100)}%`}}/></i></div>)}
            {!Object.keys(analytics?.sourceStats||{}).length&&<div className="empty-mini">No channel data yet.</div>}
          </div>
        </div>
      </section>

      <Pipeline leads={leads}/>

      <section className="leads-panel panel">
        <div className="leads-head">
          <div><span className="panel-eyebrow">LEAD DIRECTORY</span><h2>All opportunities <b>{leads.length}</b></h2></div>
          <button className="reset-btn" onClick={reset}>Reset filters</button>
        </div>
        <div className="filter-row">
          <SearchBar value={filters.q} onChange={(q)=>setFilters({...filters,q})}/>
          <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option>All</option><option>New</option><option>Contacted</option><option>Closed</option></select>
          <select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
          <select value={filters.source} onChange={e=>setFilters({...filters,source:e.target.value})}><option>All</option><option>Website</option><option>Google</option><option>Referral</option><option>Instagram</option><option>LinkedIn</option><option>Facebook</option><option>WhatsApp</option><option>Other</option></select>
        </div>
        {loading?<div className="table-loading"><div className="loading-ring"/><span>Loading CRM records...</span></div>:<LeadTable leads={leads} refresh={fetchAll} notify={notify}/>}
      </section>
    </main>
  </div>
}

function Kpi({icon:Icon,label,value,meta,accent}){return <article className={`kpi ${accent}`}><div className="kpi-top"><span className="kpi-icon"><Icon/></span><small>LIVE</small></div><label>{label}</label><strong>{value}</strong><p>{meta}</p></article>}
function PanelHead({eyebrow,title}){return <div className="panel-head"><span>{eyebrow}</span><h3>{title}</h3></div>}
