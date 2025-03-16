import { useAuth } from "../../Context/Context";
import "./AdminForm.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";

const AdminForm = () => {
  const navigate = useNavigate();
  const {
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    setIsAdminLoggedIn,
    setIsLoading,
  } = useAuth();
  
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
    <div className="admin-page-container">
      <div className="admin-form">
        <div className="admin-icon">
          <FaUserAlt />
        </div>
        <form onSubmit={handleAdminLoggin}>
          <div className="input-group">
            <input
              type="email"
              id="adminMail"
              placeholder=" "
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <label htmlFor="adminMail">Email address</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              id="adminPassword"
              placeholder=" "
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <label htmlFor="adminPassword">Password</label>
          </div>

          {/* <div className="form-links">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#forgot-password">Forgot password?</a>
          </div> */}

          <button type="submit" className="btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
