import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AboutSectionProps {
  symbol: string;
}

export function AboutSection({ symbol }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/summary", symbol],
  });

  const profile = (data as any)?.data;

  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  const description = profile.description || "";
  const isLong = description.length > 250;
  const displayText = expanded || !isLong ? description : description.slice(0, 250) + "...";

  return (
    <div className="px-4 py-4" style={{ borderBottom: "1px solid #0E2040" }}>
      <h3 className="text-base font-bold mb-2" style={{ color: "#F1F5F9" }}>
        About
      </h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {profile.sector && profile.sector !== "N/A" && (
          <Badge style={{ backgroundColor: "rgba(6, 182, 212, 0.15)", color: "#E3B341", border: "none" }}>
            {profile.sector}
          </Badge>
        )}
        {profile.industry && profile.industry !== "N/A" && (
          <Badge style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "none" }}>
            {profile.industry}
          </Badge>
        )}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold mt-1"
          style={{ color: "#E3B341" }}
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
