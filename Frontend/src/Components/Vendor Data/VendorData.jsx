import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./VendorData.css";
import { MdDelete } from "react-icons/md";
import { useAuth } from "../../Context/Context";
import Loader from "../Loader/Loader";


const VendorList = () => {
  // state for vendors details
  const [vendors, setVendors] = useState([]);

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
      <h5>Vendors List</h5>
      
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor_ID</th>
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
                <td>{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>{vendor.contact_number}</td>
                <td>{vendor.charges}</td>
                <td>
                  {vendor.status === 1 ? (
                    <span className="active-vendor">Active</span>
                  ) : (
                    <span className="inactive-vendor">Inactive</span>
                  )}
                </td>
                <td>
                <MdDelete  style={{color:"red", fontSize:"25px", cursor:"pointer"}}  onClick={() => handleDelete(vendor.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      
    </div>
  );
};

export default VendorList;
