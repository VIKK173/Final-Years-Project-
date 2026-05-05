"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, User, Calendar, LoaderCircle, RefreshCw, Reply, Flag, Trash2, Eye, MoreVertical } from "lucide-react";

interface FeedbackEntry {
  id: string;
  bookingId?: string;
  userName: string;
  serviceName: string;
  serviceStars: number;
  workerStars: number;
  comment: string;
  tags: string[];
  createdAt: string;
  status?: string;
  amount: number;
  adminReply?: string;
  isFlagged?: boolean;
}

interface Props {
  limit?: number;
  refreshInterval?: number;
  className?: string;
  workerId?: string;
  readonly?: boolean;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ feedback, readonly }: { feedback: FeedbackEntry, readonly?: boolean }) {
  const [showActions, setShowActions] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [reply, setReply] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-IN", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    
    try {
      const response = await fetch(`/api/feedback/${feedback.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      });
      
      if (response.ok) {
        setReply("");
        setShowReplyBox(false);
        // Refresh feedback list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleFlag = async () => {
    try {
      const response = await fetch(`/api/feedback/${feedback.id}/flag`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Refresh feedback list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error flagging feedback:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      const response = await fetch(`/api/feedback/${feedback.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh feedback list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-sm">
            {feedback.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{feedback.userName}</h4>
            <p className="text-sm text-slate-500">{feedback.serviceName}</p>
            {feedback.bookingId && (
              <p className="text-xs text-slate-400">Order: #{feedback.bookingId.slice(-6)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            <Calendar className="inline h-3 w-3 mr-1" />
            {formatDate(feedback.createdAt)}
          </span>
          {!readonly && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => { setShowReplyBox(!showReplyBox); setShowActions(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  Reply to Feedback
                </button>
                <button
                  onClick={() => { feedback.bookingId && window.open(`/admin/bookings/${feedback.bookingId}`, '_blank'); setShowActions(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Order Details
                </button>
                <button
                  onClick={handleFlag}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <Flag className="h-4 w-4" />
                  Flag Feedback
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Feedback
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Service</span>
            <StarRating rating={feedback.serviceStars} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Worker</span>
            <StarRating rating={feedback.workerStars} />
          </div>
        </div>
      </div>

      {feedback.comment && (
        <div className="mb-3 rounded-lg bg-slate-50 p-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xs">
              {feedback.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">Customer Feedback</p>
              <p className="text-sm text-slate-600 leading-relaxed">{feedback.comment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reply Section */}
      {feedback.adminReply && (
        <div className="mb-3 rounded-xl bg-gradient-to-r from-brand-50 to-brand-100 border-l-4 border-brand-500 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-xs">
              A
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-brand-700">Admin Response</p>
                <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">REPLIED</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{feedback.adminReply}</p>
            </div>
          </div>
        </div>
      )}

      {feedback.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {feedback.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600"
            >
              {tag}
            </span>
          ))}
          {feedback.tags.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              +{feedback.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Reply Box */}
      {showReplyBox && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply to this feedback..."
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
            rows={3}
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => { setShowReplyBox(false); setReply(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function RecentCustomerFeedback({ 
  limit = 5, 
  refreshInterval = 30000, 
  className = "",
  workerId,
  readonly = false
}: Props) {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchFeedback = async () => {
    try {
      setError(null);
      let url = `/api/feedback?limit=${limit}`;
      if (workerId) url += `&workerId=${workerId}`;
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const result = await response.json();
      if (result.success) {
        setFeedback(result.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchFeedback, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, refreshInterval]);

  if (loading && feedback.length === 0) {
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span>Loading customer feedback...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`rounded-2xl border border-rose-200 bg-rose-50 p-6 ${className}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <MessageSquare className="h-8 w-8 text-rose-500" />
          <div>
            <h3 className="font-semibold text-rose-900">Unable to load feedback</h3>
            <p className="text-sm text-rose-700">{error}</p>
          </div>
          <button
            onClick={fetchFeedback}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Recent Customer Feedback
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Latest reviews from our valued customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Last updated: {lastRefresh.toLocaleTimeString("en-IN", { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <button
            onClick={fetchFeedback}
            className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Refresh feedback"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-900">No feedback yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Customer reviews will appear here once services are completed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <FeedbackCard key={item.id} feedback={item} readonly={readonly} />
          ))}
        </div>
      )}

      {feedback.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {feedback.length} most recent reviews
            </p>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              View All Feedback
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
