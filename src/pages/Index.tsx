import { useState } from 'react';
import { FileText, MessageCircle, Sparkles, AlertCircle } from 'lucide-react';
import { UsernameInput } from '@/components/UsernameInput';
import { ContentSection } from '@/components/ContentSection';
import { twitterApi } from '@/lib/api/twitter';
import { TwitterPost } from '@/types/twitter';
import { toast } from 'sonner';

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<TwitterPost[]>([]);
  const [comments, setComments] = useState<TwitterPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUsernameSubmit = async (submittedUsername: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await twitterApi.scrapeProfile(submittedUsername);
      
      if (response.success && response.data) {
        const allPosts = response.data.posts;
        const userPosts = allPosts.filter(p => !p.isComment);
        const userComments = allPosts.filter(p => p.isComment);
        
        setPosts(userPosts);
        setComments(userComments);
        setUsername(response.data.username);
        toast.success(`Found ${allPosts.length} posts for @${response.data.username}`);
      } else {
        setError(response.error || 'Failed to fetch profile data');
        toast.error(response.error || 'Failed to scrape profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to connect to the server');
      toast.error('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">X Analytics</h1>
              <p className="text-sm text-muted-foreground">Rank your posts & comments</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Input Section */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              See what <span className="text-gradient">performs best</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Enter your username to analyze and rank all your posts and comments by engagement
            </p>
          </div>
          
          <UsernameInput onSubmit={handleUsernameSubmit} isLoading={isLoading} />

          {username && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
              Showing results for @{username}
            </div>
          )}
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Results Sections */}
      {username && !error && (
        <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
          {posts.length > 0 && (
            <ContentSection
              title="Your Posts"
              icon={<FileText className="w-5 h-5" />}
              posts={posts}
            />
          )}
          
          {comments.length > 0 && (
            <ContentSection
              title="Your Comments"
              icon={<MessageCircle className="w-5 h-5" />}
              posts={comments}
            />
          )}
          
          {posts.length === 0 && comments.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-border text-center">
              <p className="text-muted-foreground">
                No posts found. X/Twitter may be blocking the scraper. Try again later.
              </p>
            </div>
          )}
        </main>
      )}

      {/* Empty State */}
      {!username && (
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="p-8 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Enter your Twitter/X username above to see your analytics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
