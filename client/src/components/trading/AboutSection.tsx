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
    <div className="px-4 py-4" style={{ borderBottom: "1px solid #2B3A4C" }}>
      <h3 className="text-base font-bold mb-2" style={{ color: "#C9D1E2" }}>
        About
      </h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {profile.sector && profile.sector !== "N/A" && (
          <Badge style={{ backgroundColor: "rgba(227, 179, 65, 0.15)", color: "#E3B341", border: "none" }}>
            {profile.sector}
          </Badge>
        )}
        {profile.industry && profile.industry !== "N/A" && (
          <Badge style={{ backgroundColor: "rgba(40, 199, 111, 0.15)", color: "#28C76F", border: "none" }}>
            {profile.industry}
          </Badge>
        )}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#8A93A6" }}>
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
