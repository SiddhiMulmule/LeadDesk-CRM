import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-box">
      <FaSearch />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search name, email, project, budget..." />
      {value && <button onClick={() => onChange("")} aria-label="Clear search"><FaTimes /></button>}
    </div>
  );
}
