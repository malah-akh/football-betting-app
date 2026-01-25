import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { BottomNav } from "@/app/components/BottomNav";
import { Header } from "@/app/components/Header";

export function RegisterScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !success) {
      navigate("/profile");
    }
  }, [user, navigate, success]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      const shouldSkipEmailConfirmation = import.meta.env.VITE_SKIP_EMAIL_CONFIRMATION === 'true';

      if (data.session || (data.user && shouldSkipEmailConfirmation)) {
        // Auto-confirmed (e.g. if email confirmation is disabled) or intentionally skipped
        navigate("/profile");
      } else if (data.user) {
        // Email confirmation required
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      alert("Confirmation email resent!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative">
        <Header />
        <div className="flex-1 flex flex-col justify-center px-4 w-full max-w-md mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We've sent a confirmation link to <strong>{email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={handleResendEmail} 
                disabled={resendLoading}
                className="w-full"
              >
                {resendLoading ? "Sending..." : "Resend Email"}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/login">
                <Button variant="ghost">Back to Login</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative">
      <Header />
      
      <div className="flex-1 flex flex-col justify-center px-4 w-full max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>
    </div>
  );
}
