// resources/js/context/Context.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate


// 1. Create Context
const AuthContext = createContext();

// 2. Create Provider Component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // Initialize navigate
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {

    // Check local storage for login state
    const savedLoginState = localStorage.getItem('isAdminLoggedIn');
    return savedLoginState === 'true'; // Return true if logged in
  }); // checking for whether the admin is logged in

  //   admin credential state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // vendor registration data state
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

  // Loader state 
  const [isLoading, setIsLoading] = useState(true);

  // useEffect for always to check isAdminLoggedIn
  useEffect(() => {
    // Persist login state to local storage
    localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn);
  }, [isAdminLoggedIn]);


  // function for logout functionality
  const logout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    navigate("/admin-login"); // Redirect to login page after logout
  };


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
      }}
    >
      {children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
