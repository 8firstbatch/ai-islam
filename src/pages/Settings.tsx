import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserProfile, updateUserProfile, uploadProfileImage, getEffectiveProfileImage, getEffectiveDisplayName } from "@/utils/profileUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  User,
  Palette,
  Bot,
  Sun,
  Moon,
  Monitor,
  Camera,
  Save,
  Image,
  Compass,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageGeneration } from "@/components/ImageGeneration";
import { QiblaCompass } from "@/components/QiblaCompass";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingsTab = "profile" | "appearance" | "ai" | "tools";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [aiModel, setAiModel] = useState("google/gemini-2.5-flash");
  const [responseStyle, setResponseStyle] = useState("balanced");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImageGeneration, setShowImageGeneration] = useState(false);
  const [showQiblaCompass, setShowQiblaCompass] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSettings();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const profileData = await getUserProfile(user.id);
    setProfile(profileData);
    
    if (profileData) {
      setDisplayName(profileData.display_name || "");
      setAvatarUrl(profileData.avatar_url || "");
    } else {
      // Use Google OAuth data as fallback
      setDisplayName(getEffectiveDisplayName(user, null));
      setAvatarUrl(getEffectiveProfileImage(user, null) || "");
    }
  };

  const loadSettings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_settings")
      .select("ai_model, ai_response_style")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setAiModel(data.ai_model || "google/gemini-2.5-flash");
      setResponseStyle(data.ai_response_style || "balanced");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const base64Image = await uploadProfileImage(user.id, file);
      setAvatarUrl(base64Image);
      
      await updateUserProfile(user.id, {
        avatar_url: base64Image,
        display_name: displayName
      });

      toast({ title: "Profile image updated successfully!" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const syncGoogleImage = async () => {
    if (!user) return;
    
    setUploading(true);
    try {
      const googleImage = getEffectiveProfileImage(user, null);
      if (googleImage) {
        setAvatarUrl(googleImage);
        await updateUserProfile(user.id, {
          avatar_url: googleImage,
          display_name: displayName
        });
        toast({ title: "Google profile image synced!" });
      } else {
        toast({
          title: "No Google image found",
          description: "Your Google account doesn't have a profile image",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateUserProfile(user.id, {
        display_name: displayName,
        avatar_url: avatarUrl
      });

      toast({ title: "Profile saved successfully!" });
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAiSettings = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Use upsert to create settings if they don't exist
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          ai_model: aiModel,
          ai_response_style: responseStyle,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({ title: "AI settings saved" });
    } catch (error) {
      console.error('AI settings save error:', error);
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "ai" as const, label: "AI Settings", icon: Bot },
    { id: "tools" as const, label: "Tools", icon: Image },
  ];

  return (
    <>
      <Helmet>
        <title>Settings - Islamic AI</title>
        <meta name="description" content="Customize your Islamic AI experience with profile, appearance, and AI settings." />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-xl text-foreground">Settings</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <nav className="md:w-48 flex md:flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-card border border-border rounded-2xl p-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl text-foreground mb-1">Profile</h2>
                      <p className="text-sm text-muted-foreground">
                        Manage your profile information
                      </p>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={avatarUrl} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          {uploading ? (
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Profile Photo</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Click the camera icon to upload a new photo
                        </p>
                        <Button
                          onClick={syncGoogleImage}
                          disabled={uploading}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {uploading ? (
                            <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Sync Google Image
                        </Button>
                      </div>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="rounded-2xl"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled className="rounded-2xl" />
                    </div>

                    <Button
                      onClick={saveProfile}
                      disabled={saving}
                      className="bg-gradient-emerald hover:opacity-90"
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Profile
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl text-foreground mb-1">Appearance</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize the look and feel
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "light" as const, label: "Light", icon: Sun },
                          { value: "dark" as const, label: "Dark", icon: Moon },
                          { value: "system" as const, label: "System", icon: Monitor },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                              theme === option.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <option.icon className={`w-6 h-6 ${
                              theme === option.value ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <span className={`text-sm font-medium ${
                              theme === option.value ? "text-primary" : "text-foreground"
                            }`}>
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Settings Tab */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl text-foreground mb-1">AI Settings</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize your AI assistant
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>AI Model</Label>
                        <Select value={aiModel} onValueChange={setAiModel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google/gemini-2.5-flash">Smart</SelectItem>
                            <SelectItem value="google/gemini-2.5-pro">Thinking</SelectItem>
                            <SelectItem value="openai/gpt-5-mini">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose the AI model for your conversations
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Response Style</Label>
                        <Select value={responseStyle} onValueChange={setResponseStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          How detailed should the AI responses be
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={saveAiSettings}
                      disabled={saving}
                      className="bg-gradient-emerald hover:opacity-90"
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Settings
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {/* Tools Tab */}
                {activeTab === "tools" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl text-foreground mb-1">Islamic Tools</h2>
                      <p className="text-sm text-muted-foreground">
                        Access Islamic tools and features
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {/* Image Generation Tool */}
                      <div className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <Image className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">Islamic Image Generation</h3>
                              <p className="text-sm text-muted-foreground">
                                Generate beautiful Islamic-themed images with AI
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setShowImageGeneration(true)}
                            variant="outline"
                            size="sm"
                          >
                            Open Tool
                          </Button>
                        </div>
                      </div>

                      {/* Qibla Compass Tool */}
                      <div className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Compass className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">Qibla Compass</h3>
                              <p className="text-sm text-muted-foreground">
                                Find the direction to Mecca for prayer
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setShowQiblaCompass(true)}
                            variant="outline"
                            size="sm"
                          >
                            Open Tool
                          </Button>
                        </div>
                      </div>

                      {/* Future tools can be added here */}
                      <div className="p-4 border border-dashed border-border rounded-xl opacity-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Bot className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-medium text-muted-foreground">More Tools Coming Soon</h3>
                              <p className="text-sm text-muted-foreground">
                                Additional Islamic tools will be added in future updates
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Image Generation Modal */}
        <ImageGeneration 
          isOpen={showImageGeneration} 
          onClose={() => setShowImageGeneration(false)} 
        />
        
        {/* Qibla Compass Modal */}
        <QiblaCompass 
          isOpen={showQiblaCompass} 
          onClose={() => setShowQiblaCompass(false)} 
        />
      </div>
    </>
  );
};

export default Settings;
