import "./App.css";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";

// importing context
// import { useAuth } from "./Context/Context";

// importing pages
import AdminLogin from "./Pages/Admin Login/AdminLogin";
import MainPage from "./Pages/Main Page/MainPage";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./Context/Context";

const App = () => {
  const { isAdminLoggedIn,} = useAuth();
  return (
    <div className="main-app">
      {!isAdminLoggedIn?<AdminLogin />:<MainPage />}
        <ToastContainer />
      </div>
  );
};

export default App;
