import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import { UserRole } from "../../../types.js";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  // Show a beautifully polished, styled Loading Spinner while checking active session
  if (isInitializing) {
    return (
      <div id="loader" className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="font-mono text-sm tracking-wider text-gray-500 dark:text-zinc-400">
            SECURELY LOAD SESSION...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is authorized (e.g. require UserRole.ADMIN)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div id="forbidden-view" className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-zinc-950">
        <div className="max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="font-sans text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Access Forbidden
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              You do not have the required credentials ({allowedRoles.join(", ")}) to inspect this resource.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            id="back-btn"
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};
