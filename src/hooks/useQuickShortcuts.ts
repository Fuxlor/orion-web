"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { PinnedItem, RecentItem } from "@/types";

export function useQuickShortcuts() {
  const [pinned, setPinned] = useState<PinnedItem[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const fetchRecent = () =>
    apiFetch("/api/user/recent")
      .then((r) => r.json())
      .then((d) => setRecent(d.recent ?? []));

  useEffect(() => {
    apiFetch("/api/user/pinned")
      .then((r) => r.json())
      .then((d) => setPinned(d.pinned ?? []));
    fetchRecent();
  }, []);

  const addPinned = async (item: Omit<PinnedItem, "id" | "created_at">) => {
    const res = await apiFetch("/api/user/pinned", {
      method: "POST",
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (res.ok && data.item) {
      setPinned((prev) => [...prev, data.item]);
    }
  };

  const removePinned = async (id: number) => {
    await apiFetch(`/api/user/pinned/${id}`, { method: "DELETE" });
    setPinned((prev) => prev.filter((p) => p.id !== id));
  };

  const visitItem = async (item: Omit<RecentItem, "id" | "visited_at">) => {
    await apiFetch("/api/user/recent", {
      method: "POST",
      body: JSON.stringify(item),
    });
    fetchRecent();
  };

  return { pinned, recent, addPinned, removePinned, visitItem };
}
