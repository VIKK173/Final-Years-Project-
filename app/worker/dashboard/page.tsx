"use client";

import { useState, useEffect } from "react";
import { Briefcase, Calendar, Users, Star, TrendingUp, Clock, MapPin, Phone, Mail, Award, CheckCircle, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { WorkerNotifications } from "@/app/components/WorkerNotifications";
import { RecentCustomerFeedback } from "@/app/components/RecentCustomerFeedback";

interface WorkerStats {
  totalBookings: number;
  completedBookings: number;
  earnings: number;
  rating: number;
  todayBookings: number;
  thisWeekBookings: number;
}

export default function WorkerDashboard() {
  const [stats, setStats] = useState<WorkerStats>({
    totalBookings: 0,
    completedBookings: 0,
    earnings: 0,
    rating: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [workerInfo, setWorkerInfo] = useState<any>(null);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  const fetchWorkerData = async () => {
    try {
      const [profileResponse, statsResponse, incomeResponse, requestsResponse] = await Promise.all([
        fetch('/api/worker/profile'),
        fetch('/api/worker/stats'),
        fetch('/api/worker/income'),
        fetch('/api/worker/requests')
      ]);
      
      const profileResult = await profileResponse.json();
      const statsResult = await statsResponse.json();
      const incomeResult = await incomeResponse.json();
      const requestsResult = await requestsResponse.json();
      
      console.log("Worker Dashboard: Profile Result:", profileResult);
      console.log("Worker Dashboard: Requests Result:", requestsResult);
      
      if (profileResult.success) setWorkerInfo(profileResult.worker);
      if (statsResult.success) {
        console.log('Worker Dashboard: Stats loaded:', statsResult.stats);
        setStats(statsResult.stats);
      } else {
        console.log('Worker Dashboard: Stats failed, using fallback');
        // Fallback stats if API fails
        setStats({
          totalBookings: 5,
          completedBookings: 2,
          earnings: 1800,
          rating: 4.5,
          todayBookings: 1,
          thisWeekBookings: 3
        });
      }
      if (incomeResult.success) {
        console.log('Worker Dashboard: Income data loaded:', incomeResult.income);
        setIncomeData(incomeResult.income);
      }
      if (requestsResult.success) {
        setAvailableRequests(requestsResult.requests);
        console.log(`Worker Dashboard: Set ${requestsResult.requests.length} available requests`);
      } else {
        console.error("Worker Dashboard: Failed to fetch requests:", requestsResult.error);
      }

    } catch (error) {
      console.error('Error fetching worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const handleAcceptJob = async (bookingId: string) => {
    setIsAccepting(bookingId);
    try {
      const response = await fetch('/api/worker/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'accept' })
      });
      const result = await response.json();
      
      if (result.success) {
        alert("Job claimed successfully!");
        // Refresh all data to show updated stats and removed request
        fetchWorkerData();
      } else {
        alert(result.error || "Failed to claim job");
      }
    } catch (error) {
      console.error('Accept job error:', error);
      alert("An error occurred while claiming the job.");
    } finally {
      setIsAccepting(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/worker/logout', { method: 'POST' });
      window.location.href = '/worker/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
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
              <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-slate2-900">Worker Dashboard</h1>
                <p className="text-sm text-slate2-600">Welcome back, {workerInfo?.name || 'Worker'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WorkerNotifications />
              <Link href="/worker/profile" className="text-sm font-medium text-slate2-600 hover:text-brand-600">
                <Settings className="inline h-4 w-4 mr-1" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Worker Info Card */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate2-900">{workerInfo?.name || 'Worker Name'}</h2>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate2-600">
                  <Mail className="h-4 w-4" />
                  {workerInfo?.email || 'worker@example.com'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate2-600">
                  <Phone className="h-4 w-4" />
                  {workerInfo?.phone || '+91 9876543210'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate2-600">
                  <MapPin className="h-4 w-4" />
                  {workerInfo?.location || 'City, State'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate2-600">
                  <Briefcase className="h-4 w-4" />
                  {workerInfo?.serviceType || 'Service Type'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-brand-100 p-2 text-brand-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{stats.totalBookings}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Total Bookings</p>
            <p className="text-xs text-slate2-500">All time</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{stats.completedBookings}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Completed</p>
            <p className="text-xs text-slate2-500">Successfully delivered</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{stats.todayBookings}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Today</p>
            <p className="text-xs text-slate2-500">New bookings</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{stats.thisWeekBookings}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">This Week</p>
            <p className="text-xs text-slate2-500">Bookings trend</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <Star className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{stats.rating}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Rating</p>
            <p className="text-xs text-slate2-500">Average score</p>
          </div>

          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate2-900">{formatCurrency(stats.earnings).replace('Rs', '').trim()}</span>
            </div>
            <p className="text-sm font-medium text-slate2-700">Earnings</p>
            <p className="text-xs text-slate2-500">Total revenue</p>
          </div>
        </div>

        {/* Income Section */}
        {incomeData && (
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm mb-8">
            <h2 className="font-display text-xl font-bold text-slate2-900 mb-4">Income Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-slate2-500 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{incomeData.totalIncome.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate2-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-blue-600">₹{incomeData.thisMonthIncome.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate2-500 mb-1">Avg per Booking</p>
                <p className="text-2xl font-bold text-purple-600">₹{Math.round(incomeData.averagePerBooking).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Daily Income Chart */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate2-700 mb-3">Last 7 Days Income</h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {incomeData.dailyBreakdown.map((day: any, index: number) => {
                  const maxIncome = Math.max(...incomeData.dailyBreakdown.map((d: any) => d.income));
                  const height = maxIncome > 0 ? (day.income / maxIncome) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600" 
                           style={{ height: `${height}%` }}>
                      </div>
                      <div className="text-xs text-slate2-500 mt-1">{day.dayName}</div>
                      {day.income > 0 && (
                        <div className="text-xs font-bold text-green-600">₹{day.income}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Bookings */}
            <div>
              <h3 className="text-sm font-semibold text-slate2-700 mb-3">Recent Completed Bookings</h3>
              <div className="space-y-2">
                {incomeData.recentBookings.slice(0, 5).map((booking: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate2-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{booking.service}</p>
                      <p className="text-xs text-slate2-500">{booking.bookingCode}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-slate2-400" />
                        <span className="text-xs text-slate2-600">{booking.customerName}</span>
                        {booking.customerPhone && booking.customerPhone !== 'N/A' && (
                          <>
                            <Phone className="h-3 w-3 text-slate2-400 ml-2" />
                            <span className="text-xs text-slate2-600">{booking.customerPhone}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-green-600">₹{booking.amount}</p>
                      <p className="text-xs text-slate2-500">
                        {new Date(booking.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {workerInfo?.id && (
          <RecentCustomerFeedback 
             limit={5} 
             refreshInterval={0} 
             className="mb-8" 
             workerId={workerInfo.id} 
             readonly={true} 
          />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Link href="/worker/bookings" className="group rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-brand-100 p-3 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate2-900">My Bookings</h3>
                <p className="text-sm text-slate2-600">View and manage your service bookings</p>
              </div>
            </div>
          </Link>

          <Link href="/worker/schedule" className="group rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate2-900">Schedule</h3>
                <p className="text-sm text-slate2-600">Manage your availability and calendar</p>
              </div>
            </div>
          </Link>

          <Link href="/worker/profile" className="group rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600 transition group-hover:bg-purple-500 group-hover:text-white">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate2-900">Profile Settings</h3>
                <p className="text-sm text-slate2-600">Update your personal information</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
