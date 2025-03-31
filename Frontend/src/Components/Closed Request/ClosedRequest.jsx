import { toast } from "react-toastify";
import { useAuth } from "../../Context/Context";
import { useEffect, useState } from "react";
import "../Total Request/TotalRequest.css";  // Using the same CSS
import Loader from "../Loader/Loader";

const ClosedRequest = () => {
  const { closedRequestList, setClosedRequestList, closedRequestLoading, setClosedRequestLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchAllClosedRequest = async (page = 1) => {
    try {
      setClosedRequestLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}get-closed-request?page=${page}&limit=${limit}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch service requests.");
      }

      const data = await response.json();
      if (data.success) {
        setClosedRequestList(data.data);
        setTotalPages(Math.ceil(data.totalCount / limit));
      } else {
        toast.error(data.message || "Failed to fetch closed requests");
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast.error("Error fetching service requests.");
    } finally {
      setClosedRequestLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await fetchAllClosedRequest(currentPage);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  return (
    <div className="total-request-div">
      <h6 className="mb-4">Closed Service Requests</h6>

      {closedRequestLoading ? (
        <div className="loader-container" style={{display:"flex",justifyContent:"center", height:"60vh", alignItems:"center"}}>
          <Loader />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Service ID</th>
                  <th>User Name</th>
                  <th>Description</th>
                  {/* <th>Location</th> */}
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {closedRequestList.length > 0 ? (
                  closedRequestList.map((request) => (
                    <tr key={request.service_id}>
                      <td>{request.service_id}</td>
                      <td>{request.username || 'N/A'}</td>
                      <td>{request.service_description}</td>
                      {/* <td>{request.location || "N/A"}</td> */}
                      <td>
                        <span className="request_status incompleted">
                          Closed
                        </span>
                      </td>
                      <td>
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No closed requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {closedRequestList.length > 0 && (
            <div className="pagination-buttons">
              <button
                className="btn btn-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn btn-primary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClosedRequest;
