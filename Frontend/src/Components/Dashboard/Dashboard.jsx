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
  const [pendingServices, setPendingServices] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [tableError, setTableError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [isVendorsLoading, setIsVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState(null);

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

  // Add new useEffect for pending services
  useEffect(() => {
    const fetchPendingServices = async () => {
      try {
        setIsTableLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}pending-services`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setPendingServices(data.data || []);
        } else {
          setTableError(data.message || 'Failed to fetch pending services');
        }
      } catch (err) {
        setTableError('Failed to fetch pending services');
        console.error('Error:', err);
      } finally {
        setIsTableLoading(false);
      }
    };

    if (isAdminLoggedIn) {
      fetchPendingServices();
    }
  }, [isAdminLoggedIn]);

  // Add new useEffect for vendors data
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsVendorsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}vendors_data`, {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Vendors API Response:', data);
        
        if (data.success) {
          console.log('Setting vendors data:', data.vendors);
          setVendors(data.vendors || []);
        } else {
          console.error('API Error:', data.message);
          setVendorsError(data.message || 'Failed to fetch vendors data');
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        setVendorsError('Failed to fetch vendors data');
      } finally {
        setIsVendorsLoading(false);
      }
    };

    if (isAdminLoggedIn) {
      fetchVendors();
    }
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
                tickFormatter={(value) => Math.round(value)}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px'
                }}
                formatter={(value) => [Math.round(value), "Service Requests"]}
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

      {/* Add Tables Section */}
      <div className="tables-section">
        {/* Pending Services Table */}
        <div className="table-container">
          <h4 className="table-title text-xl font-semibold">
            Pending Services
            <Link to="/total_request" className="header-link">
              View All <span>&rarr;</span>
            </Link>
          </h4>
          
          {isTableLoading ? (
            <div className="table-loading">
              <Loader />
            </div>
          ) : tableError ? (
            <div className="table-error">
              <p>{tableError}</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Service ID</th>
                    <th>Username</th>
                    <th>Contact</th>
                    <th>Description</th>
                    {/* <th>Location</th> */}
                    {/* <th>Status</th> */}
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingServices || pendingServices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No pending services found
                      </td>
                    </tr>
                  ) : (
                    pendingServices.map((service) => (
                      <tr key={service.service_id}>
                        <td>{service.service_id}</td>
                        <td>{service.username}</td>
                        <td>{service.contact}</td>
                        <td>{service.service_description}</td>
                        {/* <td>{service.location}</td> */}
                        {/* <td>
                          <span className={`dashboard-status-${service.status}`}>
                            {service.status === 0 ? 'Pending' : 'N/A'}
                          </span>
                        </td> */}
                        <td>{new Date(service.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Second Table */}
        <div className="table-container">
          <h4 className="table-title text-xl font-semibold">
            Vendors Information
            <Link to="/vendor_list" className="header-link">
              View All <span>&rarr;</span>
            </Link>
          </h4>
          {isVendorsLoading ? (
            <div className="table-loading">
              <Loader />
            </div>
          ) : vendorsError ? (
            <div className="table-error">
              <p>{vendorsError}</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Charges</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!vendors || vendors.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No vendors found (Length: {vendors ? vendors.length : 0})
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td>{vendor.name}</td>
                        <td>{vendor.contact_number}</td>
                        <td>₹{vendor.charges}</td>
                        <td>
                          <span className={`dashboard-status-${vendor.status}`}>
                            {vendor.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
