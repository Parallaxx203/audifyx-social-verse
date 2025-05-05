
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Calendar, Settings, Edit, User, Play, Pause, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { useFollowUser } from '@/hooks/useFollowUser';

interface ProfileHeaderProps {
  userId: string;
  username: string;
  avatarUrl?: string;
  isOwnProfile: boolean;
  followers: number;
  following: number;
  joinedDate?: string;
  role?: string;
  bio?: string;
}

export function ProfileHeader({
  userId,
  username,
  avatarUrl,
  isOwnProfile,
  followers,
  following,
  joinedDate,
  role = "listener",
  bio
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [mostPlayedTrack, setMostPlayedTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const { 
    isFollowing, 
    followUser, 
    unfollowUser, 
    isLoading: followLoading 
  } = useFollowUser(userId);

  useEffect(() => {
    if (userId) {
      fetchMostPlayedTrack();
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [userId]);

  const fetchMostPlayedTrack = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', userId)
        .order('play_count', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Just means they don't have any tracks, not a real error
        console.log('User has no tracks');
        return;
      }
      
      setMostPlayedTrack(data);
    } catch (error) {
      console.error('Error fetching most played track:', error);
    }
  };

  const togglePlayTrack = () => {
    if (!mostPlayedTrack?.track_url) return;
    
    if (!audio) {
      const newAudio = new Audio(mostPlayedTrack.track_url);
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      newAudio.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Error playing audio:', err);
          toast({
            title: 'Playback Error',
            description: 'Unable to play the track.',
            variant: 'destructive',
          });
        });
      setAudio(newAudio);
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play()
          .catch(err => console.error('Error playing audio:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFollow = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to log in to follow users",
          variant: "destructive",
        });
        return;
      }
      
      if (isFollowing) {
        await unfollowUser();
        toast({
          description: `You unfollowed ${username}`,
        });
      } else {
        await followUser();
        toast({
          description: `You are now following ${username}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${username}`);
  };

  const getRoleBadgeColor = () => {
    switch(role?.toLowerCase()) {
      case 'creator': return 'bg-gradient-to-r from-purple-600 to-blue-500 border-none';
      case 'brand': return 'bg-gradient-to-r from-amber-500 to-orange-600 border-none';
      default: return 'bg-audifyx-purple/20 border-audifyx-purple/30';
    }
  };

  return (
    <div className="relative w-full">
      {/* Gradient Cover Photo */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-audifyx-purple-dark via-audifyx-purple to-black rounded-b-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-20 md:-mt-24 relative z-10 mb-6">
          {/* Avatar */}
          <Avatar className="w-28 h-28 md:w-40 md:h-40 border-4 border-background shadow-xl">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-3xl md:text-5xl">
              {username ? username[0]?.toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          
          {/* User Info */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-end justify-between w-full">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{username}</h1>
                <Badge variant="outline" className={`${getRoleBadgeColor()} capitalize`}>
                  {role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{followers}</span>
                  <span className="text-gray-400">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{following}</span>
                  <span className="text-gray-400">Following</span>
                </div>
                {joinedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Joined {new Date(joinedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {bio && <p className="mt-4 text-gray-300 max-w-xl">{bio}</p>}
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              {isOwnProfile ? (
                <>
                  <Button 
                    onClick={() => setShowEditModal(true)} 
                    className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={!isFollowing ? "bg-audifyx-purple hover:bg-audifyx-purple-vivid" : ""}
                    disabled={followLoading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button onClick={handleMessage} variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Most Played Track */}
        {mostPlayedTrack && (
          <div className="mb-6 p-4 bg-audifyx-purple/10 rounded-lg border border-audifyx-purple/20">
            <div className="flex items-center gap-3">
              <Button 
                size="icon"
                onClick={togglePlayTrack}
                variant="ghost"
                className={`rounded-full bg-audifyx-purple hover:bg-audifyx-purple-vivid h-10 w-10 ${isPlaying ? 'animate-pulse' : ''}`}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <div>
                <div className="text-sm text-gray-400">Most Played Track</div>
                <div className="font-medium">{mostPlayedTrack.title}</div>
              </div>
              <Music className="h-5 w-5 text-audifyx-purple ml-auto" />
            </div>
          </div>
        )}
      </div>
      
      <EditProfileModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal} 
      />
    </div>
  );
}
