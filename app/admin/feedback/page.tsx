"use client";

import { useState } from "react";
import { MessageSquare, Star, Filter, TrendingUp, Users } from "lucide-react";
import { RecentCustomerFeedback } from "@/app/components/RecentCustomerFeedback";

export default function FeedbackPage() {
  const [refreshInterval, setRefreshInterval] = useState(30000);

  return (
    <main className="min-h-screen bg-slate2-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-lg shadow-brand-500/30">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-slate2-900">
                Customer Feedback
              </h1>
              <p className="text-sm text-slate2-600">
                Monitor and manage customer reviews and ratings
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                  <Star className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate2-900">4.8</span>
              </div>
              <p className="text-sm font-medium text-slate2-700">Average Rating</p>
              <p className="text-xs text-slate2-500">Across all services</p>
            </div>

            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-brand-100 p-2 text-brand-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate2-900">247</span>
              </div>
              <p className="text-sm font-medium text-slate2-700">Total Reviews</p>
              <p className="text-xs text-slate2-500">Last 30 days</p>
            </div>

            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate2-900">+12%</span>
              </div>
              <p className="text-sm font-medium text-slate2-700">Satisfaction</p>
              <p className="text-xs text-slate2-500">vs last month</p>
            </div>

            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-slate2-900">89%</span>
              </div>
              <p className="text-sm font-medium text-slate2-700">Response Rate</p>
              <p className="text-xs text-slate2-500">Admin replies</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate2-500" />
                <select className="rounded-lg border border-slate2-200 bg-white px-3 py-2 text-sm text-slate2-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  <option>All Services</option>
                  <option>Cleaning</option>
                  <option>AC Service</option>
                  <option>Furniture</option>
                  <option>Plumbing</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select className="rounded-lg border border-slate2-200 bg-white px-3 py-2 text-sm text-slate2-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate2-600">Auto-refresh:</label>
              <select 
                value={refreshInterval} 
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="rounded-lg border border-slate2-200 bg-white px-3 py-2 text-sm text-slate2-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="0">Off</option>
                <option value="10000">10s</option>
                <option value="30000">30s</option>
                <option value="60000">1m</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <RecentCustomerFeedback 
          limit={10} 
          refreshInterval={refreshInterval}
          className="mb-8"
        />

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Trends */}
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-slate2-900 mb-4">
              Feedback Trends
            </h3>
            <div className="space-y-4">
              {[
                { service: "Full Home Deep Cleaning", rating: 4.9, reviews: 89, trend: "+5%" },
                { service: "AC Power Jet Service", rating: 4.8, reviews: 67, trend: "+12%" },
                { service: "Furniture Repair & Polish", rating: 4.7, reviews: 45, trend: "+3%" },
                { service: "Sofa & Upholstery Cleaning", rating: 4.9, reviews: 34, trend: "+8%" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate2-50">
                  <div>
                    <p className="font-medium text-slate2-900">{item.service}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= item.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate2-500">{item.reviews} reviews</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-emerald-600">{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Tags */}
          <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-slate2-900 mb-4">
              Common Feedback Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Professional", "On Time", "Quality Work", "Friendly", 
                "Efficient", "Clean", "Affordable", "Expert", "Helpful",
                "Quick Response", "Thorough", "Punctual", "Reliable"
              ].map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-slate2-100 px-3 py-1.5 text-sm font-medium text-slate2-700 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
