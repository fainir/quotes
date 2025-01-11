export interface IQuote {
  id: number;
  author: string;
  body: string;
  tags: string[];
}

export interface QuoteResponse {
  quotes: IQuote[];
  page: number;
  last_page: boolean;
}

export interface FavQsApiResponse {
  page: number;
  last_page: boolean;
  quotes: Array<{
    id: number;
    dialogue: boolean;
    private: boolean;
    tags: string[];
    url: string;
    favorites_count: number;
    upvotes_count: number;
    downvotes_count: number;
    author: string;
    author_permalink: string;
    body: string;
  }>;
  error_code?: number;
  message?: string;
}

export interface TypeaheadItem {
  count: number;
  permalink: string;
  name: string;
}

export interface TypeaheadResponse {
  authors: TypeaheadItem[];
  tags: TypeaheadItem[];
  users: TypeaheadItem[];
} 