"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Phone, User, MapPin, Briefcase, Camera, CheckCircle, AlertCircle, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const serviceCategories = [
  "Plumber",
  "Electrician", 
  "Cleaner",
  "Carpenter",
  "Painter",
  "AC Service",
  "Pest Control",
  "Gardener"
];

const cities = [
  "Ranchi",
  "Jamshedpur", 
  "Dhanbad",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Other"
];

export default function WorkerRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    serviceCategory: "",
    city: "",
    profilePhoto: ""
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
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.serviceCategory) {
      newErrors.serviceCategory = "Service category is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
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
      const response = await fetch('/api/worker/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          serviceCategory: formData.serviceCategory,
          city: formData.city,
          profilePhoto: formData.profilePhoto
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRegistrationSuccess(true);
        setRegistrationData(data);
        console.log("Registration successful:", data);
      } else {
        setErrors({ submit: data.error || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (registrationSuccess && registrationData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center p-4">
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
                  <li>Check your email for approval notification</li>
                  <li>Once approved, you can login to your dashboard</li>
                  <li>Admin will review your application</li>
                </ul>
              </div>

              <div className="bg-slate2-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate2-800 mb-2">Your Details:</h3>
                <div className="text-sm text-slate2-600 space-y-1">
                  <p><span className="font-medium">Name:</span> {registrationData.worker.fullName}</p>
                  <p><span className="font-medium">Email:</span> {registrationData.worker.email}</p>
                  <p><span className="font-medium">Service:</span> {registrationData.worker.category}</p>
                  <p><span className="font-medium">City:</span> {registrationData.worker.city}</p>
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
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate2-900 mb-2">Worker Registration</h1>
            <p className="text-slate2-600">Join our team of service professionals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.name ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.email ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.phone ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                Service Category
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none ${
                    errors.serviceCategory ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Select your service</option>
                  {serviceCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              {errors.serviceCategory && <p className="mt-1 text-xs text-rose-600">{errors.serviceCategory}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none ${
                    errors.city ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Select your city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {errors.city && <p className="mt-1 text-xs text-rose-600">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.password ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate2-400 hover:text-slate2-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate2-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.confirmPassword ? 'border-rose-300' : 'border-slate2-300'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate2-400 hover:text-slate2-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg px-4 py-3 font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </span>
              ) : (
                "Register as Worker"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate2-600">
              Already have an account?{" "}
              <Link href="/worker/login" className="text-brand-600 hover:text-brand-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-slate2-500 hover:text-slate2-700">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
