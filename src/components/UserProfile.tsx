import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, getUserProfileImage, getUserDisplayName } from "@/utils/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  showDropdown?: boolean;
  size?: "sm" | "md" | "lg";
}

const UserProfile = ({ showDropdown = true, size = "md" }: UserProfileProps) => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const profileImage = getUserProfileImage(user);
  const displayName = getUserDisplayName(user);
  const userProfile = getUserProfile(user);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!showDropdown) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={profileImage || undefined} 
            alt={displayName}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {size !== "sm" && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto p-2 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Avatar className={sizeClasses[size]}>
              <AvatarImage 
                src={profileImage || undefined} 
                alt={displayName}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {size !== "sm" && (
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {userProfile?.provider && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                via {userProfile.provider}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;