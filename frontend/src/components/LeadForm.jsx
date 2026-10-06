import { useState } from "react";
import { FaArrowRight, FaCheckCircle, FaEnvelope, FaProjectDiagram, FaUser, FaWallet } from "react-icons/fa";
import API from "../services/api";
import "../styles/Form.css";

const initial = { name:"", email:"", budget:"", projectType:"", source:"Website", message:"" };
const budgets = ["₹25,000 – ₹50,000","₹50,000 – ₹1,00,000","₹1,00,000 – ₹2,50,000","₹2,50,000 – ₹5,00,000","₹5,00,000+"];
const projects = ["Business Website","E-commerce","Management System","Mobile Application","Web Application","Portfolio Website","Other"];

export default function LeadForm() {
  const [form,setForm]=useState(initial);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);
  const [error,setError]=useState("");

  const change=(e)=>{setForm({...form,[e.target.name]:e.target.value});setError("");};

  const submit=async(e)=>{
    e.preventDefault();
    if(!form.name.trim()||!form.email.trim()||!form.budget||!form.projectType||form.message.trim().length<15){
      setError("Complete all required fields and provide at least 15 characters for requirements.");
      return;
    }
    try{
      setLoading(true);
      await API.post("/leads",{...form,name:form.name.trim(),email:form.email.trim().toLowerCase(),message:form.message.trim()});
      setSuccess(true);
      setForm(initial);
    }catch(err){setError(err.response?.data?.message||"Unable to submit enquiry right now.");}
    finally{setLoading(false);}
  };

  if(success) return <div className="lead-form success-form"><div className="success-mark"><FaCheckCircle/></div><span>ENQUIRY RECEIVED</span><h3>You're on the board.</h3><p>Your requirements have been securely added to LeadDesk. The team can now review and follow up.</p><button onClick={()=>setSuccess(false)}>Submit another enquiry <FaArrowRight/></button></div>;

  return <form className="lead-form" onSubmit={submit}>
    <div className="form-title"><div><span>PROJECT ENQUIRY</span><h3>Let's discuss your idea.</h3></div><FaArrowRight/></div>
    {error&&<div className="form-alert">{error}</div>}
    <div className="form-grid">
      <Field icon={FaUser} label="Full name"><input name="name" value={form.name} onChange={change} placeholder="Your name"/></Field>
      <Field icon={FaEnvelope} label="Email address"><input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com"/></Field>
      <Field icon={FaWallet} label="Budget range"><select name="budget" value={form.budget} onChange={change}><option value="">Select budget</option>{budgets.map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field icon={FaProjectDiagram} label="Project type"><select name="projectType" value={form.projectType} onChange={change}><option value="">Select project</option>{projects.map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="How did you hear about us?" full><select name="source" value={form.source} onChange={change}><option>Website</option><option>Google</option><option>Referral</option><option>Instagram</option><option>LinkedIn</option><option>Facebook</option><option>WhatsApp</option><option>Other</option></select></Field>
      <Field label="Project requirements" full><textarea name="message" value={form.message} onChange={change} placeholder="Tell us about the business, features, users, timeline or anything important..." rows="5"/></Field>
    </div>
    <div className="form-bottom"><small><i/> Information is securely stored in MongoDB.</small><button disabled={loading}>{loading?"Sending...":"Submit Enquiry"}{!loading&&<FaArrowRight/>}</button></div>
  </form>;
}

function Field({icon:Icon,label,full,children}){return <label className={full?"field full":"field"}><span>{Icon&&<Icon/>}{label}</span>{children}</label>;}
