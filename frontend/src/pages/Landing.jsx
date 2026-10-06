import { Link } from "react-router-dom";
import { FaArrowRight, FaChartLine, FaCheckCircle, FaDatabase, FaLayerGroup, FaShieldAlt, FaUsers } from "react-icons/fa";
import LeadForm from "../components/LeadForm";
import "../styles/Landing.css";

const features = [
  ["01", FaUsers, "Lead Intelligence", "Centralize enquiries, contacts, requirements and commercial details in one workspace."],
  ["02", FaChartLine, "Pipeline Analytics", "See conversion, lead temperature, priorities and follow-ups without digging through records."],
  ["03", FaLayerGroup, "Lifecycle Control", "Move opportunities from New to Contacted to Closed while preserving every activity."],
  ["04", FaShieldAlt, "Secure Admin", "JWT-protected access, bcrypt credentials and a controlled administrator workspace."],
];

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-wrap">
          <div className="hero-copy">
            <span className="eyebrow"><i /> SMART LEAD MANAGEMENT PLATFORM</span>
            <h1>Every lead.<br /><span>One command center.</span></h1>
            <p>LeadDesk CRM gives businesses a focused workspace to capture enquiries, qualify opportunities, manage follow-ups and turn conversations into measurable growth.</p>
            <div className="hero-actions">
              <a href="#enquiry" className="btn-primary">Start an enquiry <FaArrowRight /></a>
              <Link to="/login" className="btn-ghost">Open Admin Portal</Link>
            </div>
            <div className="hero-proof">
              <span><FaCheckCircle /> Secure</span>
              <span><FaCheckCircle /> Analytics-ready</span>
              <span><FaCheckCircle /> MongoDB powered</span>
            </div>
          </div>

          <div className="hero-console">
            <div className="console-top"><span className="traffic"><i/><i/><i/></span><b>LeadDesk / Intelligence</b><span className="live"><i/> LIVE</span></div>
            <div className="console-body">
              <div className="console-heading"><div><small>CONTROL CENTER</small><h3>Pipeline overview</h3></div><span>Today • Real time</span></div>
              <div className="mini-kpis">
                <div><small>TOTAL LEADS</small><strong>1,248</strong><em>+18.4%</em></div>
                <div><small>CONVERSION</small><strong>32.8%</strong><em>+4.2%</em></div>
                <div><small>HOT LEADS</small><strong>186</strong><em>+12.1%</em></div>
              </div>
              <div className="fake-analytics">
                <div className="fake-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                <div className="fake-bars">{[34,52,44,69,58,81,73,92].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div>
              </div>
              <div className="console-pipeline">
                <span>NEW <b>124</b></span><span>CONTACTED <b>86</b></span><span>CLOSED <b>41</b></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-wrap">
          <div className="section-head"><span>BUILT FOR CONTROL</span><h2>A CRM that feels like a <strong>real product.</strong></h2><p>Not a spreadsheet with buttons. LeadDesk is structured around the actual workflow of a modern sales and service team.</p></div>
          <div className="feature-grid">
            {features.map(([num, Icon, title, text]) => <article className="feature-card" key={num}><span className="feature-num">{num}</span><div className="feature-icon"><Icon /></div><h3>{title}</h3><p>{text}</p><div className="feature-arrow"><FaArrowRight /></div></article>)}
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-wrap">
          <div className="section-head left"><span>THE WORKFLOW</span><h2>From first enquiry to <strong>closed opportunity.</strong></h2></div>
          <div className="workflow">
            {["Capture", "Qualify", "Follow up", "Convert"].map((x,i)=><div className="workflow-step" key={x}><span>0{i+1}</span><div><h3>{x}</h3><p>{["Customer submits project requirements through the public enquiry form.","Admin reviews budget, project type, priority and lead score.","Notes and follow-up dates keep every conversation accountable.","Status and analytics show what is converting into business."][i]}</p></div>{i<3 && <FaArrowRight />}</div>)}
          </div>
        </div>
      </section>

      <section className="enquiry-section" id="enquiry">
        <div className="section-wrap enquiry-layout">
          <div className="enquiry-copy">
            <span className="section-tag">START A PROJECT</span>
            <h2>Tell us what you're <strong>building.</strong></h2>
            <p>Submit a project requirement. It will enter the LeadDesk CRM instantly so an administrator can review, qualify and follow up.</p>
            <div className="enquiry-checks">
              <span><FaCheckCircle /> Requirement-first intake</span>
              <span><FaCheckCircle /> Budget-aware qualification</span>
              <span><FaCheckCircle /> Secure database storage</span>
              <span><FaCheckCircle /> Trackable follow-up</span>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <footer className="footer">
        <div><div className="footer-brand"><span><FaChartLine /></span><b>LeadDesk</b></div><p>CRM intelligence for modern businesses.</p></div>
        <div className="footer-links"><a href="#enquiry">Enquiry</a><Link to="/login">Admin Login</Link></div>
        <small>© {new Date().getFullYear()} LeadDesk CRM</small>
      </footer>
    </div>
  );
}
