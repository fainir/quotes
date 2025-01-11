import React, { useState, useRef, useEffect } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { quotesApi } from '../services/api';
import { TypeaheadTag } from '../types/models';
import { ALL_TAGS } from '../constants/tags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[] | ((prev: string[]) => string[])) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableTags, setAvailableTags] = useState<TypeaheadTag[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setIsTagsLoading(true);
      try {
        const tags = await quotesApi.getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      } finally {
        setIsTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTag = (tagName: string) => {
    if (tagName === ALL_TAGS) {
      onTagsChange([ALL_TAGS]);
      return;
    }

    onTagsChange((prev: string[]) => {
      const tagIndex = prev.indexOf(tagName);
      if (tagIndex === -1) {
        const newTags = prev.filter((tag: string) => tag !== ALL_TAGS);
        return newTags.length < 5 ? [...newTags, tagName] : newTags;
      }
      
      const newTags = prev.filter((_: string, index: number) => index !== tagIndex);
      return newTags.length === 0 ? [ALL_TAGS] : newTags;
    });
  };

  const clearTags = () => {
    onTagsChange([ALL_TAGS]);
    setSearchTerm('');
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer bg-white"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-400">Select tags...</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tags..."
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {selectedTags.length > 0 && !selectedTags.includes(ALL_TAGS) && (
                <button
                  type="button"
                  onClick={clearTags}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Clear all tags"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {isTagsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading tags...</div>
            ) : filteredTags.length === 0 && searchTerm ? (
              <div className="p-4 text-center text-gray-500">No tags found</div>
            ) : (
              <>
                <div
                  key="all-tags-option"
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 border-b ${
                    selectedTags.includes(ALL_TAGS) ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => toggleTag(ALL_TAGS)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(ALL_TAGS)}
                      onChange={() => {}}
                      className="rounded text-purple-600 focus:ring-purple-500"
                      title="Select all tags"
                      aria-label="Select all tags"
                    />
                    <span className="font-medium">Select all tags</span>
                  </div>
                </div>
                {filteredTags.map((tag) => (
                  <div
                    key={tag.permalink}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                      selectedTags.includes(tag.name) ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => toggleTag(tag.name)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => {}}
                      className="rounded text-purple-600 focus:ring-purple-500"
                      title={`Select ${tag.name} tag`}
                      aria-label={`Select ${tag.name} tag`}
                    />
                    <span>{tag.name}</span>
                    <span className="text-gray-400 text-sm">({tag.count})</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
} 