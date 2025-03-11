// resources/js/context/Context.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate


// 1. Create Context
const AuthContext = createContext();

// 2. Create Provider Component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [confirmRequestLoading, setConfirmRequestLoading] = useState(false);
  const [closedRequestLoading, setClosedRequestLoading] = useState(false);

  // Check authentication status on mount only
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      if (!isMounted) return;
      
      try {
        // Only verify if we think we're logged in
        if (window.location.pathname === '/admin-login') {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}verify-auth`, {
          credentials: 'include',
          // credentials: true,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setIsAdminLoggedIn(true);
            setAdminEmail(data.email);
          }
        } else {
          if (isMounted) {
            setIsAdminLoggedIn(false);
            setAdminEmail("");
            navigate('/admin-login');
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        if (isMounted) {
          setIsAdminLoggedIn(false);
          setAdminEmail("");
          navigate('/admin-login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}admin-logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsAdminLoggedIn(false);
        setAdminEmail("");
        navigate("/admin-login");
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //   admin credential state
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorCharges, setVendorCharges] = useState("");

  // Dashboard data
  const [vendorCount, setVendorCount] = useState(0);
  const [totalRequestCount, settotalRequestCount] = useState(0);
  const [confirmRequestCount, setConfirmRequestCount] = useState(0);
  const [closedRequestCount, setClosedRequestCount] = useState(0);

  // Total Request Data State
  const [totalRequestData, setTotalRequestData] = useState([]);

  // getting list of all vendor name
  const [vendorNameList, setVendorNameList] = useState([]);

  // alloted vendor name state from total request List
  const [allotedVendorDetails, setAllotedVendorDetails] = useState({});

  // confirm request list data state
  const [confirmRequestList, setConfirmRequestList] = useState([]);

  // closed or uncomplete request list data state
  const [closedRequestList, setClosedRequestList] = useState([]);

  // States for status update functionality
  const [statusChanges, setStatusChanges] = useState({});
  const [showUpdateButton, setShowUpdateButton] = useState({});
  const [currentStatusValue, setCurrentStatusValue] = useState({});

  return (

    <AuthContext.Provider
      value={{
        // IsAdminLoggedIn
        isAdminLoggedIn,
        setIsAdminLoggedIn,

        // Admin credential
        adminEmail,
        setAdminEmail,
        adminPassword,
        setAdminPassword,

        // vendor registration data
        vendorName,
        setVendorName,
        vendorContact,
        setVendorContact,
        vendorCharges,
        setVendorCharges,

        // dashboard data count
        vendorCount,
        setVendorCount,
        totalRequestCount,
        settotalRequestCount,
        confirmRequestCount,
        setConfirmRequestCount,
        closedRequestCount,
        setClosedRequestCount,

        // Total request data
        totalRequestData,
        setTotalRequestData,

        // vendor Name array state
        vendorNameList,
        setVendorNameList,

        // alloted vendor name
        allotedVendorDetails,
        setAllotedVendorDetails,

        // confirm request List State
        confirmRequestList,
        setConfirmRequestList,

        // closed or uncomplete request List State
        closedRequestList,
        setClosedRequestList,

        // state updates when got changed
        statusChanges,
        setStatusChanges,

        // state for displaying the update button
        showUpdateButton,
        setShowUpdateButton,

        // state for indicating current status value (complete / incomplete)
        currentStatusValue,
        setCurrentStatusValue,

        // logout function for logginout functionality
        logout,

        // isLoading State for rendering loader on true, 
        isLoading, setIsLoading,
        dashboardLoading,
        setDashboardLoading,
        confirmRequestLoading,
        setConfirmRequestLoading,
        closedRequestLoading,
        setClosedRequestLoading,
      }}
    >
      {children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
