
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function TestDB() {
  const [userId, setUserId] = useState<string | null>(null);
  const { data: profile, isLoading, error } = useProfile(userId);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const testCreateProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: 'testuser',
            account_type: 'listener',
            full_name: 'Test User'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile created successfully"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Database Test</h1>
      <Button onClick={testCreateProfile}>Create Test Profile</Button>
      
      <div className="mt-4">
        <h2 className="text-xl mb-2">Current Profile:</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {profile && (
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(profile, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
