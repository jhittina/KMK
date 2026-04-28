import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Common/Loading";

const RoleBasedRedirect = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/workspace/bookings" replace />;
  }
};

export default RoleBasedRedirect;
