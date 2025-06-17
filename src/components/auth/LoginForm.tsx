"use client";

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  role: Role;
  redirectPath: string;
}

export default function LoginForm({ role, redirectPath }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(username, password);
      if (user && user.role === role) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        router.push(redirectPath);
      } else if (user && user.role !== role) {
        setError(`Access denied. This login is for ${role}s only.`);
        toast({
          title: "Login Failed",
          description: `Access denied. This login is for ${role}s only.`,
          variant: "destructive",
        });
      }
      else {
        setError('Invalid username or password.');
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <LogIn className="mr-2 h-7 w-7" /> 
            {role.charAt(0).toUpperCase() + role.slice(1)} Login
          </CardTitle>
          <CardDescription>
            Please enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-base"
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
                required
                className="text-base"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
