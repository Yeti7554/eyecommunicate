import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { HostDashboard } from '@/components/game/HostDashboard';

const Index = () => {
  const { user, loading, signInWithEmail, signInWithPhone, signInWithGoogle, signInWithApple } = useAuth();

  console.log('Index render:', { user: user?.email, loading, userExists: !!user });

  if (loading) {
    console.log('Showing loading spinner because loading =', loading);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Loading is false, user =', user);

  if (!user) {
    console.log('No user, showing auth screen');
    return (
      <AuthScreen
        onSignInEmail={signInWithEmail}
        onSignInPhone={signInWithPhone}
        onSignInGoogle={signInWithGoogle}
        onSignInApple={signInWithApple}
      />
    );
  }

  console.log('User exists, showing dashboard');
  return <HostDashboard />;
};

export default Index;
