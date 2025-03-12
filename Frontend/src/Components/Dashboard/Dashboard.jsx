import { Link } from "react-router-dom";
import "./Dashboard.css";
import { FaUsers, FaTasks } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { AiOutlineFileDone } from "react-icons/ai";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Area,
} from "recharts";
import { useAuth } from "../../Context/Context";
import Loader from "../Loader/Loader";

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
    dashboardLoading,
    setDashboardLoading,
    isAdminLoggedIn
  } = useAuth();

  // State for monthly data
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        if (!isAdminLoggedIn) return;
        
        setDashboardLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}dashboard-stats`,
          {
            credentials: 'include'
          }
        );
        
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const statsData = await statsResponse.json();
        
        // Fetch monthly stats
        const monthlyResponse = await fetch(
          `${import.meta.env.VITE_API_URL}monthly-stats`,
          {
            credentials: 'include'
          }
        );

        if (!monthlyResponse.ok) {
          throw new Error("Failed to fetch monthly stats");
        }

        const monthlyData = await monthlyResponse.json();

        if (isMounted && statsData.success) {
          setVendorCount(statsData.data.total_active_vendors);
          settotalRequestCount(statsData.data.total_requests);
          setClosedRequestCount(statsData.data.closed_requests);
          setConfirmRequestCount(statsData.data.confirmed_requests);
          
          if (monthlyData.success) {
            setMonthlyData(monthlyData.data);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAdminLoggedIn]);

  // Data for request status distribution
  const requestStatusData = [
    { name: "Confirmed", value: confirmRequestCount, color: "#FFB347" },  // Pastel Orange
    { name: "Closed", value: closedRequestCount, color: "#008271" },     // Light Salmon
    { name: "Pending", value: totalRequestCount - (confirmRequestCount + closedRequestCount), color: "#299CDB" }  // Sunflower Yellow
  ];

  const chartStyles = {
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#333',
      textAlign: 'center',
      marginBottom: '20px'
    }
  };

  if (dashboardLoading) {
    return (
      <div style={{
        height: "500px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Loader />
      </div>
    );
  }

  const dashboardItems = [
    {
      label: "Total Vendors",
      value: vendorCount,
      icon: <FaUsers className="vendor-icon"/>,
      link: "/vendor_list",
    },
    {
      label: "Total Requests",
      value: totalRequestCount,
      icon: <FaTasks className="total-request-icon"/>,
      link: "/total_request",
    },
    {
      label: "Confirm Requests",
      value: confirmRequestCount,
      icon: <IoCheckmarkDoneCircleSharp className="confirm-request-icon" />,
      link: "/confirm_request",
    },
    {
      label: "Closed Requests",
      value: closedRequestCount,
      icon: <AiOutlineFileDone className="closed-request-icon" />,
      link: "/closed_request",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        {dashboardItems.map((item, index) => (
          <div key={index} className={`div${index + 1}`}>
            <div className="div-text mb-2">
              <span>{item.label}</span>
              <span className="dash-icon">{item.icon}</span>
            </div>
            <div className="div-value">
              <span>{item.value}</span>
            </div>
            <div className="div-link">
              <Link to={item.link}>Get {item.label}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-item">
          <h5 style={chartStyles.title}>Monthly Service Request Trends</h5>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#666', fontSize: 12 }}
                interval={0}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={{ stroke: '#E0E0E0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                name="Service Requests"
                stroke="#2196F3"
                strokeWidth={2}
                dot={{ fill: '#2196F3', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h5 style={chartStyles.title}>Request Status Overview</h5>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <Pie
                data={requestStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {requestStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} Requests`, name]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
