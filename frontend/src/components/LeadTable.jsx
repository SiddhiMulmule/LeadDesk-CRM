import { useEffect, useState } from "react";
import { FaCalendarAlt, FaClock, FaEnvelope, FaGlobe, FaMoneyBillWave, FaPen, FaStickyNote, FaTrash, FaUser, FaTimes, FaCheckCircle, FaArrowUp } from "react-icons/fa";
import API from "../services/api";

const initials=(name="")=>name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"L";
const fmtDate=(d)=>d?new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"Not set";

export default function LeadTable({leads=[],refresh,notify}){
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);
  const [deleting,setDeleting]=useState(false);

  const open=(lead)=>{setSelected(lead);setForm({status:lead.status||"New",priority:lead.priority||"Medium",source:lead.source||"Website",projectType:lead.projectType||"Other",budget:lead.budget||"",followUpDate:lead.followUpDate?lead.followUpDate.slice(0,10):"",notes:lead.notes||"",message:lead.message||""});};
  useEffect(()=>{const h=e=>e.detail&&open(e.detail);window.addEventListener("leaddesk:edit",h);return()=>window.removeEventListener("leaddesk:edit",h);},[]);
  const close=()=>{if(!saving&&!deleting)setSelected(null);};

  const save=async()=>{
    if(!selected)return;
    try{setSaving(true);await API.patch(`/leads/${selected._id}`,form);notify?.("success","Lead updated successfully.");setSelected(null);refresh();}catch(e){notify?.("error",e.response?.data?.message||"Unable to update lead.");}finally{setSaving(false);}
  };

  const remove=async()=>{
    if(!selected||!window.confirm(`Delete ${selected.name} from LeadDesk?`))return;
    try{setDeleting(true);await API.delete(`/leads/${selected._id}`);notify?.("success","Lead deleted.");setSelected(null);refresh();}catch(e){notify?.("error",e.response?.data?.message||"Unable to delete lead.");}finally{setDeleting(false);}
  };

  if(!leads.length)return <div className="empty-table"><div><FaInboxIcon/></div><h3>No leads match your filters</h3><p>Try clearing a filter or wait for a new enquiry.</p></div>;

  return <>
    <div className="table-wrap"><table><thead><tr><th>Lead</th><th>Opportunity</th><th>Budget</th><th>Source</th><th>Priority</th><th>Follow-up</th><th>Status</th><th/></tr></thead>
      <tbody>{leads.map(l=><tr key={l._id} onClick={()=>open(l)}>
        <td><div className="table-lead"><span className="avatar">{initials(l.name)}</span><div><b>{l.name}</b><small>{l.email}</small></div></div></td>
        <td><span className="project-chip">{l.projectType||"Other"}</span></td>
        <td className="budget-cell">{l.budget||"—"}</td>
        <td><span className="source-chip">{l.source||"Website"}</span></td>
        <td><span className={`priority-pill ${String(l.priority||"Medium").toLowerCase()}`}>{l.priority||"Medium"}</span></td>
        <td><span className="date-cell">{l.followUpDate?fmtDate(l.followUpDate):"—"}</span></td>
        <td><span className={`status-pill ${String(l.status).toLowerCase()}`}>{l.status}</span></td>
        <td><button className="row-edit" onClick={e=>{e.stopPropagation();open(l)}}><FaPen/></button></td>
      </tr>)}</tbody>
    </table></div>

    {selected&&<div className="modal-overlay" onMouseDown={close}>
      <div className="lead-modal" onMouseDown={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={close}><FaTimes/></button>
        <div className="modal-hero">
          <span className="modal-avatar">{initials(selected.name)}</span>
          <div><span className="modal-kicker">LEAD PROFILE</span><h2>{selected.name}</h2><p><FaEnvelope/> {selected.email}</p></div>
          <span className={`status-pill ${String(form.status).toLowerCase()}`}>{form.status}</span>
        </div>

        <div className="modal-stats">
          <Info icon={FaMoneyBillWave} label="Budget" value={selected.budget||"Not specified"}/>
          <Info icon={FaGlobe} label="Project" value={selected.projectType||"Other"}/>
          <Info icon={FaArrowUp} label="Lead score" value={`${selected.leadScore||0}/100`}/>
          <Info icon={FaCalendarAlt} label="Follow-up" value={fmtDate(selected.followUpDate)}/>
        </div>

        <div className="modal-content-grid">
          <div className="modal-main">
            <section className="modal-block"><span>PROJECT REQUIREMENT</span><p>{selected.message||"No requirement provided."}</p></section>
            <section className="modal-block"><span>LEAD MANAGEMENT</span>
              <div className="edit-grid">
                <Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>New</option><option>Contacted</option><option>Closed</option></select></Field>
                <Field label="Priority"><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></Field>
                <Field label="Source"><select value={form.source} onChange={e=>setForm({...form,source:e.target.value})}><option>Website</option><option>Google</option><option>Referral</option><option>Instagram</option><option>LinkedIn</option><option>Facebook</option><option>WhatsApp</option><option>Other</option></select></Field>
                <Field label="Project type"><select value={form.projectType} onChange={e=>setForm({...form,projectType:e.target.value})}>{["Business Website","E-commerce","Management System","Mobile Application","Web Application","Portfolio Website","Other"].map(x=><option key={x}>{x}</option>)}</select></Field>
                <Field label="Budget" full><select value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}>{["₹25,000 – ₹50,000","₹50,000 – ₹1,00,000","₹1,00,000 – ₹2,50,000","₹2,50,000 – ₹5,00,000","₹5,00,000+"].map(x=><option key={x}>{x}</option>)}</select></Field>
                <Field label="Follow-up date" full><input type="date" value={form.followUpDate} onChange={e=>setForm({...form,followUpDate:e.target.value})}/></Field>
                <Field label="Internal notes" full><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Internal follow-up note..."/></Field>
              </div>
            </section>
          </div>
          <aside className="timeline"><span>ACTIVITY TIMELINE</span>{selected.activities?.length?[...selected.activities].reverse().slice(0,8).map((a,i)=><div className="timeline-item" key={i}><i>{a.type==="status"?<FaCheckCircle/>:a.type==="note"?<FaStickyNote/>:<FaClock/>}</i><div><b>{a.message}</b><small>{new Date(a.createdAt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div></div>):<p>No activity recorded yet.</p>}</aside>
        </div>

        <div className="modal-actions"><button className="delete-btn" onClick={remove} disabled={deleting||saving}><FaTrash/> {deleting?"Deleting...":"Delete lead"}</button><div><button className="cancel-btn" onClick={close}>Cancel</button><button className="save-btn" onClick={save} disabled={saving||deleting}>{saving?"Saving...":"Save changes"}</button></div></div>
      </div>
    </div>}
  </>;
}

function Info({icon:Icon,label,value}){return <div className="modal-info"><span><Icon/></span><small>{label}</small><b>{value}</b></div>}
function Field({label,full,children}){return <label className={full?"edit-field full":"edit-field"}><span>{label}</span>{children}</label>}
function FaInboxIcon(){return <FaUser/>}
