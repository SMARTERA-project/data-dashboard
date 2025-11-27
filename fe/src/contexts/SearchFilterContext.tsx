import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type RegionLevels = Partial<
  Record<'nuts1' | 'nuts2' | 'nuts3' | 'area', string>
>;

export type SearchFilterContextValue = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  suggestedSearches: string[];
  regionLevels: RegionLevels;
  selectedLevels: Set<keyof RegionLevels>;
  toggleLevel: (lvl: keyof RegionLevels) => void;
  clearFilters: () => void;
};

const SearchFilterContext = createContext<SearchFilterContextValue | null>(
  null
);

export const useSearch = () => {
  const ctx = useContext(SearchFilterContext);
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider />');
  return ctx;
};

export const SearchProvider: React.FC<{
  regionLevels: RegionLevels;
  regionKey: string;
  tabKey: string;
  suggestedSearches?: string[];
  initialQuery?: string;
  children: React.ReactNode;
}> = ({
  regionLevels,
  regionKey,
  tabKey,
  suggestedSearches = [],
  initialQuery = '',
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const allAvailableLevels = useMemo<Set<keyof RegionLevels>>(() => {
    const out = new Set<keyof RegionLevels>();
    (['nuts1', 'nuts2', 'nuts3', 'area'] as const).forEach(k => {
      const v = regionLevels?.[k];
      if (v) out.add(k);
    });
    return out;
  }, [regionLevels]);

  const [selectedLevels, setSelectedLevels] =
    useState<Set<keyof RegionLevels>>(allAvailableLevels);

  useEffect(() => {
    setSelectedLevels(allAvailableLevels);
  }, [regionKey]);

  useEffect(() => {
    setSearchQuery('');
  }, [tabKey]);

  const toggleLevel = (lvl: keyof RegionLevels) => {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl);
      else next.add(lvl);
      return next;
    });
  };

  const clearFilters = () => setSelectedLevels(new Set());

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      suggestedSearches,
      regionLevels,
      selectedLevels,
      toggleLevel,
      clearFilters,
    }),
    [searchQuery, suggestedSearches, regionLevels, selectedLevels]
  );

  return (
    <SearchFilterContext.Provider value={value}>
      {children}
    </SearchFilterContext.Provider>
  );
};
