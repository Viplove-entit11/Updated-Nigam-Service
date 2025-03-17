import "./App.css";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Navigate } from "react-router-dom";

// importing context
// import { useAuth } from "./Context/Context";

// importing pages
import AdminLogin from "./Pages/Admin Login/AdminLogin";
import MainPage from "./Pages/Main Page/MainPage";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./Context/Context";
import Loader from "./Components/Loader/Loader";
import Payment from "./Pages/Payment/Payment";

const App = () => {
  const { isAdminLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-loader"><Loader></Loader></div>; // Or your loading component
  }

  return (
    <div className="main-app">
      <Routes>
        <Route path="/admin-login" element={
          isAdminLoggedIn ? <Navigate to="/dashboard" replace /> : <AdminLogin />
        } />
        <Route path="/*" element={<MainPage />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;
