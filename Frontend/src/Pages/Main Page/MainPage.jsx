import { Routes, Route } from "react-router-dom";
import ClosedRequest from "../../Components/Closed Request/ClosedRequest";
import ConfirmRequest from "../../Components/Confirm Request/ConfirmRequest";
import Dashboard from "../../Components/Dashboard/Dashboard";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import TotalRequest from "../../Components/Total Request/TotalRequest";
import VendorData from "../../Components/Vendor Data/VendorData";
import VendorDetails from "../../Components/Vendor Details/VendorDetails";
import { useAuth } from "../../Context/Context";
import "./MainPage.css";

const MainPage = () => {
  const { isAdminLoggedIn } = useAuth();

  return (
      <div className="main-page">
        <div className="main-sidebar">
          <Sidebar />
        </div>
        {isAdminLoggedIn && (
          <div className="main-content">
            <Navbar />
            {/* Nested Routes for Content Switching */}
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/VendorRegistration" element={<VendorDetails />} />
              <Route path="/vendor_list" element={<VendorData />} />
              <Route path="/total_request" element={<TotalRequest />} />
              <Route path="/confirm_request" element={<ConfirmRequest />} />
              <Route path="/closed_request" element={<ClosedRequest />} />
            </Routes>
          </div>
        )}
      </div>
  );
};

export default MainPage;
