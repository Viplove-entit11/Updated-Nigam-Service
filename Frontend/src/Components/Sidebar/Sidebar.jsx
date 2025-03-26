import "./Sidebar.css";
import { Link } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { BiCheckCircle } from "react-icons/bi";
import { AiOutlineInbox } from "react-icons/ai";



const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <Link to="/dashboard"><FaHome  style={{fontSize:"20px", color:"grey"}}  />
        Dashboard</Link>
        <Link to="/VendorRegistration"><FaUsers style={{fontSize:"20px", color:"grey"}} />Vendor Registration</Link>
        <Link to="/total_request"><AiOutlineInbox style={{fontSize:"20px", color:"grey"}} />Total Request</Link>
        <Link to="/confirm_request"><BiCheckCircle style={{fontSize:"20px", color:"grey"}} />Confirm Request</Link>
        <Link to="/closed_request"><FaLock style={{fontSize:"20px", color:"grey"}} />Closed Request</Link>
      </ul>
    </div>
  );
};

export default Sidebar;
