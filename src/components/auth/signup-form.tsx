
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AccountType = "listener" | "creator" | "brand";

interface SignupFormProps {
  defaultAccountType?: AccountType;
}

export function SignupForm({ defaultAccountType = "listener" }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            accountType
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to Audifyx.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Account Type</Label>
        <Tabs 
          defaultValue={accountType} 
          onValueChange={(v) => setAccountType(v as AccountType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-audifyx-charcoal">
            <TabsTrigger value="listener">Listener</TabsTrigger>
            <TabsTrigger value="creator">Creator</TabsTrigger>
            <TabsTrigger value="brand">Brand</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-audifyx-charcoal/50 border-audifyx-purple/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Username (cannot be changed later)</Label>
        <Input
          id="username"
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-audifyx-charcoal/50 border-audifyx-purple/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-audifyx-charcoal/50 border-audifyx-purple/20"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid" 
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
