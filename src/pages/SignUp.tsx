import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeltaLogo } from '@/components/delta-logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Navigate, useNavigate } from 'react-router-dom';
import { route } from '../firebase/client'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { user, login, isLoading } = useAuth();
  // const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in email and both password fields',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword){
      toast({
        title: 'Passwords mismatched',
        description: 'Please match both password fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const createUser = async (email: string, password: string) => {
      try {
        const response = await fetch(route('/create-user'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        return data.message === 'Successfully created new user';
      } catch (error) {
        console.error('Signup error:', error);

        return false;
      }
    };


    try {
      const signup = await createUser(email, password);

      if (!signup) {
        toast({
          title: 'Signup error:',
          description: 'An error occured creating your account. Please try again some other time',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      } 
      const success = login(email, password);

      if (success) {
        toast({
          title: `Welcome to delta`,
          description: `User ${email}`,
        });
      } else {
        toast({
          title: 'Sign up failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex items-center justify-center bg-muted">
            <div className="text-center px-8">
            <h1 className="text-4xl font-bold mb-4"><DeltaLogo size='lg'/></h1>
            <p className="text-muted-foreground text-lg">
                Empowering productivity and innovation through intelligent tools.
            </p>
            </div>
        </div>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-6">
                <div className="flex justify-center">
                    <DeltaLogo size="lg" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
                    <CardDescription className="mt-2">
                    Create your Neuron Delta account
                    </CardDescription>
                </div>
                </CardHeader>

                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        placeholder="Choose your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11"
                    />
                    </div> */}
                    <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11"
                        autoComplete="email"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11"
                        autoComplete="current-password"
                    />
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm your password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11"
                    />
                    </div>

                    <div className="pt-4">
                    <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating your account...
                        </>
                        ) : (
                        'Register'
                        )}
                    </Button>
                    </div>
                </form>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex justify-center text-md space-y-1 ">
                    <p>
                      Alredy a member?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-primary font-semibold hover:underline"
                      >
                        Log in now!
                      </button>
                    </p>
                  </div>
                </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
