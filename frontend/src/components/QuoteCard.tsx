import { ClipboardIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import { QuoteCardProps } from '../types/models';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from 'react-share';

export function QuoteCard({ quote, selectedTags, toggleTag }: QuoteCardProps) {
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareButtons(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyQuote = async () => {
    const textToCopy = `"${quote.body}" — ${quote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedQuoteId(quote.id);
      setTimeout(() => setCopiedQuoteId(null), 2000);
    } catch (err) {
      console.error('Failed to copy quote:', err);
    }
  };

  const shareText = `"${quote.body}" — ${quote.author}`;
  const shareUrl = window.location.href;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <blockquote className="text-lg italic mb-2">"{quote.body}"</blockquote>
          <cite className="text-gray-600 block text-right">— {quote.author}</cite>
        </div>
        <div className="flex gap-2 relative">
          <button
            onClick={copyQuote}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="Copy quote"
          >
            <ClipboardIcon className="w-5 h-5" />
            {copiedQuoteId === quote.id && (
              <span className="absolute bg-black text-white text-xs px-2 py-1 rounded -mt-8 -ml-4">
                Copied!
              </span>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareButtons(!showShareButtons)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Share quote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </button>
            {showShareButtons && (
              <div ref={shareMenuRef} className="absolute right-0 mt-2 p-2 bg-white rounded-lg shadow-lg z-10 flex gap-2">
                <FacebookShareButton url={shareUrl} title={shareText} className="hover:opacity-80">
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareText} className="hover:opacity-80">
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl} title="Quote of the Day" summary={shareText} className="hover:opacity-80">
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
                <WhatsappShareButton url={shareUrl} title={shareText} className="hover:opacity-80">
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
              </div>
            )}
          </div>
        </div>
      </div>
      {quote.tags && quote.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {quote.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 