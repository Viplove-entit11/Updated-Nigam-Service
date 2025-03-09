import { useAuth } from "../../Context/Context";
import "./AdminForm.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";


const AdminForm = () => {
  // navigation for navigating to a particular page or route
  const navigate = useNavigate();

  // state from context
  const {
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    setIsAdminLoggedIn,
    setIsLoading,
  } = useAuth();
  
  // function for handling admin login
  const handleAdminLoggin = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      if (!adminEmail || !adminPassword) {
        toast.error("Both email and password are required.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(import.meta.env.VITE_API_URL + "admin-login", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdminLoggedIn(true);
        toast.success("Admin Logged In Successfully");
        navigate("/dashboard");
      } else {
        setIsAdminLoggedIn(false);
        toast.error(data.message || "Admin Login Unsuccessful");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-form">

<FaUserAlt className="admin-icon"/>
{/* admin login form */}
      <form
        onSubmit={(event) => {
          handleAdminLoggin(event);
        }}
      >

        <div className="mb-3">
          <label htmlFor="adminMail" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="adminMail"
            aria-describedby="emailHelp"
            placeholder="Admin Email ID"
            onChange={(event) => {
              setAdminEmail(event.target.value);
            }}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="adminPassword" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="adminPassword"
            placeholder="Password"
            onChange={(event) => {
              setAdminPassword(event.target.value);
            }}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {"Submit"}
        </button>
      </form>



    </div>
  );
};

export default AdminForm;
