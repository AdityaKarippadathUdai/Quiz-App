import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "motion/react";
import { User as UserIcon, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

import { clientRegisterSchema, ClientRegisterInput } from "../validations/authValidation.js";
import { useRegisterMutation } from "../services/authApiSlice.js";
import { setCredentials } from "../store/authSlice.js";
import { useAuth } from "../components/AuthProvider.js";
import { ThemeToggle } from "../../../components/ThemeToggle.js";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientRegisterInput>({
    resolver: zodResolver(clientRegisterSchema),
  });

  const onSubmit = async (data: ClientRegisterInput) => {
    setErrorMessage(null);
    try {
      const response = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      
      if (response.success && response.data) {
        dispatch(setCredentials(response.data));
        navigate("/", { replace: true });
      } else {
        setErrorMessage(response.message || "Registration failed");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || "An account with this email address already exists."
      );
    }
  };

  return (
    <div id="register-container" className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 transition-colors duration-300 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Theme Toggle Button in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <span className="font-sans text-xl font-black">Q</span>
          </div>
          <h2 className="mt-6 font-sans text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-2 font-sans text-sm text-gray-500 dark:text-zinc-400">
            Sign up to take quizzes, track performance and sync analytics
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
          {errorMessage && (
            <div className="mb-6 flex items-start space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Full Name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  id="name-input"
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-600 dark:focus:border-indigo-600"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 font-mono text-xs text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  id="email-input"
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-600 dark:focus:border-indigo-600"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 font-mono text-xs text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password-input"
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-600 dark:focus:border-indigo-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  id="toggle-pass-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-zinc-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 font-mono text-xs text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password-input"
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-600 dark:focus:border-indigo-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  id="toggle-confirm-pass-visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-zinc-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 font-mono text-xs text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="submit-register-btn"
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center dark:border-zinc-800">
            <p className="font-sans text-sm text-gray-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
