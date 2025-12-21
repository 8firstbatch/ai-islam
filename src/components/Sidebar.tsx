import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  LogOut,
  Book,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

interface SidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onNewChat: () => void;
  onOpenQuranSearch: () => void;
  onOpenPrayerTimes: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onOpenQuranSearch,
  onOpenPrayerTimes,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadProfile();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setConversations(data || []);
    setLoading(false);
  };

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    setProfile(data);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    
    if (currentConversationId === id) {
      onSelectConversation(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <aside
      className={`h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="font-display text-lg text-sidebar-foreground">Chats</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Actions */}
      <div className={`p-3 space-y-2 ${isCollapsed ? "px-2" : ""}`}>
        <Button
          onClick={onNewChat}
          className={`bg-gradient-emerald hover:opacity-90 ${
            isCollapsed ? "w-10 h-10 p-0" : "w-full"
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </Button>

        <Button
          variant="outline"
          onClick={onOpenQuranSearch}
          className={`${isCollapsed ? "w-10 h-10 p-0" : "w-full"}`}
          title="Quran Search"
        >
          <Book className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Quran Search</span>}
        </Button>

        <Button
          variant="outline"
          onClick={onOpenPrayerTimes}
          className={`${isCollapsed ? "w-10 h-10 p-0" : "w-full"}`}
          title="Prayer Times"
        >
          <Clock className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Prayer Times</span>}
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          !isCollapsed && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          )
        ) : (
          <div className="space-y-1 py-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 rounded-lg transition-colors ${
                  currentConversationId === conv.id
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`flex-1 flex items-center gap-3 p-3 text-left ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                  title={conv.title}
                >
                  <MessageSquare className="w-4 h-4 text-sidebar-foreground shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sidebar-foreground truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(conv.updated_at)}
                      </p>
                    </div>
                  )}
                </button>
                {!isCollapsed && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 mr-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this conversation? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteConversation(conv.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          onClick={() => navigate("/settings")}
          className={`text-sidebar-foreground hover:bg-sidebar-accent ${
            isCollapsed ? "w-10 h-10 p-0" : "w-full justify-start"
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Settings</span>}
        </Button>

        <div
          className={`flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.display_name || user?.email?.split("@")[0]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
