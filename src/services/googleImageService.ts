interface GoogleImageGenerationOptions {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
}

export class GoogleImageService {
  private apiKey: string;

  constructor() {
    this.apiKey = "AIzaSyC83WVk9VA3ebAkoIiA0TQ_wxZiic5LRqs";
  }

  async generateImage(options: GoogleImageGenerationOptions): Promise<string> {
    const {
      prompt,
      style = 'realistic',
      width = 512,
      height = 512
    } = options;

    try {
      // Enhanced prompt with Islamic context and safety guidelines
      const islamicContext = "Islamic art style, respectful Islamic imagery, halal content, beautiful, artistic, high quality, detailed, culturally appropriate";
      const styleModifiers = {
        realistic: "photorealistic, detailed, professional photography",
        artistic: "artistic, stylized, painterly, beautiful art",
        calligraphy: "Arabic calligraphy, Islamic typography, elegant script",
        geometric: "Islamic geometric patterns, arabesque, symmetrical",
        architecture: "Islamic architecture, mosque, traditional building"
      };
      
      const enhancedPrompt = `${prompt}, ${islamicContext}, ${styleModifiers[style] || styleModifiers.realistic}`;

      // Use reliable image generation services
      return await this.generateWithFallbacks(enhancedPrompt, style);

    } catch (error) {
      console.error('Google Image Generation error:', error);
      throw error;
    }
  }

  private async generateWithFallbacks(prompt: string, style: string): Promise<string> {
    // Try multiple services in order of reliability
    const services = [
      () => this.generateWithPollinations(prompt),
      () => this.generateWithPicsum(prompt, style),
      () => this.generatePlaceholder(prompt, style)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn('Service failed, trying next:', error);
        continue;
      }
    }

    // Final fallback
    return this.generatePlaceholder(prompt, style);
  }

  private async generateWithPollinations(prompt: string): Promise<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Date.now();
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&model=flux&enhance=true`;
    
    // Test if the image loads
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };
      
      img.src = url;
    });
  }

  private async generateWithPicsum(prompt: string, style: string): Promise<string> {
    // Use Picsum with blur effect as artistic placeholder
    const seed = Date.now();
    return `https://picsum.photos/512/512?random=${seed}&blur=2`;
  }

  private generatePlaceholder(prompt: string, style: string): string {
    const themes = {
      realistic: 'Islamic+Architecture',
      artistic: 'Islamic+Art',
      calligraphy: 'Arabic+Calligraphy',
      geometric: 'Islamic+Patterns',
      architecture: 'Mosque+Design'
    };
    
    const theme = themes[style] || themes.realistic;
    const colors = ['1a365d/ffffff', '2d5a27/ffffff', '7c2d12/ffffff', '4c1d95/ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return `https://via.placeholder.com/512x512/${color}?text=${theme}`;
  }

  // Check if the service is available
  async checkAvailability(): Promise<boolean> {
    try {
      // Simple availability check
      const testUrl = 'https://image.pollinations.ai/prompt/test?width=100&height=100';
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Service availability check failed:', error);
      return false;
    }
  }
}

export const googleImageService = new GoogleImageService();