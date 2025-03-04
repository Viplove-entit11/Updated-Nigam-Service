import './Navbar.css'
import { useAuth } from '../../Context/Context';

import { FaCircleUser } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
    const {isAdminLoggedIn, setIsAdminLoggedIn, adminEmail,} = useAuth();

      // function for logout functionality
  const logout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    navigate("/admin-login"); // Redirect to login page after logout
  };

  return (
    <div className='content-navbar'>
        <div className='navbar-right'>
        <FaCircleUser id='admin-icon' />
        <p>Welcome, {adminEmail} !!</p>
        </div>

{/* navbar right  */}
<div className="navbar-right">
{isAdminLoggedIn && (
    <button className="btn btn-dark" onClick={logout}>Logout</button>
)}


</div>
    </div>
  )
}

export default Navbar
