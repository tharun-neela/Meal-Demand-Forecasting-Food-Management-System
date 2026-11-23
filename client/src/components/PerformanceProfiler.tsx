"use client";

import React, { Profiler, ProfilerOnRenderCallback } from "react";

// React Profiler onRender callback to identify slow or unnecessary re-renders
export const onRenderProfile: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  // Flag slow renders exceeding 16.6ms (1 frame budget at 60fps)
  if (process.env.NODE_ENV === "development" && actualDuration > 16) {
    console.warn(
      `[React Profiler] Performance Bottleneck: <${id}> took ${actualDuration.toFixed(
        2
      )}ms to render during "${phase}". (Base estimate: ${baseDuration.toFixed(
        2
      )}ms)`
    );
  }
};

interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
}

export default function PerformanceProfiler({ id, children }: PerformanceProfilerProps) {
  return (
    <Profiler id={id} onRender={onRenderProfile}>
      {children}
    </Profiler>
  );
}
