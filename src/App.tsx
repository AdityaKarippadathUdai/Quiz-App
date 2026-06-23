/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { AuthProvider } from "./features/auth/components/AuthProvider.js";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.js";
import { LoginPage } from "./features/auth/pages/LoginPage.js";
import { RegisterPage } from "./features/auth/pages/RegisterPage.js";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage.js";

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Workspace Workspace Route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* SPA Catch-all redirect back to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

