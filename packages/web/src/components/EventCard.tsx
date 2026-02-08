import { cn } from "@/lib/utils";
import { getSeverityLabel, getSeverityColor, EVENT_TYPE_CONFIG } from "@flare-aid/common";
import Link from "next/link";

interface EventCardProps {
  event: {
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
  };
}

export function EventCard({ event }: EventCardProps) {
  const typeConfig = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.other;
  const sevColor = getSeverityColor(event.severityScore);
  const sevLabel = getSeverityLabel(event.severityScore);
  const donated = event.totalDonatedWei
    ? (Number(event.totalDonatedWei) / 1e18).toFixed(2)
    : "0.00";

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-flare-300 hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
        {/* Severity bar */}
        <div className="h-1.5" style={{ backgroundColor: sevColor }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{typeConfig.icon}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: typeConfig.color }}
              >
                {typeConfig.label}
              </span>
            </div>
            <div
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold",
                event.severityScore >= 90 && "severity-critical"
              )}
              style={{ backgroundColor: `${sevColor}20`, color: sevColor }}
            >
              {sevLabel} ({event.severityScore})
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-flare-600 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.latitude.toFixed(1)}, {event.longitude.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1 text-flare-600 font-semibold">
              <span>{donated} C2FLR</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
