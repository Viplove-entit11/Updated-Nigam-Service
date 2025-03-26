import React from "react";
import "./AdminNav.css";

const AdminNav = () => {
  return (
    <div className="admin-navbar">
      <div className="logo">
        <img 
          src="/logo.png" 
          alt="Mahasamund Logo" 
          className="mahasamund-logo" 
        />
      </div>
      <div className="title-text">
        <h1>Mahasamund Desludging and Sewer Cleaning Service Request</h1>
        <span>District Administration - Mahasamund</span>
      </div>
    </div>
  );
};

export default AdminNav;