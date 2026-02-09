
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MonkeyLogo } from '@/components/icons/monkey-logo';
import { initiateEmailSignIn, initiateEmailSignUp, useAuth, initiateGoogleSignIn, useUser, handleRedirectResult } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type UserFormValue = z.infer<typeof formSchema>;

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);


export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Manages local loading state (e.g., form submission)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    // This effect simply tracks Firebase's own loading state.
    // When isUserLoading becomes false, we know Firebase has checked the auth state.
    if (!isUserLoading) {
      setIsInitialLoading(false);
    }
  }, [isUserLoading]);

  useEffect(() => {
    // This effect handles navigation based on the user state from our hook.
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await initiateEmailSignIn(auth, data.email, data.password);
      } else {
        await initiateEmailSignUp(auth, data.email, data.password);
      }
      // On success, the onAuthStateChanged listener will trigger the redirect in the useEffect above.
    } catch (error) {
        if (error instanceof FirebaseError) {
             toast({
                variant: "destructive",
                title: "Authentication Error",
                description: error.message,
            });
        } else {
             toast({
                variant: "destructive",
                title: "An unexpected error occurred.",
                description: "Please try again.",
            });
        }
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    initiateGoogleSignIn(auth).catch(error => {
      if (error instanceof FirebaseError) {
        // Don't show a toast for user-cancelled popups
        if (error.code !== 'auth/popup-closed-by-user') {
          toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message,
          });
        }
      } else {
        toast({
              variant: "destructive",
              title: "An unexpected error occurred.",
              description: "Please try again.",
          });
      }
      setIsLoading(false);
    });
    // The onAuthStateChanged listener will handle success and redirect.
    // If there's an error, it's caught above and loading is reset.
  }

  // Show a loading indicator while Firebase is still determining the initial auth state.
  if (isInitialLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div>Loading...</div>
        </div>
    )
  }

  // If we're done with the initial load AND there is a user, it means we're about to redirect.
  // Show a loading indicator to prevent the form from flashing.
  if (!isInitialLoading && user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div>Redirecting...</div>
        </div>
    )
  }


  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
            <MonkeyLogo className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight font-headline text-[#E1B530]">MONEY MAAMA</h1>
        </div>
        <CardTitle className="text-2xl">{isLogin ? 'Welcome Back!' : 'Create an Account'}</CardTitle>
        <CardDescription>
          {isLogin ? "Sign in to your account to continue." : "Enter your details to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>
        </Form>
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            <GoogleIcon />
            Continue with Google
        </Button>

        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="p-1">
            {isLogin ? 'Sign Up' : 'Login'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
