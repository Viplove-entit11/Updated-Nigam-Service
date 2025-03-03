import { useAuth } from "../../Context/Context";
import "./AdminForm.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminForm = () => {
  const navigate = useNavigate();
  const {
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    setIsAdminLoggedIn,
    isLoading,
    setIsLoading,
  } = useAuth();

  const handleAdminLoggin = async (event) => {
    event.preventDefault();

    console.log("Admin email:", adminEmail);
    console.log("Admin Password:", adminPassword);

    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:8081/admin-login", {
        method: "POST",
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
        localStorage.setItem("Admin Email", adminEmail);
        localStorage.setItem("Admin ID", data.adminId);
        setIsAdminLoggedIn(true);
        toast.success("Admin Logged In Successfully");
        navigate("/dashboard");
      } else {
        setIsAdminLoggedIn(false);
        toast.error(data.message || "Admin Login Unsuccessful");
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="admin-form">
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
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {!isLoading?"Getting You In!!":"Submit"}
        </button>
      </form>
    </div>
  );
};

export default AdminForm;
