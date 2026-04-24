import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { userInfo } = useContext(AuthContext);

  // ❌ Not logged in
  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  // ❌ Not admin
  if (userInfo.role !== "admin") {
    return (<div className="denial_container">
      <h2 className="denial_message">Access Denied</h2>
      <p className="denial_description">You must be an administrator to access this page.</p>
      <button className="auth-btn" onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>);
  }

  // ✅ Admin
  return children;
};

export default ProtectedAdminRoute;