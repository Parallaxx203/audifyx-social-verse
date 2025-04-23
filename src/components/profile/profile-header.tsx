
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
}

export function ProfileHeader({ isOwnProfile = true }: ProfileHeaderProps) {
  const [userData, setUserData] = useState({
    username: "",
    followers: 0,
    following: 0,
    bio: "",
    profileImage: "",
    bannerImage: "",
    accountType: "listener",
  });

  const { username } = useParams();
  
  useEffect(() => {
    // Get user info from local storage
    const userInfo = localStorage.getItem("audifyx-user");
    
    if (userInfo) {
      const { username, accountType } = JSON.parse(userInfo);
      
      // Mock user data
      setUserData({
        username,
        followers: Math.floor(Math.random() * 100),
        following: Math.floor(Math.random() * 50),
        bio: "",
        profileImage: "",
        bannerImage: "",
        accountType,
      });
    }
  }, [username]);

  const getDefaultBanner = () => {
    // Return gradient background if no banner image
    return (
      <div className="w-full h-40 bg-gradient-to-r from-audifyx-purple/80 to-audifyx-blue/80 flex items-center justify-center">
        <div className="text-white/50 text-lg">
          {isOwnProfile ? "Add a banner image" : "No banner added"}
        </div>
      </div>
    );
  };

  const getDefaultAvatar = () => {
    // Return placeholder if no profile image
    return (
      <div className="w-24 h-24 bg-audifyx-purple-dark rounded-full flex items-center justify-center text-3xl text-white border-4 border-audifyx-charcoal">
        {userData.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative">
        {userData.bannerImage ? (
          <img
            src={userData.bannerImage}
            alt="Profile banner"
            className="w-full h-40 object-cover"
          />
        ) : (
          getDefaultBanner()
        )}

        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/30 hover:bg-black/40 text-white"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile picture + info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Profile picture */}
          <div className="relative">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt={userData.username}
                className="w-24 h-24 rounded-full border-4 border-audifyx-charcoal object-cover"
              />
            ) : (
              getDefaultAvatar()
            )}

            {isOwnProfile && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 bg-black/30 hover:bg-black/40 text-white rounded-full h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Profile info */}
          <div className="flex-1 pb-4">
            <div className="flex items-end justify-between w-full">
              <div>
                <h1 className="text-2xl font-bold">{userData.username}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{userData.followers} Followers</span>
                  <span>{userData.following} Following</span>
                  <span className="capitalize">{userData.accountType}</span>
                </div>
              </div>

              {isOwnProfile ? (
                <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                  Edit Profile
                </Button>
              ) : (
                <Button className="bg-audifyx-purple hover:bg-audifyx-purple-vivid">
                  Follow
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 text-gray-300 text-sm">
          {userData.bio ? (
            <p>{userData.bio}</p>
          ) : (
            <p className="text-gray-500 italic">
              {isOwnProfile ? "No bio yet. Edit your profile." : "No bio available."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
