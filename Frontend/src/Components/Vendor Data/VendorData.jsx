import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./VendorData.css";
import { MdDelete } from "react-icons/md";


const VendorList = () => {
  const [vendors, setVendors] = useState([]);

  // Fetching vendors data from the API
  const fetchVendors = () => {
    fetch("http://localhost:8081/vendors_data")
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
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Handle Delete Vendor
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      fetch(`http://localhost:8081/delete_vendor/${id}`, {
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


  return (
    <div className="vendor-list">
      <h5>Vendors List</h5>
      {vendors.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Contact Number</th>
              <th>Charges</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr key={vendor.id}>
                <td>{index + 1}</td>
                <td>{vendor.name}</td>
                <td>{vendor.contact_number}</td>
                <td>{vendor.charges}</td>
                <td>
                  {vendor.status === 1 ? (
                    <span className="badge bg-success">Active</span>
                  ) : (
                    <span className="badge bg-secondary">Inactive</span>
                  )}
                </td>
                <td>
                <MdDelete  style={{color:"red", fontSize:"25px", cursor:"pointer"}}  onClick={() => handleDelete(vendor.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No vendors found.</p>
      )}
    </div>
  );
};

export default VendorList;
