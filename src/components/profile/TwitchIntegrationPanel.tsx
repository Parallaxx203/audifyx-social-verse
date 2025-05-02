
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTwitchConnection, useTwitchStatus } from "@/hooks/useTwitchConnection";
import { useAuth } from "@/contexts/AuthContext";
import { TwitchEmbed } from "@/components/twitch/TwitchEmbed";

export function TwitchIntegrationPanel() {
  const [twitchUsername, setTwitchUsername] = useState("");
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const { connectTwitch, disconnectTwitch, isConnecting } = useTwitchConnection(userId);
  const { twitchConnection, isLoading, fetchTwitchConnection } = useTwitchStatus(userId);
  
  useEffect(() => {
    if (userId) {
      fetchTwitchConnection();
    }
  }, [userId]);
  
  const handleConnect = async () => {
    const result = await connectTwitch(twitchUsername);
    if (result) {
      fetchTwitchConnection();
    }
  };
  
  const handleDisconnect = async () => {
    const success = await disconnectTwitch();
    if (success) {
      fetchTwitchConnection();
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
        <CardHeader>
          <CardTitle>Twitch Integration</CardTitle>
          <CardDescription>Connect your Twitch account to stream directly to your profile</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
      <CardHeader>
        <CardTitle>Twitch Integration</CardTitle>
        <CardDescription>Connect your Twitch account to stream directly to your profile</CardDescription>
      </CardHeader>
      <CardContent>
        {twitchConnection ? (
          <div className="space-y-6">
            <div className="p-4 bg-audifyx-purple/20 rounded-md">
              <p className="text-sm text-gray-300 mb-1">Connected Twitch Account</p>
              <p className="font-bold text-lg">{twitchConnection.twitch_username}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Your Stream Preview</h3>
              <TwitchEmbed 
                channel={twitchConnection.twitch_username} 
                height="300px" 
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleDisconnect}
              >
                Disconnect Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-300">
              Connect your Twitch account to stream directly to your Audifyx profile. 
              Your followers will be notified when you go live!
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="twitch-username">Twitch Username</Label>
              <Input
                id="twitch-username"
                placeholder="Enter your Twitch username"
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
              />
            </div>
            
            <Button
              className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
              onClick={handleConnect}
              disabled={!twitchUsername || isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Twitch Account"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
