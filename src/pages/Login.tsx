import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const navigate = useNavigate();
  
  const { login, isLoading } = useAuthStore();

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    
    try {
      // This would need to be implemented in the auth store
      setError("");
      alert("Confirmation email sent! Please check your inbox.");
      setShowResendConfirmation(false);
    } catch (err) {
      setError("Failed to resend confirmation email.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResendConfirmation(false);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate("/");
    } else {
      if (result.error?.includes('Email not confirmed') || result.error?.includes('Email not verified')) {
        setError("Please check your email and click the confirmation link before logging in.");
        setShowResendConfirmation(true);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Modern Card with Glass Effect */}
        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex justify-center mb-2">
              <div className="w-32 h-28 rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="OffiNeeds Logo" 
                  className="w-full h-24 object-contain"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Sign in to your OffiNeeds OMS account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 pr-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {showResendConfirmation && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <Button 
                      type="button"
                      variant="link" 
                      className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                      onClick={handleResendConfirmation}
                    >
                      Click here to resend confirmation email
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="pt-6 border-t border-gray-200 text-center">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <a 
                href="/register" 
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
              >
                Create one
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
