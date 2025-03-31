import { useAuth } from "../../Context/Context";
import "./VendorDetails.css";
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
  const [nameError, setNameError] = useState("");

  const handleVendorRegistration = (event) => {
    event.preventDefault();

    if (vendorContact.length !== 10) {
      setContactError("Contact number must be exactly 10 digits.");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(vendorName)) {
      setNameError("Vendor name should only contain letters.");
      return;
    }

    const vendorRegistrationData = {
      vendor_name: vendorName,
      vendorCharges: vendorCharges,
      vendorContact: vendorContact,
    };

    // Call the API using Fetch
    fetch(`${import.meta.env.VITE_API_URL}register_vendor`, {
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
        setContactError("");
        setNameError("");
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

  const handleNameChange = (event) => {
    const input = event.target.value;

    // Allow only alphabets and spaces
    if (/^[a-zA-Z\s]*$/.test(input)) {
      setVendorName(input);
      setNameError(""); // Clear error when valid input
    } else {
      setNameError("Vendor name should only contain letters.");
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
        <div className="mb-3">
          <label htmlFor="vendorName" className="form-label">
            Vendor Name
          </label>
          <input
            type="text"
            className="form-control"
            id="vendorName"
            placeholder="Enter Vendor Name"
            value={vendorName}
            onChange={handleNameChange}
            required
          />
          {nameError && (
            <small className="text-danger">{nameError}</small>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="vendorContact" className="form-label">
            Contact Number
          </label>
          <input
            type="tel"
            className="form-control"
            id="vendorContact"
            placeholder="Enter 10-digit Contact Number"
            value={vendorContact}
            onChange={handleContactChange}
            onBlur={validateContact}
            maxLength="10"
            required
          />
          {contactError && (
            <small className="text-danger">{contactError}</small>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="vendorCharges" className="form-label">
            Service Charges
          </label>
          <input
            type="number"
            className="form-control"
            id="vendorCharges"
            placeholder="Enter Service Charges"
            value={vendorCharges}
            onChange={(event) => setVendorCharges(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          Register Vendor
        </button>
      </form>
    </div>
  );
};

export default VendorDetails;
