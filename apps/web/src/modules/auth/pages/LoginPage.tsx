import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Factory, LogIn } from 'lucide-react';
import { loginSchema } from '../schemas/auth.schema';
import type { LoginInput } from '../schemas/auth.schema';
import { useLogin } from '../hooks/useAuth';
import { Input } from '@/components';

export function LoginPage() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-secondary/30 p-4 md:p-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-lg">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Factory className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to Factory Resource Management System
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Username"
                {...register('username')}
                error={errors.username?.message}
                disabled={loginMutation.isPending}
                placeholder="Enter your username"
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  disabled={loginMutation.isPending}
                  placeholder="Enter your password"
                />
                <div className="mt-2 text-right">
                  <button type="button" className="text-xs font-medium text-primary hover:underline focus:outline-none" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={loginMutation.isPending}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors"
            >
              {loginMutation.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-muted/50 px-8 py-4 text-center text-xs text-muted-foreground border-t">
          FRMS v1.0.0 &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
