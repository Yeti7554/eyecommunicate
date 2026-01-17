import { useState, useMemo } from 'react';
import { TwitterPost, SortOption } from '@/types/twitter';
import { SortTabs } from './SortTabs';
import { PostCard } from './PostCard';

interface ContentSectionProps {
  title: string;
  icon: React.ReactNode;
  posts: TwitterPost[];
}

export function ContentSection({ title, icon, posts }: ContentSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('likes');

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [posts, sortBy]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground font-medium">
            {posts.length}
          </span>
        </div>
        <SortTabs activeSort={sortBy} onSortChange={setSortBy} />
      </div>

      <div className="space-y-4">
        {sortedPosts.map((post, index) => (
          <PostCard key={post.id} post={post} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
