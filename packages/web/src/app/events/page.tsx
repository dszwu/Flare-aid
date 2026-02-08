"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { EVENT_TYPE_CONFIG } from "@flare-aid/common";

interface EventData {
  id: number;
  type: string;
  title: string;
  description: string;
  severityScore: number;
  latitude: number;
  longitude: number;
  source: string;
  createdAt: string;
  totalDonatedWei?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Disasters</h1>
            <p className="text-gray-500">
              Browse verified disaster events and donate to relief organizations.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Events
            </button>
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === key
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={filter === key ? { backgroundColor: config.color } : {}}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse">
                  <div className="h-1.5 bg-gray-200 rounded-t-xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-100 rounded w-1/3" />
                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No events found</h2>
              <p className="text-gray-500">
                {filter !== "all"
                  ? `No ${filter} events currently active. Try a different filter.`
                  : "No approved events yet. Check back soon or trigger data ingestion."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
