import { Link } from "react-router-dom";
import "./Dashboard.css";
import { FaUsers } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { AiOutlineFileDone } from "react-icons/ai";
import { useEffect } from "react";
import { useAuth } from "../../Context/Context";


const Dashboard = () => {


  const {vendorCount,
    setVendorCount,
    totalRequestCount,
    settotalRequestCount,
    confirmRequestCount,
    setConfirmRequestCount,
    closedRequestCount,
    setClosedRequestCount
    } = useAuth();

    // state for request count
    useEffect(() => {
      const fetchRequestCount = async () => {
        try {
          const response = await fetch('http://localhost:8081/dashboard-stats', {
            method: 'GET',
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          console.log("Data :", data.data)
          setVendorCount(data.data.total_active_vendors)
          settotalRequestCount(data.data.total_requests)
          setClosedRequestCount(data.data.closed_requests)
          setConfirmRequestCount(data.data.confirmed_requests)
   
        } catch (error) {
          console.log('Error fetching request count:', error);
        }
      };
  
      fetchRequestCount();
    }, []); 

    
  



  return (
    <div className="dashboard">
        {/* Number of vendors */}
      <div className="div1">
        {/* div text */}
        <div className="div-text mb-2">
          <span>Total Vendors</span>
          <FaUsers className="vendor-icon" />
        </div>
        {/* div value */}
        <div className="div-value">
          <span>{vendorCount}</span>
        </div>
        <div className="div-link">
          <Link to="/vendor_list">Get Vendors</Link>
        </div>
      </div>

      {/* Number of request */}
      <div className="div2">
        {/* div text */}
        <div className="div-text mb-2">
          <span>Total Requests</span>
          <FaTasks className="total-request-icon"/>
        </div>
        {/* div value */}
        <div className="div-value">
          <span>{totalRequestCount}</span>
        </div>
        <div className="div-link">
          <Link to="/total_request">Get Total Request</Link>
        </div>
      </div>

      {/* Number of confirm Request */}
      <div className="div3">
        {/* div text */}
        <div className="div-text mb-2">
          <span>Confirm Requests</span>
          <IoCheckmarkDoneCircleSharp className="confirm-request-icon"/>


        </div>
        {/* div value */}
        <div className="div-value">
          <span>{confirmRequestCount}</span>
        </div>
        <div className="div-link">
          <Link to="/confirm_request">Get Confirm Request</Link>
        </div>
      </div>

{/* Number of closed request */}
      <div className="div4">
        {/* div text */}
        <div className="div-text mb-2">
          <span>Closed Requests</span>
          <AiOutlineFileDone className="closed-request-icon"/>
          </div>
        {/* div value */}
        <div className="div-value">
          <span>{closedRequestCount}</span>
        </div>
        <div className="div-link">
          <Link to="/closed_request">Get Closed Request</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
