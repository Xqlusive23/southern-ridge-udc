"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CinematicBackdrop({
  clips,
  className,
  dim = "default",
}: {
  clips: string[];
  className?: string;
  dim?: "default" | "login";
}) {
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || clips.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % clips.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [clips.length]);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      if (index === active) {
        const play = video.play();
        if (play) play.catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [active, started]);

  return (
    <div className={cn("inset-0 overflow-hidden bg-[#0B2340]", className ?? "absolute")}>
      {clips.map((clip, index) => (
        <video
          key={clip}
          ref={(node) => {
            videos.current[index] = node;
          }}
          src={clip}
          muted
          loop
          playsInline
          preload={index === 0 ? "auto" : "metadata"}
          aria-hidden
          onLoadedData={() => {
            if (index === 0) setStarted(true);
          }}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out",
            started && index === active ? "opacity-100" : "opacity-0",
            started && index === active && "animate-cinematic-zoom",
          )}
        />
      ))}
      <div
        className={cn(
          "absolute inset-0",
          dim === "login"
            ? "bg-[#0B2340]/55"
            : "bg-[#0B2340]/62",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B2340]/35 via-transparent to-[#0B2340]/80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B2340]/50 to-transparent" />
    </div>
  );
}
