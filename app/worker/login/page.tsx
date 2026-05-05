"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Wrench, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function WorkerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/worker/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store worker token in cookie (handled by API)
        alert('Login successful!');
        window.location.href = '/worker/dashboard';
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-slate2-100">
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 shadow-lg">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-black text-slate2-900">Worker Login</h1>
          <p className="mt-2 text-sm text-slate2-600">Access your worker dashboard</p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-8 shadow-xl">
          {errors.general && (
            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4">
              <p className="text-sm font-medium text-rose-800">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full rounded-xl border ${errors.email ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full rounded-xl border ${errors.password ? 'border-rose-300' : 'border-slate2-200'} bg-white pr-12 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate2-400 hover:text-slate2-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Sign In to Worker Portal"
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate2-600">
              Don't have an account?{" "}
              <Link href="/worker/signup" className="font-semibold text-brand-600 hover:text-brand-700">
                Register here
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="text-center">
            <Link href="/worker/forgot-password" className="text-sm font-medium text-slate2-600 hover:text-brand-600">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
