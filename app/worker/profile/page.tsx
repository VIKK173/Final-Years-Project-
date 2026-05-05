"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Save, ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";

interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  dutyStatus: string;
  photoUrl: string;
  experience: number;
  createdAt: string;
}

export default function WorkerProfile() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceType: "",
    location: "",
    isAvailable: true
  });

  const serviceTypes = [
    "Plumber",
    "Electrician", 
    "Cleaner",
    "Carpenter",
    "Painter",
    "AC Service",
    "Pest Control",
    "Gardener"
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/worker/profile');
      const result = await response.json();
      
      if (result.success) {
        setProfile(result.worker);
        setFormData({
          name: result.worker.name,
          phone: result.worker.phone,
          serviceType: result.worker.serviceType,
          location: result.worker.location,
          isAvailable: result.worker.isAvailable
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/worker/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Profile updated successfully!');
        setProfile(result.worker);
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate2-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate2-50">
      {/* Header */}
      <header className="border-b border-slate2-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/worker/dashboard" className="text-slate2-600 hover:text-brand-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-display text-2xl font-black text-slate2-900">Profile Settings</h1>
                <p className="text-sm text-slate2-600">Manage your personal information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 p-1 mb-4">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    {profile?.photoUrl ? (
                      <img src={profile.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-brand-600" />
                    )}
                  </div>
                </div>
                <h2 className="font-display text-xl font-bold text-slate2-900 mb-2">{profile?.name}</h2>
                <div className="space-y-2 text-sm text-slate2-600">
                  <div className="flex items-center justify-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {profile?.serviceType}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile?.location}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile?.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {profile?.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm mt-6">
              <h3 className="font-semibold text-slate2-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate2-600">Rating</span>
                  <span className="text-sm font-semibold text-slate2-900">{"\u2b50".repeat(Math.floor(profile?.rating || 0))} ({profile?.rating})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate2-600">Total Jobs</span>
                  <span className="text-sm font-semibold text-slate2-900">{profile?.totalJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate2-600">Experience</span>
                  <span className="text-sm font-semibold text-slate2-900">{profile?.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate2-600">Member Since</span>
                  <span className="text-sm font-semibold text-slate2-900">
                    {new Date(profile?.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold text-slate2-900 mb-6">Edit Profile</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate2-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate2-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate2-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                      <input
                        type="email"
                        value={profile?.email || ''}
                        className="w-full pl-10 pr-3 py-2 border border-slate2-200 rounded-lg bg-slate2-50 text-slate2-600"
                        placeholder="Email address"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-slate2-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate2-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate2-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Enter phone number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate2-700 mb-2">
                      Service Type
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                      <select
                        value={formData.serviceType}
                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate2-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                        required
                      >
                        <option value="">Select your service</option>
                        {serviceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate2-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate2-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate2-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Enter your city"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate2-700 mb-2">
                      Availability Status
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                        className="w-4 h-4 text-brand-600 border-slate2-300 rounded focus:ring-brand-500"
                      />
                      <label htmlFor="isAvailable" className="text-sm text-slate2-700">
                        I am available for work
                      </label>
                    </div>
                    <p className="text-xs text-slate2-500 mt-1">This will affect your visibility to customers</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-brand-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </span>
                    )}
                  </button>
                  <Link
                    href="/worker/dashboard"
                    className="px-4 py-2 border border-slate2-200 text-slate2-700 rounded-lg hover:bg-slate2-50 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
