import React, { useState } from "react";
import { QuoteCard } from "../components/QuoteCard";
import { quotesApi } from "../services/api";
import { Quote } from "../types/models";
import { TagSelector } from "../components/TagSelector";
import { ALL_TAGS } from "../constants/tags";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { getUserFriendlyErrorMessage, AppError, ErrorCode } from "../types/error.types";

function QuotesDisplayContent() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [numberOfQuotes, setNumberOfQuotes] = useState<string>("5");
  const [selectedTags, setSelectedTags] = useState<string[]>([ALL_TAGS]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const params = Number(numberOfQuotes) || 1;
      const tags = selectedTags.filter(tag => tag !== ALL_TAGS);
      const matchAll = !selectedTags.includes(ALL_TAGS);
      const quotes = await quotesApi.getQuotes(params, tags, matchAll);
      setQuotes(quotes);
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
      // Clear quotes if it's a NOT_FOUND error
      if (err instanceof AppError && err.code === ErrorCode.NOT_FOUND) {
        setQuotes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Quotes Of the Day</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="flex gap-4 justify-center items-start flex-wrap">
          <div className="flex flex-col gap-2">
            <label htmlFor="numberOfQuotes" className="text-sm font-medium text-gray-700">
              Number of Quotes
            </label>
            <input
              id="numberOfQuotes"
              type="number"
              value={numberOfQuotes}
              onChange={(e) => setNumberOfQuotes(e.target.value)}
              min="1"
              max="50"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-32"
              required
            />
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">
              Select Tags
            </label>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          <div className="self-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Get Quotes"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="text-red-500 text-center mb-4 max-w-2xl mx-auto bg-red-50 p-4 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(Number(numberOfQuotes) || 1)].map((_, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-md animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-4 flex gap-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <QuoteCard
              key={quote.id || index}
              quote={quote}
              selectedTags={selectedTags}
              toggleTag={(tag) =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev.filter((t) => t !== ALL_TAGS), tag]
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function QuotesDisplay() {
  return (
    <ErrorBoundary>
      <QuotesDisplayContent />
    </ErrorBoundary>
  );
}
