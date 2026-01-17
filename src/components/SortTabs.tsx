import { SortOption } from '@/types/twitter';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle, Eye } from 'lucide-react';

interface SortTabsProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'likes', label: 'Likes', icon: <Heart className="w-4 h-4" /> },
  { value: 'comments', label: 'Comments', icon: <MessageCircle className="w-4 h-4" /> },
  { value: 'impressions', label: 'Impressions', icon: <Eye className="w-4 h-4" /> },
];

export function SortTabs({ activeSort, onSortChange }: SortTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            activeSort === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
