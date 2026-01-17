import { useState } from 'react';
import { Search, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

export function UsernameInput({ onSubmit, isLoading }: UsernameInputProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim().replace('@', ''));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative flex gap-3">
        <div className="relative flex-1">
          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your Twitter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-12 h-14 text-lg bg-card border-border focus:border-primary transition-colors"
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="h-14 px-8"
          disabled={!username.trim() || isLoading}
        >
          <Search className="w-5 h-5 mr-2" />
          Analyze
        </Button>
      </div>
    </form>
  );
}
