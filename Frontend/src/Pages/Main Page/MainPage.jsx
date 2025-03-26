import { Routes, Route } from "react-router-dom";
import ClosedRequest from "../../Components/Closed Request/ClosedRequest";
import ConfirmRequest from "../../Components/Confirm Request/ConfirmRequest";
import Dashboard from "../../Components/Dashboard/Dashboard";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import TotalRequest from "../../Components/Total Request/TotalRequest";
import VendorData from "../../Components/Vendor Data/VendorData";
import VendorDetails from "../../Components/Vendor Details/VendorDetails";
import ProtectedRoute from "../../Components/ProtectedRoute/ProtectedRoute";
import "./MainPage.css";
import NotFound from "../../Components/Not Found/NotFound";

const MainPage = () => {
  return (
    <div className="main-page">
      <ProtectedRoute>
        <>
          <div className="main-sidebar">
            <Sidebar />
          </div>
          <div className="main-content">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/VendorRegistration" element={<VendorDetails />} />
              <Route path="/vendor_list" element={<VendorData />} />
              <Route path="/total_request" element={<TotalRequest />} />
              <Route path="/confirm_request" element={<ConfirmRequest />} />
              <Route path="/closed_request" element={<ClosedRequest />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </div>
        </>
      </ProtectedRoute>
    </div>
  );
};

export default MainPage;
