import { toast } from "react-toastify";
import { useAuth } from "../../Context/Context";
import { useEffect, useState } from "react";
import "./TotalRequest.css";

const TotalRequest = () => {
  // context from Context Provider
  const {
    totalRequestData,
    setTotalRequestData,
    vendorNameList,
    setVendorNameList,
    allotedVendorDetails,
    setAllotedVendorDetails,
    statusChanges,
    setStatusChanges,
    showUpdateButton,
    setShowUpdateButton,
    setCurrentStatusValue,
  } = useAuth();

  // state for current page and total page for pagination.
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch all service requests
  const fetchAllRequest = async (page = 1) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}get-requests?page=${page}&limit=${limit}`
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

      // Initialize status changes and update button visibility for each request
      const initialStatusChanges = {};
      const initialShowUpdate = {};
      const initialStatusValues = {};

      data.data.forEach((request) => {
        initialStatusChanges[request.service_id] = "";
        initialShowUpdate[request.service_id] = false;
        initialStatusValues[request.service_id] = "";
      });

      setStatusChanges(initialStatusChanges);
      setShowUpdateButton(initialShowUpdate);
      setCurrentStatusValue(initialStatusValues);
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
      if (!response.ok)
        throw new Error(data.message || "Failed to update status.");

      toast.success("Vendor Allotted Successfully!");

      // Update totalRequestData to reflect the allotment immediately
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
    // Update status change state
    setStatusChanges((prev) => ({
      ...prev,
      [serviceId]: status,
    }));

    // Store the current status value for this service
    setCurrentStatusValue((prev) => ({
      ...prev,
      [serviceId]: status,
    }));

    // Show update button when status is selected
    setShowUpdateButton((prev) => ({
      ...prev,
      [serviceId]: status !== "",
    }));
  };

  // Handle update status button click
  const handleUpdateStatus = async (serviceId, userId) => {
    try {
      const selectedValue = statusChanges[serviceId];
      if (!selectedValue) {
        toast.error("Please select a status before updating.");
        return;
      }

      let confirmationStatus;
      if (selectedValue === "2") {
        confirmationStatus = "2"; // Completed
      } else if (selectedValue === "3") {
        confirmationStatus = "3"; // Uncomplete/Closed
      } else {
        toast.error("Invalid status selection");
        return;
      }

      const response = await fetch(
        "http://localhost:8081/update-complete-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            serviceId: serviceId,
            confirmationStatus: confirmationStatus,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update status.");

      toast.success("Status Updated Successfully!");

      // Re-fetch updated data after successful update
      fetchAllRequest(currentPage);

      // Hide update button after successful update
      setShowUpdateButton((prev) => ({
        ...prev,
        [serviceId]: false,
      }));

      // Reset status change
      setStatusChanges((prev) => ({
        ...prev,
        [serviceId]: "",
      }));

      setCurrentStatusValue((prev) => ({
        ...prev,
        [serviceId]: "",
      }));
    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error("Failed to update status.");
    }
  };

  return (
    <>
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
                    <span>{request.vendor_alloted}</span> // Show allotted vendor name
                  ) : (
                    <>
                      <select
                        className="form-control"
                        value={allotedVendorDetails[request.service_id] || ""}
                        onChange={(event) =>
                          handleVendorChange(
                            request.service_id,
                            event.target.value
                          )
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
                  <span
                    className={`badge ${
                      request.status === 0
                        ? "request_status pending text-dark"
                        : request.status === 1
                        ? "request_status alloted"
                        : request.status === 2
                        ? "request_status completed"
                        : request.status === 3
                        ? "request_status incompleted"
                        : "request_status inproress text-dark"
                    }`}
                  >
                    {request.status === 0
                      ? "Pending"
                      : request.status === 1
                      ? "Allotted"
                      : request.status === 2
                      ? "Completed"
                      : request.status === 3
                      ? "Uncomplete/Closed"
                      : "In Progress"}
                  </span>
                </td>
                <td>{request.created_at}</td>
                <td className="d-flex justify-content-center align-items-center">
  {request.complete_status === 1 ? (
    <p className="complete-status-completed">
Completed
    </p>
    
  ) : request.complete_status === 2 ? (
    <p className="complete-status-incompleted">In-complete</p>
  ) : (
    <>
      <select
        className="form-control"
        value={statusChanges[request.service_id] || ""}
        onChange={(e) =>
          handleStatusChange(request.service_id, e.target.value)
        }
        disabled={!(request.status === 1 || request.status === 4)}
      >
        <option value="">Set Status</option>
        <option value="2">Complete</option>
        <option value="3">Incomplete</option>
      </select>

      {showUpdateButton[request.service_id] && (
        <button
          className="btn btn-primary ml-2"
          onClick={() =>
            handleUpdateStatus(request.service_id, request.userID)
          }
        >
          Update
        </button>
      )}
    </>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* div for pagination display. */}
      <div
        className="pagination-buttons"
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: "10px",
          padding: "10px 20px",
        }}
      >
        <button
          className="btn btn-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="btn btn-primary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default TotalRequest;
