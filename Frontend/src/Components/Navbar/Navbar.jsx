import './Navbar.css'
import { useAuth } from '../../Context/Context';
import { FaCircleUser } from "react-icons/fa6";

const Navbar = () => {
  const { isAdminLoggedIn, adminEmail, logout } = useAuth();

  return (
    <div className='content-navbar'>
      <div className='navbar-right'>
        <FaCircleUser id='admin-icon' />
        <p>Welcome, <span style={{fontWeight:"500"}}>{adminEmail}</span>!</p>
      </div>

      <div className="navbar-right">
        {isAdminLoggedIn && (
          <button className="btn btn-dark" onClick={logout}>Logout</button>
        )}
      </div>
    </div>
  )
}

export default Navbar
