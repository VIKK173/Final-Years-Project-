"use client";

import { useState } from "react";
import { ArrowLeft, Star, Send, Plus, X } from "lucide-react";
import Link from "next/link";

export default function AddFeedbackPage() {
  const [formData, setFormData] = useState({
    userName: "",
    serviceName: "",
    serviceStars: 5,
    workerStars: 5,
    comment: "",
    tags: [] as string[],
    bookingId: ""
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Feedback added successfully!");
        // Reset form
        setFormData({
          userName: "",
          serviceName: "",
          serviceStars: 5,
          workerStars: 5,
          comment: "",
          tags: [],
          bookingId: ""
        });
        setNewTag("");
      } else {
        alert("Failed to add feedback");
      }
    } catch (error) {
      console.error("Error adding feedback:", error);
      alert("Error adding feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <main className="min-h-screen bg-slate2-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/feedback"
              className="flex items-center gap-2 text-slate2-600 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feedback
            </Link>
            <div>
              <h1 className="font-display text-3xl font-black text-slate2-900">
                Add Customer Feedback
              </h1>
              <p className="mt-1 text-sm text-slate2-600">
                Create new feedback entries for testing
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate2-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full rounded-xl border border-slate2-200 bg-white px-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate2-700">
                  Service Name
                </label>
                <select
                  value={formData.serviceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                  className="w-full rounded-xl border border-slate2-200 bg-white px-4 py-3 text-slate2-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                >
                  <option value="">Select a service</option>
                  <option value="Full Home Deep Cleaning">Full Home Deep Cleaning</option>
                  <option value="AC Power Jet Service">AC Power Jet Service</option>
                  <option value="Furniture Repair & Polish">Furniture Repair & Polish</option>
                  <option value="Sofa & Upholstery Cleaning">Sofa & Upholstery Cleaning</option>
                  <option value="Custom Furniture & Interiors">Custom Furniture & Interiors</option>
                  <option value="Carpentry & Woodwork">Carpentry & Woodwork</option>
                  <option value="Full Home Painting">Full Home Painting</option>
                  <option value="Plumbing Expert">Plumbing Expert</option>
                </select>
              </div>
            </div>

            {/* Booking ID */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Booking ID (Optional)
              </label>
              <input
                type="text"
                value={formData.bookingId}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                className="w-full rounded-xl border border-slate2-200 bg-white px-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Enter booking ID if available"
              />
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate2-700">
                  Service Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, serviceStars: star }))}
                      className="transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.serviceStars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-300"
                        } hover:scale-110`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate2-700">
                    {formData.serviceStars}/5
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate2-700">
                  Worker Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, workerStars: star }))}
                      className="transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.workerStars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-300"
                        } hover:scale-110`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate2-700">
                    {formData.workerStars}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Feedback Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full rounded-xl border border-slate2-200 bg-white px-4 py-3 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                placeholder="Enter customer feedback..."
                rows={4}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate2-700">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate2-200 bg-white px-4 py-2 text-slate2-900 placeholder-slate2-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-xl bg-brand-500 px-4 py-2 text-white font-medium hover:bg-brand-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-600"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 text-brand-600 hover:text-brand-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-white font-bold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent border-b-transparent border-l-brand-600"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Adding Feedback..." : "Add Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
