import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, getEffectiveProfileImage, getEffectiveDisplayName } from "@/utils/profileUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash,
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

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
    
    const profileData = await getUserProfile(user.id);
    setProfile(profileData);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    
    if (currentConversationId === id) {
      onSelectConversation(null);
    }
  };

  const deleteAllConversations = async () => {
    if (!user) return;
    await supabase.from("conversations").delete().eq("user_id", user.id);
    setConversations([]);
    onSelectConversation(null);
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    await supabase
      .from("conversations")
      .update({ title: newTitle.trim() })
      .eq("id", id);
    
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle.trim() } : conv
      )
    );
    
    setEditingConversationId(null);
    setEditingTitle("");
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingConversationId(id);
    setEditingTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingConversationId(null);
    setEditingTitle("");
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

  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    
    // Try to truncate at word boundary
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.6) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  };

  if (!user) return null;

  return (
    <aside
      className={`h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border animate-slide-in-left">
        <div className="flex items-center justify-between mb-2">
          {!isCollapsed && (
            <h2 className="font-display text-lg text-sidebar-foreground animate-fade-in">Chats</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300 hover:scale-110"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Delete All Conversations Button */}
        {!isCollapsed && conversations.length > 0 && (
          <div className="animate-scale-in">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-destructive transition-all duration-300 hover:scale-105"
                >
                  <Trash className="w-3 h-3 mr-2" />
                  Clear All Chats
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="animate-scale-in">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Conversations</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all conversations? This action cannot be undone and will permanently remove all your chat history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAllConversations}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-300"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`p-3 space-y-2 ${isCollapsed ? "px-2" : ""}`}>
        <Button
          onClick={onNewChat}
          className={`bg-gradient-emerald hover:opacity-90 transition-all duration-300 hover:scale-105 animate-glow-pulse ${
            isCollapsed ? "w-10 h-10 p-0" : "w-full"
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
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
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 rounded-lg border transition-all duration-300 hover:scale-[1.02] animate-slide-in-left min-w-0 ${
                  currentConversationId === conv.id
                    ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 shadow-md"
                    : "border-transparent hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/20"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {editingConversationId === conv.id ? (
                  // Editing mode
                  <div className="flex-1 flex items-center gap-2 p-2">
                    <MessageSquare className="w-4 h-4 text-sidebar-foreground shrink-0" />
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          renameConversation(conv.id, editingTitle);
                        } else if (e.key === 'Escape') {
                          cancelEditing();
                        }
                      }}
                      onBlur={() => renameConversation(conv.id, editingTitle)}
                      className="flex-1 h-7 text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  // Normal mode
                  <div className="flex items-center w-full min-w-0">
                    <button
                      onClick={() => onSelectConversation(conv.id)}
                      className={`flex-1 flex items-center gap-2 p-2 text-left min-w-0 ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                      title={conv.title}
                    >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${
                        currentConversationId === conv.id 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : "text-sidebar-foreground"
                      }`} />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate font-medium ${
                            currentConversationId === conv.id 
                              ? "text-emerald-700 dark:text-emerald-300" 
                              : "text-sidebar-foreground"
                          }`}>
                            {truncateTitle(conv.title)}
                          </p>
                          <p className={`text-xs ${
                            currentConversationId === conv.id 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : "text-muted-foreground"
                          }`}>
                            {formatDate(conv.updated_at)}
                          </p>
                        </div>
                      )}
                    </button>
                    
                    {/* Action Buttons - Show on Hover */}
                    {!isCollapsed && (
                      <div className="flex items-center gap-1 pr-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Rename Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(conv.id, conv.title);
                          }}
                          className="h-6 w-6 text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors duration-200 flex-shrink-0"
                          title="Rename conversation"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        
                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 text-slate-500 hover:text-red-600 hover:bg-red-500/10 transition-colors duration-200 flex-shrink-0"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{conv.title}"? This action cannot be undone.
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
                    </div>
                    )}
                  </div>
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
            <AvatarImage 
              src={getEffectiveProfileImage(user, profile) || ""} 
              alt={getEffectiveDisplayName(user, profile)}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getEffectiveDisplayName(user, profile)[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {getEffectiveDisplayName(user, profile)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
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
