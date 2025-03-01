import { toast } from "react-toastify";
import { useAuth } from "../../Context/Context";
import { useEffect, useState } from "react";
import "./TotalRequest.css";

const TotalRequest = () => {
  const {
    totalRequestData,
    setTotalRequestData,
    vendorNameList,
    setVendorNameList,
    allotedVendorDetails, 
    setAllotedVendorDetails
  } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of items per page

  // Fetching service requests with pagination
  const fetchAllRequest = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:8081/get-requests?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch service requests.");

      const data = await response.json();
      setTotalRequestData(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast.error("Error fetching service requests.");
    }
  };

  // Fetching vendor names
  const fetchAllVendorNames = async () => {
    try {
      const response = await fetch("http://localhost:8081/fetch_vendors_name");
      if (!response.ok) throw new Error("Failed to fetch vendors.");

      const data = await response.json();
      setVendorNameList(data.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Error fetching vendor names.");
    }
  };

  useEffect(() => {
    fetchAllRequest(currentPage);
    fetchAllVendorNames();
  }, [currentPage]); // 🔥 Re-fetch when page changes

  // Handle Vendor Selection
  const handleVendorChange = (serviceId, vendorName) => {
    setAllotedVendorDetails((prev) => ({
      ...prev,
      [serviceId]: vendorName,
    }));
  };

  // Handle Allotment
  const handleAllotClick = async (serviceId) => {
    try {
      const response = await fetch("http://localhost:8081/service_status_update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: serviceId, status: 1 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status.");

      toast.success("Vendor Allotted Successfully!");
      setTotalRequestData((prevData) =>
        prevData.map((request) =>
          request.service_id === serviceId ? { ...request, status: 1 } : request
        )
      );
    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error("Failed to allot vendor.");
    }
  };

  return (
    <div className="total-request-div">
      <h6>Service Requests</h6>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Service Id</th>
            <th>User Id</th>
            <th>Description</th>
            <th>Allot Vendor</th>
            <th>Location</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {totalRequestData.map((request) => (
            <tr key={request.id}>
              <td>{request.service_id}</td>
              <td>{request.userID}</td>
              <td>{request.service_description}</td>
              <td className="d-flex gap-4 align-items-center">
                <select
                  className="form-control"
                  value={allotedVendorDetails[request.service_id] || ""}
                  onChange={(event) => handleVendorChange(request.service_id, event.target.value)}
                  disabled={request.status === 1 || request.status == 2} // Disable if already allotted
                >
                  <option value="">Select Vendor</option>
                  {vendorNameList.map((vendorName, index) => (
                    <option key={index} value={vendorName.name}>
                      {vendorName.name}
                    </option>
                  ))}
                </select>

                {allotedVendorDetails[request.service_id] && request.status !== 1 && request.status !== 2 && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleAllotClick(request.service_id)}
                  >
                    Allot
                  </button>
                )}
              </td>

              <td>{request.location}</td>
              <td>
                {request.status === 0 && <span className="badge bg-warning text-dark">Pending</span>}
                {request.status === 1 && <span className="badge bg-primary">Allotted</span>}
                {request.status === 2 && <span className="badge bg-success">Completed</span>}
                {request.status === 3 && <span className="badge bg-danger">Uncomplete/Closed</span>}
                {request.status === 4 && <span className="badge bg-info text-dark">In Progress</span>}
              </td>
              <td>{request.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      <div className="pagination-buttons" style={{ display: "flex", justifyContent: "end", alignItems:"center", gap:"10px",  marginTop:"20px"}}>
        <button 
          className="btn btn-primary"
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        
        <span className="page-info" style={{fontWeight:"500"}}>Page {currentPage} of {totalPages}</span>

        <button 
          className="btn btn-primary"
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TotalRequest;
