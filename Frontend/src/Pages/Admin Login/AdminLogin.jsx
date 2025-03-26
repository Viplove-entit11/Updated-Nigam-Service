import "./AdminLogin.css";
import AdminForm from "../../Components/Admin form/AdminForm";
import AdminNav from "../../Components/Admin Nav/AdminNav";

const AdminLogin = () => {
  return <div className="admin-login-page">
    <AdminNav></AdminNav>
    <AdminForm />
  </div>;
};

export default AdminLogin;
