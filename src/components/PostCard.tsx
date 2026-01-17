import { TwitterPost } from '@/types/twitter';
import { Heart, MessageCircle, Eye, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: TwitterPost;
  rank: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function PostCard({ post, rank }: PostCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -left-3 -top-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
        {rank}
      </div>
      
      {post.isComment && post.replyTo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Reply className="w-3 h-3" />
          <span>Replying to <span className="text-primary">{post.replyTo}</span></span>
        </div>
      )}
      
      <p className="text-foreground leading-relaxed mb-4 group-hover:text-foreground/90">
        {post.content}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">{formatNumber(post.likes)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{formatNumber(post.comments)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">{formatNumber(post.impressions)}</span>
          </div>
        </div>
        
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
