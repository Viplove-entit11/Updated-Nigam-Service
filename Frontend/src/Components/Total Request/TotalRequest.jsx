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
        `${
          import.meta.env.VITE_API_URL
        }get-requests?page=${page}&limit=${limit}`
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
      const response = await fetch(`${
          import.meta.env.VITE_API_URL
        }fetch_vendors_name`);
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
        `${
          import.meta.env.VITE_API_URL
        }service_status_update`,
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
        `${
          import.meta.env.VITE_API_URL
        }update-complete-status`,
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
        <h6 className="mb-4">All Service Requests</h6>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>User Name</th>
                <th>Description</th>
                <th>Alloted Vendor</th>
                <th>Location</th>
                <th>Status</th>
                <th>DD-MM-YY HH:MM</th>
                <th>Complete Status</th>
              </tr>
            </thead>
            <tbody>
              {totalRequestData.map((request) => (
                <tr key={request.service_id}>
                  <td>{request.service_id}</td>
                  <td>{request.username || "N/A"}</td>
                  <td>{request.service_description}</td>
                  <td>
                    {request.vendor_alloted ? (
                      <span className="vendor-name">
                        {request.vendor_alloted}
                      </span>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
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
                      </div>
                    )}
                  </td>
                  {/* google map link added here */}
                  <td>
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${request.street_address}, ${request.city}, ${request.state}, ${request.country}, ${request.pincode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Location
                </a>
            </td>
                  <td>
                    <span
                      className={`request_status ${
                        request.status === 0
                          ? "pending"
                          : request.status === 1
                          ? "alloted"
                          : request.status === 2
                          ? "completed"
                          : request.status === 3
                          ? "incompleted"
                          : request.status === 4
                          ? "inprogress"
                          : "closed-by-citizen"
                      }`}
                    >
                      {request.status === 0
                        ? "Pending"
                        : request.status === 1
                        ? "Allotted"
                        : request.status === 2
                        ? "Completed"
                        : request.status === 3
                        ? "Closed"
                        : request.status === 4
                        ? "In Progress"
                        : "Closed By Citizen"}
                    </span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleString()}</td>
                  <td>
                    {request.complete_status === 1 ? (
                      <span className="complete-status-completed">
                        Completed
                      </span>
                    ) : request.complete_status === 2 ? (
                      <span className="complete-status-incompleted">
                        Incomplete
                      </span>
                    ) : request.status === 5 ? (
                      <span className="complete-status-closed">
                        Closed by Citizen
                      </span>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <select
                          className="form-control"
                          value={statusChanges[request.service_id] || ""}
                          onChange={(e) =>
                            handleStatusChange(
                              request.service_id,
                              e.target.value
                            )
                          }
                          disabled={
                            !(request.status === 1 || request.status === 4) || request.status === 5
                          }
                        >
                          <option value="">Set Status</option>
                          <option value="2">Complete</option>
                          <option value="3">Incomplete</option>
                        </select>

                        {showUpdateButton[request.service_id] && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              handleUpdateStatus(
                                request.service_id,
                                request.userID
                              )
                            }
                          >
                            Update
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalRequestData.length > 0 && (
        <div className="pagination-buttons">
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
      )}
    </>
  );
};

export default TotalRequest;
