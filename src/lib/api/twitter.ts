import { supabase } from '@/integrations/supabase/client';
import { TwitterPost } from '@/types/twitter';

export interface TwitterApiResponse {
  success: boolean;
  data?: {
    posts: TwitterPost[];
    username: string;
    scrapedAt: string;
  };
  error?: string;
}

export const twitterApi = {
  async scrapeProfile(username: string): Promise<TwitterApiResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-twitter-profile', {
        body: { username }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to scrape profile'
        };
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: data?.error || 'Failed to scrape profile'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (err) {
      console.error('Error calling scrape-twitter-profile function:', err);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }
};