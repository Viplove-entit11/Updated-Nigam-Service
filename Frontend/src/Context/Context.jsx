// resources/js/context/Context.jsx
import { createContext, useContext, useState } from "react";

// 1. Create Context
const AuthContext = createContext();

// 2. Create Provider Component
export const AuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // checking for whether the admin is logged in

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
  const [vendorNameList, setVendorNameList] = useState([])

  // alloted vendor name state from total request List 
  const [allotedVendorDetails, setAllotedVendorDetails] = useState({});

  // confirm request list data state
  const[confirmRequestList, setConfirmRequestList] = useState([]);

  // closed or uncomplete request list data state
  const[closedRequestList, setClosedRequestList] = useState([]);

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
        totalRequestData, setTotalRequestData,

        // vendor Name array state 
        vendorNameList, setVendorNameList,

        // alloted vendor name
        allotedVendorDetails, setAllotedVendorDetails,

        // confirm request List State
        confirmRequestList, setConfirmRequestList,

        // closed or uncomplete request List State
        closedRequestList, setClosedRequestList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
