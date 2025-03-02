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
    setAllotedVendorDetails,
  } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch all service requests
  const fetchAllRequest = async (page = 1) => {
    try {
      const response = await fetch(
        `http://localhost:8081/get-requests?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch service requests.");

      const data = await response.json();
      setTotalRequestData(data.data);
      setTotalPages(data.totalPages);

      const initialAllotment = {};
      data.data.forEach((request) => {
        initialAllotment[request.service_id] = request.vendor_alloted || "";
      });
      setAllotedVendorDetails(initialAllotment);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast.error("Error fetching service requests.");
    }
  };

  // Fetch all vendor names
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
  }, [currentPage]);

  // Handle vendor selection change
  const handleVendorChange = (serviceId, vendorName) => {
    setAllotedVendorDetails((prev) => ({
      ...prev,
      [serviceId]: vendorName,
    }));
  };

  // Handle vendor allotment
  const handleAllotClick = async (serviceId) => {
    try {
      const vendorName = allotedVendorDetails[serviceId];
      if (!vendorName) {
        toast.error("Please select a vendor before allotting.");
        return;
      }

      const response = await fetch(
        "http://localhost:8081/service_status_update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: serviceId,
            status: 1,
            vendor_name: vendorName,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status.");

      toast.success("Vendor Allotted Successfully!");

      // ✅ Update totalRequestData to reflect the allotment immediately
      setTotalRequestData((prevData) =>
        prevData.map((request) =>
          request.service_id === serviceId
            ? { ...request, vendor_alloted: vendorName, status: 1 } // Update vendor name & status
            : request
        )
      );

    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error("Failed to allot vendor.");
    }
  };

  // Handle service status change
  const handleStatusChange = (serviceId, status) => {
    console.log(`Status changed for ${serviceId} to ${status}`);
    // Implement API call to update status here
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
            <th>Alloted Vendor</th>
            <th>Location</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Complete Status</th>
          </tr>
        </thead>
        <tbody>
          {totalRequestData.map((request) => (
            <tr key={request.id}>
              <td>{request.service_id}</td>
              <td>{request.userID}</td>
              <td>{request.service_description}</td>
              <td className="d-flex justify-content-center align-items-center">
                {request.vendor_alloted ? (
                  <span>{request.vendor_alloted}</span> // ✅ Show allotted vendor name
                ) : (
                  <>
                    <select
                      className="form-control"
                      value={allotedVendorDetails[request.service_id] || ""}
                      onChange={(event) =>
                        handleVendorChange(request.service_id, event.target.value)
                      }
                    >
                      <option value="">Select Vendor</option>
                      {vendorNameList.map((vendorName, index) => (
                        <option key={index} value={vendorName.name}>
                          {vendorName.name}
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn btn-primary"
                      onClick={() => handleAllotClick(request.service_id)}
                    >
                      Allot
                    </button>
                  </>
                )}
              </td>
              <td>{request.location}</td>
              <td>
                <span className={`badge ${
                  request.status === 0 ? "bg-warning text-dark" :
                  request.status === 1 ? "bg-primary" :
                  request.status === 2 ? "bg-success" :
                  request.status === 3 ? "bg-danger" : "bg-info text-dark"
                }`}>
                  {request.status === 0 ? "Pending" :
                   request.status === 1 ? "Allotted" :
                   request.status === 2 ? "Completed" :
                   request.status === 3 ? "Uncomplete/Closed" : "In Progress"}
                </span>
              </td>
              <td>{request.created_at}</td>
              <td>
                <select
                  className="form-control p-1"
                  onChange={(e) => handleStatusChange(request.service_id, e.target.value)}
                  disabled={!(request.status === 1 || request.status === 4)}
                >
                  <option value="">Set Status</option>
                  <option value="2">Complete</option>
                  <option value="3">Incomplete</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-buttons" style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: "10px",
          marginTop: "100px",
        }}>
        <button
          className="btn btn-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <span className="page-info">Page {currentPage} of {totalPages}</span>

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
