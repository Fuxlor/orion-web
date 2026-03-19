"use client";

import { useState, useEffect } from "react";

export default function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const duration = 900;
    const step = Math.max(Math.ceil(end / (duration / 16)), 1);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
