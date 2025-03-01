import { toast } from "react-toastify";
import { useAuth } from "../../Context/Context";
import { useEffect, useState } from "react";
import "./ClosedRequest.css";

const ClosedRequest = () => {
  const { closedRequestList, setClosedRequestList } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of items per page

  // Fetching closed service requests with pagination
  const fetchAllClosedRequest = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:8081/get-closed-request?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch service requests.");

      const data = await response.json();
      setClosedRequestList(data.data);
      setTotalPages(data.totalPages || 1); // Ensuring at least 1 page
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast.error("Error fetching service requests.");
    }
  };

  useEffect(() => {
    fetchAllClosedRequest(currentPage);
  }, [currentPage]); // Runs when page changes

  return (
    <div className="total-request-div">
      <h6>Closed Requests</h6>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Service Id</th>
            <th>User Id</th>
            <th>Description</th>
            <th>Location</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {closedRequestList.length > 0 ? (
            closedRequestList.map((request) => (
              <tr key={request.id}>
                <td>{request.service_id}</td>
                <td>{request.userID}</td>
                <td>{request.service_description}</td>
                <td>{request.location || "N/A"}</td>
                <td>{request.status === 3 && <p className="closed-status">Closed</p> || "N/A"}</td>
                <td>{request.created_at ? new Date(request.created_at).toLocaleString() : "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", fontWeight: "bold" }}>No closed requests found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-buttons" style={{ display: "flex", justifyContent: "end", alignItems: "center", gap: "10px", marginTop: "20px" }}>
        <button
          className="btn btn-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>

        <span className="page-info" style={{ fontWeight: "500" }}>Page {currentPage} of {totalPages}</span>

        <button
          className="btn btn-primary"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClosedRequest;
