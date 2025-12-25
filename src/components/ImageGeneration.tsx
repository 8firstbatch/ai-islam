import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Copy, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

interface ImageGenerationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageGeneration = ({ isOpen, onClose }: ImageGenerationProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const { toast } = useToast();
  const { user } = useAuth();

  // Islamic-themed prompt suggestions
  const promptSuggestions = [
    "Beautiful Islamic calligraphy with golden text on dark background",
    "Peaceful mosque at sunset with minarets and dome",
    "Islamic geometric patterns in blue and gold colors",
    "Crescent moon and stars in peaceful night sky",
    "Traditional Islamic architecture with ornate arches",
    "Elegant Arabic calligraphy of Bismillah",
    "Islamic garden with fountains and geometric design",
    "Dome of a mosque with intricate tile patterns",
    "Islamic art with arabesque floral patterns",
    "Masjid al-Haram with pilgrims during Hajj",
    "Islamic lanterns for Ramadan celebration",
    "Beautiful Quran with ornate cover design"
  ];

  const styleOptions = [
    { id: "realistic", name: "Realistic", description: "Photorealistic images" },
    { id: "artistic", name: "Artistic", description: "Artistic and stylized" },
    { id: "calligraphy", name: "Calligraphy", description: "Focus on Arabic text" },
    { id: "geometric", name: "Geometric", description: "Islamic patterns" },
    { id: "architecture", name: "Architecture", description: "Mosques and buildings" }
  ];

  // Simulate image generation (replace with actual API call)
  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for the image",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate images",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Enhanced prompt with Islamic context and style
      const enhancedPrompt = `${prompt}, Islamic art style, ${selectedStyle} style, high quality, detailed, respectful Islamic imagery, halal content, beautiful, artistic`;

      // Using Pollinations AI (free image generation service)
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${Date.now()}&model=flux`;

      // Test if the image loads successfully
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt("");

      toast({
        title: "Image generated successfully",
        description: "Your Islamic-themed image has been created",
      });

    } catch (error) {
      console.error('Image generation error:', error);
      
      // Fallback to placeholder if API fails
      const fallbackUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: fallbackUrl,
        prompt: prompt,
        timestamp: new Date()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt("");

      toast({
        title: "Image generated (demo mode)",
        description: "Using placeholder image - integrate with AI service for real generation",
        variant: "default",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `islamic-ai-${Date.now()}.jpg`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // For cross-origin images, we need to fetch and create blob
      try {
        const response = await fetch(imageUrl, { mode: 'cors' });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (corsError) {
        // Fallback: open in new tab if CORS fails
        window.open(imageUrl, '_blank');
      }

      toast({
        title: "Image downloaded",
        description: "Image saved to your downloads folder",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Right-click the image and select 'Save image as...'",
        variant: "destructive",
      });
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied",
      description: "Prompt copied to clipboard",
    });
  };

  const insertSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            Islamic Image Generation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Style Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Art Style</label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(style.id)}
                  className="text-xs"
                >
                  {style.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image Description</label>
            <Textarea
              placeholder="Describe the Islamic-themed image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {prompt.length}/500 characters
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Islamic Image
              </>
            )}
          </Button>

          {/* Prompt Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Suggestions</label>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs py-1"
                  onClick={() => insertSuggestion(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Images</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {generatedImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium truncate">
                        {image.prompt}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {image.timestamp.toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(image.url, image.prompt)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => copyPrompt(image.prompt)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-2">Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Images are generated with Islamic themes and respectful content</li>
                <li>• Avoid requesting inappropriate or offensive imagery</li>
                <li>• Generated images are for personal and educational use</li>
                <li>• Be specific in your descriptions for better results</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};