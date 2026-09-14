'use client';

import React, { useState } from 'react';
import { ArrowUp, Mic, Sparkles, CornerDownLeft } from 'lucide-react';
import clsx from 'clsx';

export interface AskInputProps {
  placeholder?: string;
  onSubmit?: (prompt: string) => void;
  onVoiceClick?: () => void;
  suggestions?: string[];
  isLoading?: boolean;
}

export const AskInput: React.FC<AskInputProps> = ({
  placeholder = 'Ask anything about your data... (e.g. "Show sales by category this month")',
  onSubmit,
  onVoiceClick,
  suggestions = [
    'Show revenue for the last 30 days',
    'Compare conversion rate with previous month',
    'Which region had the largest growth?',
    'Top 5 products by margin',
  ],
  isLoading = false,
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit?.(value);
    setValue('');
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setValue(suggestion);
    onSubmit?.(suggestion);
  };

  return (
    <div className="w-full space-y-3">
      {/* Query Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-xl bg-prism-bg-card border border-prism-border-subtle focus-within:border-prism-accent-blue/80 focus-within:ring-1 focus-within:ring-prism-accent-blue/40 transition-all shadow-lg shadow-black/40 overflow-hidden p-1.5"
      >
        <div className="pl-3 pr-2 text-prism-accent-blue">
          <Sparkles className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2 px-1 text-sm font-sans text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none"
        />

        <div className="flex items-center gap-1.5 pr-1">
          {/* Voice Trigger */}
          <button
            type="button"
            onClick={onVoiceClick}
            title="PRISM Voice"
            className="p-2 rounded-lg bg-prism-bg-elevated/80 border border-prism-border-subtle hover:border-prism-border-hover hover:text-prism-accent-purple text-prism-text-muted transition-colors group"
          >
            <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="p-2 rounded-lg bg-prism-accent-blue text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-sm"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 block border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>

      {/* Suggested Queries */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-prism-text-muted mr-1">Suggested:</span>
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="px-2.5 py-1 rounded-full bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover hover:bg-prism-bg-elevated text-[11px] font-sans text-prism-text-secondary hover:text-prism-text-primary transition-colors flex items-center gap-1 group"
            >
              <span>{item}</span>
              <CornerDownLeft className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
