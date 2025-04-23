
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock authentication for now
    // In reality, this would use Supabase Auth
    setTimeout(() => {
      localStorage.setItem("audifyx-user", JSON.stringify({
        id: "user-123",
        email,
        username: email.split("@")[0],
        accountType: "listener"
      }));
      
      toast({
        title: "Successfully logged in!",
        description: "Welcome back to Audifyx.",
      });
      
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-xs text-audifyx-purple hover:underline">
            Forgot password?
          </a>
        </div>
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
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
