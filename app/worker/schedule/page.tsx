"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Briefcase, ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

interface ScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  location: string;
  description: string;
  isAvailable: boolean;
}

export default function WorkerSchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      // Mock schedule data for now - in real app, this would fetch from API
      const mockSchedule: ScheduleItem[] = [
        {
          id: "1",
          date: "2024-04-10",
          startTime: "09:00",
          endTime: "12:00",
          serviceType: "Plumbing",
          location: "Ranchi",
          description: "Kitchen sink repair",
          isAvailable: false
        },
        {
          id: "2",
          date: "2024-04-10",
          startTime: "14:00",
          endTime: "17:00",
          serviceType: "Available",
          location: "Ranchi",
          description: "Available for bookings",
          isAvailable: true
        },
        {
          id: "3",
          date: "2024-04-11",
          startTime: "10:00",
          endTime: "13:00",
          serviceType: "Electrical",
          location: "Jamshedpur",
          description: "AC installation",
          isAvailable: false
        },
        {
          id: "4",
          date: "2024-04-11",
          startTime: "15:00",
          endTime: "18:00",
          serviceType: "Available",
          location: "Jamshedpur",
          description: "Available for bookings",
          isAvailable: true
        }
      ];
      
      setSchedule(mockSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedule.filter(item => item.date === dateStr);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
                <h1 className="font-display text-2xl font-black text-slate2-900">Schedule</h1>
                <p className="text-sm text-slate2-600">Manage your availability and calendar</p>
              </div>
            </div>
            <button className="bg-brand-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Time Slot
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => {
              const prevWeek = new Date(currentWeek);
              prevWeek.setDate(currentWeek.getDate() - 7);
              setCurrentWeek(prevWeek);
            }}
            className="p-2 rounded-lg border border-slate2-200 hover:bg-slate2-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate2-600" />
          </button>
          
          <div className="text-center">
            <h2 className="font-semibold text-slate2-900">
              {getWeekDays()[0].toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })} - 
              {getWeekDays()[6].toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          
          <button 
            onClick={() => {
              const nextWeek = new Date(currentWeek);
              nextWeek.setDate(currentWeek.getDate() + 7);
              setCurrentWeek(nextWeek);
            }}
            className="p-2 rounded-lg border border-slate2-200 hover:bg-slate2-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate2-600 rotate-180" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          {getWeekDays().map((day, index) => {
            const daySchedule = getScheduleForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={index} 
                className={`rounded-xl border ${isCurrentDay ? 'border-brand-500 bg-brand-50' : 'border-slate2-200 bg-white'} p-4 min-h-[200px]`}
              >
                <div className="mb-3">
                  <div className="font-semibold text-slate2-900">{getDayName(day)}</div>
                  <div className={`text-2xl font-bold ${isCurrentDay ? 'text-brand-600' : 'text-slate2-700'}`}>
                    {getDayNumber(day)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {daySchedule.map(item => (
                    <div 
                      key={item.id}
                      className={`p-2 rounded-lg text-xs ${getStatusColor(item.isAvailable)}`}
                    >
                      <div className="font-medium mb-1">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </div>
                      <div className="font-medium">
                        {item.isAvailable ? 'Available' : item.serviceType}
                      </div>
                      {!item.isAvailable && (
                        <div className="text-xs opacity-75 mt-1">
                          {item.description}
                        </div>
                      )}
                      {item.isAvailable && (
                        <div className="text-xs opacity-75 mt-1">
                          {item.location}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {daySchedule.length === 0 && (
                    <div className="text-xs text-slate2-400 text-center py-4">
                      No schedule
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule List */}
        <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate2-900 mb-4">All Schedule Items</h3>
          
          <div className="space-y-3">
            {schedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate2-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate2-900 mb-2">No schedule items</h4>
                <p className="text-slate2-600">Add time slots to manage your availability</p>
              </div>
            ) : (
              schedule.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-slate2-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(item.isAvailable)}`}>
                      {item.isAvailable ? <Clock className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate2-900">
                        {item.isAvailable ? 'Available' : item.serviceType}
                      </div>
                      <div className="text-sm text-slate2-600">
                        {new Date(item.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-sm text-slate2-600">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </div>
                      <div className="text-sm text-slate2-600">
                        {item.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border border-slate2-200 hover:bg-slate2-50 transition-colors">
                      <Edit2 className="h-4 w-4 text-slate2-600" />
                    </button>
                    <button className="p-2 rounded-lg border border-slate2-200 hover:bg-rose-50 transition-colors">
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
