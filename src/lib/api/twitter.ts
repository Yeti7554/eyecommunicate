import { supabase } from '@/integrations/supabase/client';
import { TwitterPost } from '@/types/twitter';

type ScrapeResponse = {
  success: boolean;
  error?: string;
  data?: {
    posts: TwitterPost[];
    username: string;
    scrapedAt: string;
  };
};

export const twitterApi = {
  async scrapeProfile(username: string): Promise<ScrapeResponse> {
    const { data, error } = await supabase.functions.invoke('scrape-twitter-profile', {
      body: { username },
    });

    if (error) {
      console.error('Error invoking edge function:', error);
      return { success: false, error: error.message };
    }

    return data;
  },
};
