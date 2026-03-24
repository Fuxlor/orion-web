"use client";

import { useState, useEffect, useRef } from "react";

export default function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    let start = currentRef.current;
    const end = value;
    if (start === end) return;
    if (end === 0) {
      currentRef.current = 0;
      setDisplay(0);
      return;
    }
    const duration = 600;
    const diff = Math.abs(end - start);
    const step = Math.max(Math.ceil(diff / (duration / 16)), 1);
    const timer = setInterval(() => {
      if (end > start) {
        start = Math.min(start + step, end);
      } else {
        start = Math.max(start - step, end);
      }
      currentRef.current = start;
      setDisplay(start);
      if (start === end) clearInterval(timer);
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
