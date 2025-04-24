
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { useLocation } from "react-router-dom";

export function AuthTabs() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [accountType, setAccountType] = useState<"listener" | "creator" | "brand">("listener");
  
  useEffect(() => {
    // Set default tab based on location state if available
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
    
    // Set accountType based on location state if available
    if (location.state?.accountType) {
      setAccountType(location.state.accountType);
    }
  }, [location.state]);

  return (
    <Card className="w-full max-w-md border-audifyx-purple/20 bg-gradient-card shadow-lg">
      <CardHeader className="text-center pb-2">
        <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-audifyx-purple-dark/30">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="login" className="mt-0">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-0">
            <SignupForm defaultAccountType={accountType} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
