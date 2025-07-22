import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export function DebugConnection() {
  const { debugConnection } = useAuthStore();
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setResult(null);
    
    try {
      const success = await debugConnection();
      setResult(success);
    } catch (error) {
      console.error('Debug connection error:', error);
      setResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Test the connection to the user_access table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>

        {result !== null && (
          <Alert variant={result ? "default" : "destructive"}>
            {result ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result 
                ? "Database connection successful! The user_access table is accessible."
                : "Database connection failed! Check your Supabase configuration and table permissions."
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 