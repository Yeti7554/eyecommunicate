import { motion } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorScreenProps {
  error: string;
}

export function ErrorScreen({ error }: ErrorScreenProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 max-w-lg text-center"
      >
        <div className="relative">
          <Camera className="w-24 h-24 text-destructive" />
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <AlertCircle className="w-10 h-10 text-destructive fill-background" />
          </motion.div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Camera Access Required
          </h1>
          <p className="text-lg text-muted-foreground">
            {error}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 mt-4">
          <p className="text-sm text-muted-foreground">
            To use EyeYesNo, please:
          </p>
          <ol className="text-left text-muted-foreground space-y-2">
            <li>1. Click the camera icon in your browser's address bar</li>
            <li>2. Select "Allow" for camera access</li>
            <li>3. Refresh the page</li>
          </ol>
        </div>
        
        <Button
          onClick={handleRetry}
          size="lg"
          className="mt-4"
        >
          Retry
        </Button>
      </motion.div>
    </div>
  );
}
