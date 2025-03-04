import { Link } from "react-router-dom";
import "./Dashboard.css";
import { FaUsers, FaTasks } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { AiOutlineFileDone } from "react-icons/ai";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"; 

import { useAuth } from "../../Context/Context";

const Dashboard = () => {
  const {
    vendorCount,
    setVendorCount,
    totalRequestCount,
    settotalRequestCount,
    confirmRequestCount,
    setConfirmRequestCount,
    closedRequestCount,
    setClosedRequestCount,
  } = useAuth();

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const response = await fetch("http://localhost:8081/dashboard-stats", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setVendorCount(data.data.total_active_vendors);
        settotalRequestCount(data.data.total_requests);
        setClosedRequestCount(data.data.closed_requests);
        setConfirmRequestCount(data.data.confirmed_requests);
      } catch (error) {
        console.log("Error fetching request count:", error);
      }
    };

    fetchRequestCount();
  }, []);

  const chartData = [
    { name: "Total Vendors", count: vendorCount },
    { name: "Total Requests", count: totalRequestCount },
    { name: "Confirmed Requests", count: confirmRequestCount },
    { name: "Closed Requests", count: closedRequestCount },
  ];

  const doughnutData = [
    { name: "Total Vendors", value: vendorCount },
    { name: "Total Requests", value: totalRequestCount },
    { name: "Confirmed Requests", value: confirmRequestCount },
    { name: "Closed Requests", value: closedRequestCount },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <div className="div1">
          <div className="div-text mb-2">
            <span>Total Vendors</span>
            <FaUsers className="dash-icon vendor-icon" />
          </div>
          <div className="div-value">
            <span>{vendorCount}</span>
          </div>
          <div className="div-link">
            <Link to="/vendor_list">Get Vendors</Link>
          </div>
        </div>

        <div className="div2">
          <div className="div-text mb-2">
            <span>Total Requests</span>
            <FaTasks className="dash-icon total-request-icon" />
          </div>
          <div className="div-value">
            <span>{totalRequestCount}</span>
          </div>
          <div className="div-link">
            <Link to="/total_request">Get Total Request</Link>
          </div>
        </div>

        <div className="div3">
          <div className="div-text mb-2">
            <span>Confirm Requests</span>
            <IoCheckmarkDoneCircleSharp className="dash-icon confirm-request-icon" />
          </div>
          <div className="div-value">
            <span>{confirmRequestCount}</span>
          </div>
          <div className="div-link">
            <Link to="/confirm_request">Get Confirm Request</Link>
          </div>
        </div>

        <div className="div4">
          <div className="div-text mb-2">
            <span>Closed Requests</span>
            <AiOutlineFileDone className="dash-icon closed-request-icon" />
          </div>
          <div className="div-value">
            <span>{closedRequestCount}</span>
          </div>
          <div className="div-link">
            <Link to="/closed_request">Get Closed Request</Link>
          </div>
        </div>
      </div>

      

      {/* Charts Container - Side by Side */}
      <div className="charts-container d-flex">
        {/* Bar Chart */}
        <div className="chart-item">
          <h5 style={{ fontWeight: "500"}}>Request Statistics</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doughnut Chart */}
        <div className="chart-item">
          <h5 style={{ fontWeight: "500"}}>Request Distribution</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={doughnutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {doughnutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
