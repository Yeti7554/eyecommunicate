export interface TwitterPost {
  id: string;
  content: string;
  likes: number;
  comments: number;
  impressions: number;
  createdAt: string;
  isComment?: boolean;
  replyTo?: string;
}

export type SortOption = 'likes' | 'comments' | 'impressions';
