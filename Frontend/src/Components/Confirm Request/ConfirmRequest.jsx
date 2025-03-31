import { useEffect, useState } from "react";
import { useAuth } from "../../Context/Context";
import "../Total Request/TotalRequest.css";  // Using the same CSS
import Loader from "../Loader/Loader";

const ConfirmRequest = () => {
  const { setConfirmRequestList, confirmRequestLoading, setConfirmRequestLoading } = useAuth();
  const [confirmRequestList, setLocalConfirmRequestList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let isMounted = true;

    const getConfirmRequest = async () => {
      try {
        setConfirmRequestLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}get-confirm-request?page=${currentPage}&limit=${itemsPerPage}`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch confirmed service requests.");
        }

        const data = await response.json();

        if (data.success && isMounted) {
          setLocalConfirmRequestList(data.data);
          setConfirmRequestList(data.data);
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
        }
      } catch (error) {
        console.error("Error fetching confirmed requests:", error);
      } finally {
        if (isMounted) {
          setConfirmRequestLoading(false);
        }
      }
    };

    getConfirmRequest();

    return () => {
      isMounted = false;
    };
  }, [currentPage, setConfirmRequestList, setConfirmRequestLoading]);

  return (
    <div className="total-request-div">
      <h6 className="mb-4">Confirmed Service Requests</h6>
      {confirmRequestLoading ? (
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
                {confirmRequestList.length > 0 ? (
                  confirmRequestList.map((request) => (
                    <tr key={request.service_id}>
                      <td>{request.service_id}</td>
                      <td>{request.username || 'N/A'}</td>
                      <td>{request.service_description}</td>
                      {/* <td>{request.location || "N/A"}</td> */}
                      <td>
                        <span className="request_status completed">
                          Completed
                        </span>
                      </td>
                      <td>
                        {new Date(request.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No confirmed requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {confirmRequestList.length > 0 && (
            <div className="pagination-buttons">
              <button
                className="btn btn-primary"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-primary"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
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

export default ConfirmRequest;
