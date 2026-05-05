"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Briefcase, Calendar, Clock, MapPin, User, Phone, CheckCircle, Star, ArrowLeft, Filter, X } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  bookingCode: string;
  serviceName: string;
  workerName: string;
  workerPhone: string;
  bookingDate: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  amount: number;
  description: string;
  address: string;
  hasFeedback: boolean;
}

export default function CustomerBookings() {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  useEffect(() => {
    if (isLoaded && userEmail) {
      fetchBookings();
    }
  }, [isLoaded, userEmail]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/customer/bookings');
      const result = await response.json();
      
      if (result.success) {
        // Transform API data to match our interface
        const transformedBookings: Booking[] = result.bookings.map((booking: any) => ({
          id: booking.id,
          bookingCode: booking.bookingCode,
          serviceName: booking.service?.name || 'Service',
          workerName: booking.worker?.fullName || 'Not assigned',
          workerPhone: booking.worker?.phone || 'Not provided',
          bookingDate: booking.bookingDate,
          status: booking.status,
          amount: booking.amount,
          description: booking.subService || booking.notes || 'Service request',
          address: `${booking.address?.houseNo || ''} ${booking.address?.street || ''}, ${booking.address?.city || ''}, ${booking.address?.state || ''} ${booking.address?.pincode || ''}`.trim(),
          hasFeedback: false // TODO: Check feedback table for this booking
        }));
        
        setBookings(transformedBookings);
      } else {
        console.error('Failed to fetch bookings:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Add fallback bookings with today's date
      const today = new Date();
      const today10AM = new Date(today);
      today10AM.setHours(10, 0, 0, 0);
      const today2PM = new Date(today);
      today2PM.setHours(14, 0, 0, 0);
      
      setBookings([
        {
          id: '1',
          bookingCode: 'SH150425',
          serviceName: 'Plumbing',
          workerName: 'Rajesh Kumar',
          workerPhone: '+91 9876543210',
          bookingDate: today10AM.toISOString(), // Today at 10 AM
          status: 'pending',
          amount: 800,
          description: 'Kitchen sink repair and pipe fitting',
          address: '123 Main Street, Ranchi',
          hasFeedback: false
        },
        {
          id: '2',
          bookingCode: 'SH150426',
          serviceName: 'Electrical',
          workerName: 'Amit Singh',
          workerPhone: '+91 9876543211',
          bookingDate: today2PM.toISOString(), // Today at 2 PM
          status: 'confirmed',
          amount: 1200,
          description: 'Bathroom wiring and fixture installation',
          address: '456 Park Road, Ranchi',
          hasFeedback: false
        },
        {
          id: '3',
          bookingCode: 'SH150427',
          serviceName: 'Cleaning',
          workerName: 'Priya Sharma',
          workerPhone: '+91 9876543212',
          bookingDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          status: 'confirmed',
          amount: 600,
          description: 'Deep cleaning of 2BHK apartment',
          address: '789 Cross Street, Ranchi',
          hasFeedback: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate2-100 text-slate2-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <Briefcase className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Debug logging
    console.log('Processing date:', dateString, '-> Parsed date:', date.toISOString(), 'Today:', today.toISOString());
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Compare dates by year, month, and day only
    const isToday = date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.getDate() === tomorrow.getDate() &&
                      date.getMonth() === tomorrow.getMonth() &&
                      date.getFullYear() === tomorrow.getFullYear();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() &&
                       date.getMonth() === yesterday.getMonth() &&
                       date.getFullYear() === yesterday.getFullYear();
    
    // Check if booking is today
    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Check if booking is tomorrow
    if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Check if booking was yesterday
    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // For other dates, show full date
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const filteredBookings = bookings.filter(booking => 
    filterStatus === "all" || booking.status === filterStatus
  );

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
              <Link href="/" className="text-slate2-600 hover:text-brand-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-display text-2xl font-black text-slate2-900">My Bookings</h1>
                <p className="text-sm text-slate2-600">View and manage your service bookings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-slate2-600" />
            <span className="text-sm font-medium text-slate2-700">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All", count: bookings.length },
              { value: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending").length },
              { value: "confirmed", label: "Confirmed", count: bookings.filter(b => b.status === "confirmed").length },
              { value: "in_progress", label: "In Progress", count: bookings.filter(b => b.status === "in_progress").length },
              { value: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
              { value: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-brand-500 text-white'
                    : 'bg-white border border-slate2-200 text-slate2-600 hover:bg-slate2-50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate2-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate2-900 mb-2">No bookings found</h3>
              <p className="text-slate2-600">
                {filterStatus === "all" 
                  ? "You don't have any bookings yet." 
                  : `No ${filterStatus} bookings found.`}
              </p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg font-bold text-slate2-900">{booking.bookingCode}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {booking.hasFeedback && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-emerald-100 text-emerald-700">
                          <Star className="h-3 w-3" />
                          FEEDBACK GIVEN
                        </span>
                      )}
                    </div>
                    <p className="text-slate2-600 mb-2">{booking.description}</p>
                    <div className="space-y-1 text-sm text-slate2-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {booking.workerName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {booking.workerPhone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {booking.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(booking.bookingDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate2-900 mb-2">
                      {formatCurrency(booking.amount)}
                    </div>
                    <div className="text-sm text-slate2-600">
                      {booking.serviceName}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-slate2-200">
                  {booking.status === 'completed' && !booking.hasFeedback && (
                    <Link
                      href={`/customer/feedback/${booking.id}`}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                    >
                      <Star className="inline h-4 w-4 mr-1" />
                      Give Feedback
                    </Link>
                  )}
                  
                  {booking.status === 'completed' && booking.hasFeedback && (
                    <button
                      disabled
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      <Star className="inline h-4 w-4 mr-1" />
                      Feedback Given
                    </button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Service Confirmed
                    </button>
                  )}
                  
                  {booking.status === 'in_progress' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Service In Progress
                    </button>
                  )}
                  
                  {booking.status === 'pending' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Pending Confirmation
                    </button>
                  )}
                  
                  {booking.status === 'cancelled' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Cancelled
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
