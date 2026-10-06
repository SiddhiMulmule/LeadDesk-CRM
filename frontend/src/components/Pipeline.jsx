import { useMemo } from "react";
import { FaArrowRight, FaCalendarCheck, FaCheckCircle, FaFire, FaInbox } from "react-icons/fa";

const columns=[
  {key:"New",label:"New leads",desc:"Awaiting first contact",icon:FaInbox},
  {key:"Contacted",label:"In progress",desc:"Active conversations",icon:FaArrowRight},
  {key:"Closed",label:"Closed / won",desc:"Completed opportunities",icon:FaCheckCircle},
];

const initials=(name="")=>name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"L";

export default function Pipeline({leads=[]}){
  const groups=useMemo(()=>Object.fromEntries(columns.map(c=>[c.key,leads.filter(l=>l.status===c.key)])),[leads]);
  return <section className="pipeline">
    <div className="section-bar"><div><span>SALES PIPELINE</span><h2>Lifecycle command</h2><p>Click any opportunity to open its full profile.</p></div><b>{leads.length} total records</b></div>
    <div className="pipeline-grid">
      {columns.map(c=>{const Icon=c.icon;const list=groups[c.key]||[];return <div className="pipeline-column" key={c.key}>
        <div className="pipeline-head"><div><span className={`stage-icon ${c.key.toLowerCase()}`}><Icon/></span><div><b>{c.label}</b><small>{c.desc}</small></div></div><strong>{list.length}</strong></div>
        <div className="pipeline-list">
          {list.length?list.map(lead=><button className="pipeline-card" key={lead._id} onClick={()=>window.dispatchEvent(new CustomEvent("leaddesk:edit",{detail:lead}))}>
            <div className="pipeline-card-top"><span className="avatar">{initials(lead.name)}</span><span className={`priority-pill ${String(lead.priority||"Medium").toLowerCase()}`}>{lead.priority||"Medium"}{lead.priority==="High"&&<FaFire/>}</span></div>
            <strong className="pipeline-name">{lead.name}</strong><span className="pipeline-email">{lead.email}</span>
            <div className="pipeline-project"><span>{lead.projectType||"Other"}</span><b>{lead.budget||"Budget not set"}</b></div>
            <div className="pipeline-foot"><span>{lead.source||"Website"}</span>{lead.followUpDate?<span><FaCalendarCheck/>{new Date(lead.followUpDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span>:<span>Open profile →</span>}</div>
          </button>):<div className="pipeline-empty"><Icon/><b>No opportunities</b><small>Leads will appear here automatically.</small></div>}
        </div>
      </div>})}
    </div>
  </section>
}
