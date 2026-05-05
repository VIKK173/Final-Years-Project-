"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle, AlertCircle, Calendar, User, Briefcase } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Booking {
  id: string;
  serviceName: string;
  workerName: string;
  bookingDate: string;
  amount: number;
  status: string;
}

export default function CustomerFeedback() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceStars: 5,
    workerStars: 5,
    comment: "",
    tags: [] as string[]
  });

  const availableTags = [
    "On Time",
    "Clean Work", 
    "Professional",
    "Friendly",
    "Quick Service",
    "Good Communication",
    "Quality Work",
    "Reasonable Price"
  ];

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      // Mock booking data - in real app, this would fetch from API
      const mockBooking: Booking = {
        id: bookingId,
        serviceName: "Plumbing Service",
        workerName: "John Doe",
        bookingDate: "2024-04-10",
        amount: 500,
        status: "completed"
      };
      
      setBooking(mockBooking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (type: 'service' | 'worker', rating: number) => {
    setFormData(prev => ({
      ...prev,
      [type === 'service' ? 'serviceStars' : 'workerStars']: rating
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          serviceStars: formData.serviceStars,
          workerStars: formData.workerStars,
          comment: formData.comment,
          tags: formData.tags
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Thank you for your feedback! Your review has been submitted successfully.');
        router.push('/customer/bookings');
      } else {
        alert('Failed to submit feedback: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, type: 'service' | 'worker') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(type, star)}
            className="transition-colors"
          >
            <Star 
              className={`h-6 w-6 ${
                star <= rating 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-slate2-300 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
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

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate2-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate2-900 mb-2">Booking Not Found</h2>
            <p className="text-slate2-600 mb-4">The booking you're looking for doesn't exist.</p>
            <button 
              onClick={() => router.push('/customer/bookings')}
              className="bg-brand-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-700 transition-colors"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate2-50">
      {/* Header */}
      <header className="border-b border-slate2-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/customer/bookings')}
              className="text-slate2-600 hover:text-brand-600"
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-black text-slate2-900">Service Feedback</h1>
              <p className="text-sm text-slate2-600">Share your experience with the service</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Booking Details */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm mb-8">
          <h2 className="font-display text-lg font-bold text-slate2-900 mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-100 p-2 text-brand-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate2-600">Service</p>
                <p className="font-medium text-slate2-900">{booking.serviceName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate2-600">Service Provider</p>
                <p className="font-medium text-slate2-900">{booking.workerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate2-600">Service Date</p>
                <p className="font-medium text-slate2-900">
                  {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate2-600">Amount Paid</p>
                <p className="font-medium text-slate2-900">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(booking.amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Rating */}
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate2-900 mb-4">
              How would you rate the service quality?
            </h3>
            <div className="flex items-center justify-center mb-4">
              {renderStars(formData.serviceStars, 'service')}
            </div>
            <p className="text-center text-sm text-slate2-600">
              {formData.serviceStars === 5 && 'Excellent!'}
              {formData.serviceStars === 4 && 'Good'}
              {formData.serviceStars === 3 && 'Average'}
              {formData.serviceStars === 2 && 'Below Average'}
              {formData.serviceStars === 1 && 'Poor'}
            </p>
          </div>

          {/* Worker Rating */}
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate2-900 mb-4">
              How would you rate the service provider?
            </h3>
            <div className="flex items-center justify-center mb-4">
              {renderStars(formData.workerStars, 'worker')}
            </div>
            <p className="text-center text-sm text-slate2-600">
              {formData.workerStars === 5 && 'Excellent!'}
              {formData.workerStars === 4 && 'Good'}
              {formData.workerStars === 3 && 'Average'}
              {formData.workerStars === 2 && 'Below Average'}
              {formData.workerStars === 1 && 'Poor'}
            </p>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate2-900 mb-4">
              What did you like about the service? (Select all that apply)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-slate2-700 border-slate2-200 hover:bg-slate2-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate2-900 mb-4">
              Additional Comments
            </h3>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-slate2-400" />
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 border border-slate2-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={4}
                placeholder="Share your experience with this service..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brand-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Feedback...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/customer/bookings')}
              className="px-6 py-3 border border-slate2-200 text-slate2-700 rounded-lg hover:bg-slate2-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
