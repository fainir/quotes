// Base interfaces
export interface Quote {
  id: string;
  body: string;
  author: string;
  tags: string[];
}

export interface TypeaheadTag {
  name: string;
  permalink: string;
  count: number;
}

// Component Props interfaces
export interface QuoteCardProps {
  quote: Quote;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}

export interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

// API interfaces
export interface QuoteParams {
  count: string;
  tags?: string;
  matchAll?: string;
}

export interface TypeaheadResponse {
  tags: TypeaheadTag[];
}

// State interfaces
export interface QuoteState {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
}

export interface TagState {
  selectedTags: string[];
  availableTags: TypeaheadTag[];
  isTagsLoading: boolean;
  searchTerm: string;
  isDropdownOpen: boolean;
  matchAll: boolean;
}

// Utility interfaces
export interface ShareData {
  title: string;
  text: string;
} 