import { useEffect, useState } from "react";
import { useAuth } from "../../Context/Context";
import "./ConfirmRequest.css";
import Loader from "../Loader/Loader";

const ConfirmRequest = () => {
  const { setConfirmRequestList, isLoading, setIsLoading } = useAuth();
  const [confirmRequestList, setLocalConfirmRequestList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getConfirmRequest = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }get-confirm-request?page=${currentPage}&limit=${itemsPerPage}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch confirmed service requests.");
        }

        const data = await response.json();

        if (data.success) {
          console.log("Confirm Request : ", data.data);
          setLocalConfirmRequestList(data.data);
          setConfirmRequestList(data.data); // Store confirmed service requests in global state
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage)); // Calculate total pages
        } else {
          console.error("Error fetching data:", data.message);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching confirmed requests:", error);
      }
    };

    getConfirmRequest();
  }, [currentPage]);

  return (
    <div className="total-request-div">
      <h6>Service Requests</h6>
      {isLoading ? (
        <div
          style={{
            height: "500px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loader />
        </div>
      ) : (
        <>
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
              {confirmRequestList.map((confirmRequest, index) => (
                <tr key={index}>
                  <td>{confirmRequest.service_id}</td>
                  <td>{confirmRequest.userID}</td>
                  <td>{confirmRequest.service_description}</td>
                  <td>{confirmRequest.location}</td>
                  <td style={{ textAlign: "center" }}>
                    {confirmRequest.status === 2 && (
                      <p className="status">Completed</p>
                    )}
                  </td>
                  <td>{confirmRequest.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div
            className="pagination"
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ fontWeight: "500" }}>
              {" "}
              Page {currentPage} of {totalPages}{" "}
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
        </>
      )}
    </div>
  );
};

export default ConfirmRequest;
