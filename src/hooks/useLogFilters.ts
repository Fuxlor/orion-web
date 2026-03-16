"use client";

import { useState, useCallback } from "react";
import type { LogSearchFilters } from "./useLogSearch";

const DEFAULT_LIMIT = 500;

export function useLogFilters(initialSources?: string[]) {
  const [search, setSearch] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>(initialSources ?? []);
  const [servers, setServers] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const isFiltered =
    !!search ||
    levels.length > 0 ||
    sources.length > 0 ||
    servers.length > 0 ||
    !!from ||
    !!to ||
    tags.length > 0;

  const clearAll = useCallback(() => {
    setSearch("");
    setLevels([]);
    setSources(initialSources ?? []);
    setServers([]);
    setFrom("");
    setTo("");
    setTags([]);
    setLimit(DEFAULT_LIMIT);
  }, [initialSources]);

  const filters: LogSearchFilters = {
    search: search || undefined,
    levels: levels.length > 0 ? levels : undefined,
    sources: sources.length > 0 ? sources : undefined,
    servers: servers.length > 0 ? servers : undefined,
    from: from || undefined,
    to: to || undefined,
    tags: tags.length > 0 ? tags : undefined,
    limit,
  };

  return {
    search, setSearch,
    levels, setLevels,
    sources, setSources,
    servers, setServers,
    from, setFrom,
    to, setTo,
    tags, setTags,
    limit, setLimit,
    isFiltered,
    clearAll,
    filters,
  };
}
