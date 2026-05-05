"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle, X, Clock, Star, Mail, Phone, MapPin, Award, Briefcase, Shield, AlertCircle, UserPlus } from "lucide-react";
import Link from "next/link";

interface Worker {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  status: string;
  avgRating: number;
  totalJobs: number;
  isAvailable: boolean;
  dutyStatus: string;
  photoUrl: string;
  createdAt: string;
}

export default function WorkersManagement() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Create test worker function
  const createTestWorker = async () => {
    try {
      const testWorkerData = {
        name: "Test Worker",
        email: `testworker${Date.now()}@example.com`,
        phone: "9876543210",
        password: "worker123",
        serviceCategory: "Plumber",
        city: "Ranchi"
      };

      const response = await fetch('/api/worker/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testWorkerData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`Test worker created successfully! Email: ${testWorkerData.email}, Password: ${testWorkerData.password}`);
        // Refresh workers list
        fetchWorkers();
      } else {
        alert(`Failed to create test worker: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating test worker:', error);
      alert('Error creating test worker');
    }
  };

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setError(null);
        console.log("Fetching workers from API...");
        
        const response = await fetch('/api/admin/workers');
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          setError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          return;
        }
        
        const result = await response.json();
        console.log("API response:", result);
        
        if (result.success) {
          setWorkers(result.workers || []);
          console.log(`Successfully loaded ${result.workers?.length || 0} workers`);
        } else {
          setError(result.error || "Failed to fetch workers");
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
        setError("Network error: Could not connect to server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const updateWorkerStatus = async (workerId: string, newStatus: string) => {
    try {
      console.log(`Updating worker ${workerId} to status: ${newStatus}`);
      
      // Show loading state
      const originalButtonText = `Updating to ${newStatus}...`;
      
      const response = await fetch(`/api/admin/workers/${workerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      console.log('Status update response:', result);
      
      if (response.ok && result.success) {
        // Update local state
        setWorkers(prev => 
          prev.map(worker => 
            worker._id === workerId 
              ? { ...worker, status: newStatus }
              : worker
          )
        );
        
        // Show success message
        const statusMessages = {
          'approved': 'Worker has been approved and can now login!',
          'rejected': 'Worker has been rejected and cannot login.',
          'suspended': 'Worker has been suspended temporarily.',
          'pending': 'Worker status changed to pending for review.'
        };
        
        alert(`Success: ${statusMessages[newStatus as keyof typeof statusMessages]}`);
        console.log(`Worker ${workerId} status updated to ${newStatus} successfully`);
        
        // Refresh the data to ensure consistency
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Status update failed:', result);
        alert(`Failed to update worker status: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating worker status:', error);
      alert('Network error: Could not update worker status. Please check your connection and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      case 'suspended': return 'bg-slate2-100 text-slate2-700';
      default: return 'bg-slate2-100 text-slate2-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'suspended': return <Shield className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesStatus = filterStatus === 'all' || worker.status === filterStatus;
    const matchesSearch = worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate2-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate2-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-slate2-600">Loading workers...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate2-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-6 mb-4">
              <div className="text-rose-600 mb-2">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-lg font-semibold text-rose-800 mb-2">Error Loading Workers</h2>
              <p className="text-rose-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
            <Link href="/admin/dashboard" className="text-brand-600 hover:text-brand-700">
              &larr; Back to Dashboard
            </Link>
          </div>
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
              <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-slate2-900">Workers Management</h1>
                <p className="text-sm text-slate2-600">Approve and manage service professionals</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="text-sm font-medium text-slate2-600 hover:text-brand-600">
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-brand-100 p-2 text-brand-600">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{workers.length}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Total Workers</p>
            <p className="text-xs text-slate2-500">All registered workers</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">
                {workers.filter(w => w.status === 'approved').length}
              </span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Approved</p>
            <p className="text-xs text-slate2-500">Active workers</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">
                {workers.filter(w => w.status === 'pending').length}
              </span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Pending</p>
            <p className="text-xs text-slate2-500">Awaiting approval</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                <X className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">
                {workers.filter(w => w.status === 'rejected').length}
              </span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Rejected</p>
            <p className="text-xs text-slate2-500">Declined applications</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search workers by name, email, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate2-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createTestWorker}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Create Test Worker
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
                }`}
              >
                All ({workers.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
                }`}
              >
                Pending ({workers.filter(w => w.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  filterStatus === 'approved' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
                }`}
              >
                Approved ({workers.filter(w => w.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  filterStatus === 'rejected' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
                }`}
              >
                Rejected ({workers.filter(w => w.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Workers List */}
        <div className="rounded-2xl border border-slate2-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-slate2-200">
            <h2 className="font-display text-xl font-black text-slate2-900">Workers List</h2>
            <p className="text-sm text-slate2-600">Manage worker accounts and approval status</p>
          </div>

          {filteredWorkers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate2-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate2-600">No workers found</p>
              <p className="text-xs text-slate2-500">Workers will appear here when they register</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate2-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Worker</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Service</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Jobs</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate2-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker._id} className="border-b border-slate2-100 hover:bg-slate2-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-slate2-100 p-2">
                            {worker.photoUrl ? (
                              <img src={worker.photoUrl} alt={worker.fullName} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <Users className="h-8 w-8 text-slate2-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate2-900">{worker.fullName}</p>
                            <p className="text-xs text-slate2-500">Registered {formatDate(worker.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate2-600">
                            <Mail className="h-4 w-4" />
                            {worker.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate2-600">
                            <Phone className="h-4 w-4" />
                            {worker.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate2-100 text-slate2-700">
                          {worker.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate2-600">
                          <MapPin className="h-4 w-4" />
                          {worker.city}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(worker.status)}`}>
                            {getStatusIcon(worker.status)}
                            <span className="ml-2">{worker.status.toUpperCase()}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {renderStars(worker.avgRating)}
                          <span className="ml-2 text-sm text-slate2-600">({worker.avgRating})</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate2-600">
                          <Briefcase className="h-4 w-4" />
                          <span>{worker.totalJobs}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {worker.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateWorkerStatus(worker._id, 'approved')}
                                className="flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateWorkerStatus(worker._id, 'rejected')}
                                className="flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          {worker.status === 'approved' && (
                            <button
                              onClick={() => updateWorkerStatus(worker._id, 'suspended')}
                              className="flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Suspend
                            </button>
                          )}
                          {worker.status === 'rejected' && (
                            <button
                              onClick={() => updateWorkerStatus(worker._id, 'pending')}
                              className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Review
                            </button>
                          )}
                          {worker.status === 'suspended' && (
                            <button
                              onClick={() => updateWorkerStatus(worker._id, 'approved')}
                              className="flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
