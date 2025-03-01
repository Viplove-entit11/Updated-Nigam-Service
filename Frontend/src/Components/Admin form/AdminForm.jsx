import { useAuth } from '../../Context/Context';
import './AdminForm.css'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminForm = () => {
    const navigate = useNavigate();
    const {adminEmail, setAdminEmail,
        adminPassword, setAdminPassword, setIsAdminLoggedIn} =useAuth();


        const handleAdminLoggin = (event) =>{
            event.preventDefault()
            console.log("Admin email:", adminEmail)
            console.log("Admin Password:",adminPassword);

            if(adminEmail === 'admin@gmail.com')
            {
                if(adminPassword === 'admin'){
                    localStorage.setItem('Admin Email', adminEmail);
                    setIsAdminLoggedIn(true);
                    toast.success('Admin Logged In Successfully');
                    navigate("/dashboard")
                }
            }
            else {
                setIsAdminLoggedIn(false);
                toast.success('Admin Logged In Unsuccessfull');
            }

        }


  return (
    <div className="admin-form">
      <form onSubmit={(event) => {handleAdminLoggin(event)}}>
        <div className="mb-3">
          <label htmlFor="adminMail" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="adminMail"
            aria-describedby="emailHelp"
            placeholder='Admin Email ID'
            onChange={(event)=>{setAdminEmail(event.target.value)}}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="adminPassword" className="form-label">
            Password
          </label>
          <input type="password" className="form-control" id="adminPassword" placeholder='Password'onChange={(event)=>{setAdminPassword(event.target.value)}} />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AdminForm;
