"use client";

import { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Wrench, Zap, Droplets, Hammer, Paintbrush, Shield, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

const SERVICE_TYPES = [
  { id: "plumbing", name: "Plumbing", icon: Droplets },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "carpentry", name: "Carpentry", icon: Hammer },
  { id: "painting", name: "Painting", icon: Paintbrush },
  { id: "cleaning", name: "Cleaning", icon: Shield },
  { id: "ac", name: "AC Service", icon: Wrench },
];

export default function WorkerSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    serviceType: "",
    location: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.serviceType) {
      newErrors.serviceType = "Service type is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const response = await fetch('/api/worker/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setRegistrationSuccess(true);
        setRegistrationData(result);
        console.log("Worker registration successful:", result);
      } else {
        setErrors({ general: result.error || 'Registration failed' });
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

  if (registrationSuccess && registrationData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-brand-50 to-slate2-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate2-900 mb-2">Registration Successful!</h1>
              <p className="text-slate2-600 mb-6">
                Your worker account has been created and is pending admin approval.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Next Steps:</h3>
                </div>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>Wait for admin approval (24-48 hours)</li>
                  <li>Admin will review your application</li>
                  <li>You will be able to login once approved</li>
                  <li>Check your email for approval notification</li>
                </ul>
              </div>

              <div className="bg-slate2-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate2-800 mb-2">Your Details:</h3>
                <div className="text-sm text-slate2-600 space-y-1">
                  <p><span className="font-medium">Name:</span> {registrationData.worker.name}</p>
                  <p><span className="font-medium">Email:</span> {registrationData.worker.email}</p>
                  <p><span className="font-medium">Service:</span> {registrationData.worker.serviceType}</p>
                  <p><span className="font-medium">Location:</span> {registrationData.worker.location}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      {registrationData.worker.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  href="/worker/login"
                  className="block w-full bg-brand-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-brand-700 transition-colors"
                >
                  Go to Login
                </Link>
                <Link 
                  href="/"
                  className="block w-full bg-slate2-100 text-slate2-700 rounded-lg px-4 py-3 font-semibold hover:bg-slate2-200 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
        return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-slate2-100">
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 shadow-lg">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-black text-slate2-900">Worker Registration</h1>
          <p className="mt-2 text-sm text-slate2-600">Join our team of service professionals</p>
        </div>

        {/* Signup Form */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-8 shadow-xl">
          {errors.general && (
            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4">
              <p className="text-sm font-medium text-rose-800">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full rounded-xl border ${errors.name ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>
              )}
            </div>

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

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full rounded-xl border ${errors.phone ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Enter your phone number"
                  maxLength={10}
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Service Type
              </label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400" />
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  className={`w-full rounded-xl border ${errors.serviceType ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-4 py-3 text-slate2-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none`}
                  required
                >
                  <option value="">Select your service</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              {errors.serviceType && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.serviceType}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full rounded-xl border ${errors.location ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Enter your city"
                  required
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.location}</p>
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
                  className={`w-full rounded-xl border ${errors.password ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-12 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400 hover:text-slate2-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full rounded-xl border ${errors.confirmPassword ? 'border-rose-300' : 'border-slate2-200'} bg-white pl-10 pr-12 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate2-400 hover:text-slate2-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-center font-semibold text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating Account...
                </span>
              ) : (
                "Create Worker Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate2-600">
              Already have an account?{" "}
              <Link href="/worker/login" className="text-brand-600 font-semibold hover:text-brand-700">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
