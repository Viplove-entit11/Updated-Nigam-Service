import { useAuth } from "../../Context/Context";
import "./vendorDetails.css";
import { toast } from "react-toastify";
import { useState } from "react";

const VendorDetails = () => {
  // Getting context
  const {
    vendorName,
    setVendorName,
    vendorContact,
    setVendorContact,
    vendorCharges,
    setVendorCharges,
  } = useAuth();

  // Local state for validation
  const [contactError, setContactError] = useState("");

  const handleVendorRegistration = (event) => {
    event.preventDefault();

    if (vendorContact.length !== 10) {
      setContactError("Contact number must be exactly 10 digits.");
      return;
    }

    const vendorRegistrationData = {
      vendor_name: vendorName,
      vendorCharges: vendorCharges,
      vendorContact: vendorContact,
    };

    // Call the API using Fetch
    fetch("http://localhost:8081/register_vendor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vendorRegistrationData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err;
          });
        }
        return response.json();
      })
      .then((data) => {
        // Success Response
        toast.success(data.message);
        console.log("Success:", data);

        // Clear input fields
        setVendorName("");
        setVendorContact("");
        setVendorCharges("");
      })
      .catch((error) => {
        // Error Handling
        toast.error(error.message || "Internal Server Error");
        console.error("Error:", error);
      });
  };

  const handleContactChange = (event) => {
    const input = event.target.value;

    // Allow only numbers and limit to 10 digits
    if (/^\d{0,10}$/.test(input)) {
      setVendorContact(input);
    }
  };

  const validateContact = () => {
    if (vendorContact.length !== 10) {
      setContactError("Contact number must be exactly 10 digits.");
    } else {
      setContactError("");
    }
  };

  return (
    <div className="vendor-registration-details">
      <form
        className="vendor-registration-form"
        onSubmit={handleVendorRegistration}
      >
        {/* Vendor Name */}
        <div className="mb-3">
          <label htmlFor="vendorName" className="form-label">
            Vendor Name
          </label>
          <input
            type="text"
            className="form-control"
            id="vendorName"
            placeholder="Vendor Name"
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
          />
        </div>

        {/* Contact Number */}
        <div className="mb-3">
          <label htmlFor="vendorContact" className="form-label">
            Contact
          </label>
          <input
            type="text"
            className="form-control"
            id="vendorContact"
            placeholder="Contact"
            value={vendorContact}
            onChange={handleContactChange}
            onBlur={validateContact}
          />
          {contactError && (
            <small className="text-danger">{contactError}</small>
          )}
        </div>

        {/* Charges */}
        <div className="mb-3">
          <label htmlFor="vendorCharges" className="form-label">
            Charges
          </label>
          <input
            type="text"
            className="form-control"
            id="vendorCharges"
            placeholder="e.g., 2000"
            value={vendorCharges}
            onChange={(event) => setVendorCharges(event.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Register Vendor
        </button>
      </form>
    </div>
  );
};

export default VendorDetails;
