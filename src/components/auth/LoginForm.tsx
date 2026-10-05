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

    // Case 4: Pre-validation on frontend
    if (!username.trim() || !password) {
      const msg = 'Please enter both username/email and password.';
      setError(msg);
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(username.trim(), password);

      const isRoleAllowed =
        user.role === role || (role === 'admin' && user.role === 'hr');

      if (isRoleAllowed) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        router.push(redirectPath);
      } else {
        const roleMsg = `Access denied. This portal is for ${role} accounts only. Your role is '${user.role}'.`;
        setError(roleMsg);
        toast({
          title: "Access Denied",
          description: roleMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      let errMsg = err.response?.data?.message || err.message;
      if (
        !err.response &&
        (err.code === 'ERR_NETWORK' ||
          err.message === 'Network Error' ||
          err.message?.includes('Network') ||
          err.message?.includes('connect') ||
          err.message?.includes('ECONNREFUSED'))
      ) {
        errMsg = 'Cannot connect to backend server at http://localhost:5000. Please ensure the backend server is running.';
      } else if (!errMsg) {
        errMsg = 'Invalid username/email or password.';
      }

      setError(errMsg);
      toast({
        title: "Login Failed",
        description: errMsg,
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
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder={role === 'admin' ? "admin (or admin@taskflow.com)" : "samvedna_kumari (or email)"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
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

            <div className="bg-muted/50 rounded p-2.5 text-xs text-muted-foreground">
              <strong>Test Credentials:</strong>
              {role === 'admin' ? (
                <p className="mt-0.5 font-mono">Username: <strong>admin</strong> | Password: <strong>password</strong></p>
              ) : (
                <p className="mt-0.5 font-mono">Username: <strong>samvedna_kumari</strong> | Password: <strong>password</strong></p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-5 shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
