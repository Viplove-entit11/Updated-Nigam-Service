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
    isLoading,
    setIsLoading,
  } = useAuth();

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}dashboard-stats`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setVendorCount(data.data.total_active_vendors);
        settotalRequestCount(data.data.total_requests);
        setClosedRequestCount(data.data.closed_requests);
        setConfirmRequestCount(data.data.confirmed_requests);
      } catch (error) {
        console.error("Error fetching request count:", error);
      } finally {
        setIsLoading(false);
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

  const doughnutData = chartData.map(({ name, count }) => ({
    name,
    value: count,
  }));
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  if (isLoading) {
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

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        {[
          {
            label: "Total Vendors",
            value: vendorCount,
            icon: <FaUsers />,
            link: "/vendor_list",
          },
          {
            label: "Total Requests",
            value: totalRequestCount,
            icon: <FaTasks />,
            link: "/total_request",
          },
          {
            label: "Confirm Requests",
            value: confirmRequestCount,
            icon: <IoCheckmarkDoneCircleSharp />,
            link: "/confirm_request",
          },
          {
            label: "Closed Requests",
            value: closedRequestCount,
            icon: <AiOutlineFileDone />,
            link: "/closed_request",
          },
        ].map(({ label, value, icon, link }, index) => (
          <div key={index} className={`div${index + 1}`}>
            <div className="div-text mb-2">
              <span>{label}</span>
              <span className="dash-icon">{icon}</span>
            </div>
            <div className="div-value">
              <span>{value}</span>
            </div>
            <div className="div-link">
              <Link to={link}>Get {label}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-container d-flex">
        <div className="chart-item">
          <h5>Request Statistics</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h5>Request Distribution</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={doughnutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {doughnutData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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
