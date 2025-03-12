import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./VendorData.css";
import { MdDelete } from "react-icons/md";
import { useAuth } from "../../Context/Context";
import Loader from "../Loader/Loader";

const VendorList = () => {
  // state for vendors details
  const [vendors, setVendors] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // loading state from context 
  const {isLoading, setIsLoading} = useAuth();

  // Fetching vendors data from the API
  const fetchVendors = () => {
    setIsLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}vendors_data`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch vendors data.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setVendors(data.vendors);
        } else {
          toast.warning(data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching vendors:", error);
        toast.error("Error fetching vendors data.");
      });
      setIsLoading(false)
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // function for deleting the vendor from records based on vendor_id
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      fetch(`${import.meta.env.VITE_API_URL}delete_vendor/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete vendor.");
          }
          return response.json();
        })
        .then((data) => {
          toast.success(data.message);
          fetchVendors();
        })
        .catch((error) => {
          console.error("Error deleting vendor:", error);
          toast.error("Error deleting vendor.");
        });
    }
  };

  // function to handle status update
  const handleStatusUpdate = async (vendorId, newStatus) => {
    setUpdatingStatus(vendorId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}update_vendor_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchVendors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        height: "500px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="vendor-list">
      <h5 className="mb-4">Vendors List</h5>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Vendor ID</th>
              <th>Name</th>
              <th>Contact Number</th>
              <th>Charges (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr key={vendor.id}>
                <td>{index + 1}</td>
                <td>{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>{vendor.contact_number}</td>
                <td>₹{vendor.charges}</td>
                <td>
                  <select 
                    className={`form-select form-select-sm w-auto ${vendor.status === 1 ? 'text-success' : 'text-danger'}`}
                    value={vendor.status}
                    onChange={(e) => handleStatusUpdate(vendor.id, parseInt(e.target.value))}
                    disabled={updatingStatus === vendor.id}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <MdDelete size={18} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorList;
