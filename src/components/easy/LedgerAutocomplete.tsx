import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { fuzzyMatch } from '@/services/voucherPatternService';
import { cn } from '@/lib/utils';

interface LedgerAutocompleteProps {
  ledgers: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suggested?: string[];
}

const LedgerAutocomplete = ({
  ledgers,
  value,
  onChange,
  placeholder = 'Search ledger...',
  className,
  suggested = [],
}: LedgerAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query !== value ? fuzzyMatch(query, ledgers) : [];
  const showSuggested = !query && suggested.length > 0;
  const displayItems = showSuggested ? suggested : results;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (query !== value) setQuery(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value, query]);

  const select = (item: string) => {
    onChange(item);
    setQuery(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || displayItems.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(i => Math.min(i + 1, displayItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayItems[highlightIndex]) select(displayItems[highlightIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery(value);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        ref={inputRef}
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setIsOpen(true);
          setHighlightIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9"
      />
      {isOpen && displayItems.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
          {showSuggested && (
            <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
              ⚡ Suggested
            </div>
          )}
          {displayItems.map((item, i) => (
            <button
              key={item}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm hover:bg-accent cursor-pointer',
                i === highlightIndex && 'bg-accent'
              )}
              onMouseDown={() => select(item)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LedgerAutocomplete;
