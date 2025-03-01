import "./Sidebar.css";
import { Link } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { FaHome } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <Link to="/dashboard"><FaHome  style={{fontSize:"20px", color:"grey"}}  />
        Dashboard</Link>
        <Link to="/VendorRegistration"><FaUsers style={{fontSize:"20px", color:"grey"}} />Vendor Registration</Link>
      </ul>
    </div>
  );
};

export default Sidebar;
