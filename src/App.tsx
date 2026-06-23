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
import { CreateQuizPage } from "./features/quizzes/pages/CreateQuizPage.js";
import { EditQuizPage } from "./features/quizzes/pages/EditQuizPage.js";
import { QuizDetailsPage } from "./features/quizzes/pages/QuizDetailsPage.js";
import { TakeQuizPage } from "./features/quizzes/pages/TakeQuizPage.js";
import { QuizResultsPage } from "./features/quizzes/pages/QuizResultsPage.js";
import { AttemptHistoryPage } from "./features/quizzes/pages/AttemptHistoryPage.js";
import { LeaderboardPage } from "./features/quizzes/pages/LeaderboardPage.js";
import { AnalyticsPage } from "./features/quizzes/pages/AnalyticsPage.js";
import { QuizPreviewPage } from "./features/quizzes/pages/QuizPreviewPage.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { UserRole } from "./types.js";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
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

            {/* Create Quiz Route */}
            <Route
              path="/quizzes/create"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <CreateQuizPage />
                </ProtectedRoute>
              }
            />

            {/* AI Quiz Preview/Staging Route */}
            <Route
              path="/quizzes/preview"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <QuizPreviewPage />
                </ProtectedRoute>
              }
            />

            {/* Edit Quiz Route */}
            <Route
              path="/quizzes/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <EditQuizPage />
                </ProtectedRoute>
              }
            />

            {/* Quiz Details Route */}
            <Route
              path="/quizzes/details/:id"
              element={
                <ProtectedRoute>
                  <QuizDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Take Quiz Route */}
            <Route
              path="/quizzes/take/:id"
              element={
                <ProtectedRoute>
                  <TakeQuizPage />
                </ProtectedRoute>
              }
            />

            {/* Quiz Results Route */}
            <Route
              path="/quizzes/result/:id"
              element={
                <ProtectedRoute>
                  <QuizResultsPage />
                </ProtectedRoute>
              }
            />

            {/* Quiz Attempt History Route */}
            <Route
              path="/quizzes/history"
              element={
                <ProtectedRoute>
                  <AttemptHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Global Leaderboard Route */}
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />

            {/* Analytics Dashboard Route */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* SPA Catch-all redirect back to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </Provider>
);
}

