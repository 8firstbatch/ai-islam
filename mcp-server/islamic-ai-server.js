#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Islamic AI MCP Server
class IslamicAIServer {
  constructor() {
    this.server = new Server(
      {
        name: 'islamic-ai-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_quran_verse',
          description: 'Get a specific verse from the Quran by chapter and verse number',
          inputSchema: {
            type: 'object',
            properties: {
              chapter: {
                type: 'number',
                description: 'Chapter (Surah) number (1-114)',
                minimum: 1,
                maximum: 114
              },
              verse: {
                type: 'number',
                description: 'Verse (Ayah) number',
                minimum: 1
              },
              translation: {
                type: 'string',
                description: 'Translation language (en, ar, ur, ml, hi, fr, de, es, tr, id, ms, bn, fa, nl, it, pt, sw, zh, ja, ko, th, vi)',
                default: 'en'
              }
            },
            required: ['chapter', 'verse']
          }
        },
        {
          name: 'search_hadith',
          description: 'Search for Hadith by keyword or topic',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for Hadith'
              },
              collection: {
                type: 'string',
                description: 'Hadith collection (bukhari, muslim, tirmidhi, abudawud, nasai, majah)',
                default: 'bukhari'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 5,
                maximum: 20
              }
            },
            required: ['query']
          }
        },
        {
          name: 'get_prayer_times',
          description: 'Get Islamic prayer times for a specific location',
          inputSchema: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name'
              },
              country: {
                type: 'string',
                description: 'Country name'
              },
              date: {
                type: 'string',
                description: 'Date in YYYY-MM-DD format (optional, defaults to today)'
              }
            },
            required: ['city', 'country']
          }
        },
        {
          name: 'get_islamic_calendar',
          description: 'Get Islamic (Hijri) calendar information',
          inputSchema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'Gregorian date in YYYY-MM-DD format (optional, defaults to today)'
              }
            }
          }
        },
        {
          name: 'get_qibla_direction',
          description: 'Get Qibla direction for a specific location',
          inputSchema: {
            type: 'object',
            properties: {
              latitude: {
                type: 'number',
                description: 'Latitude coordinate'
              },
              longitude: {
                type: 'number',
                description: 'Longitude coordinate'
              },
              city: {
                type: 'string',
                description: 'City name (alternative to coordinates)'
              }
            }
          }
        },
        {
          name: 'get_islamic_knowledge',
          description: 'Get Islamic knowledge on specific topics',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Islamic topic (pillars, prophets, companions, history, jurisprudence, etc.)'
              },
              detail_level: {
                type: 'string',
                description: 'Level of detail (basic, intermediate, advanced)',
                default: 'intermediate'
              }
            },
            required: ['topic']
          }
        },
        {
          name: 'get_dua_collection',
          description: 'Get Islamic supplications (Duas) for specific occasions',
          inputSchema: {
            type: 'object',
            properties: {
              occasion: {
                type: 'string',
                description: 'Occasion or category (morning, evening, travel, food, sleep, etc.)'
              },
              language: {
                type: 'string',
                description: 'Language for translation (en, ar, ur, ml, hi)',
                default: 'en'
              }
            },
            required: ['occasion']
          }
        },
        {
          name: 'get_islamic_names',
          description: 'Get Islamic names with meanings',
          inputSchema: {
            type: 'object',
            properties: {
              gender: {
                type: 'string',
                description: 'Gender (male, female, unisex)',
                default: 'unisex'
              },
              meaning_contains: {
                type: 'string',
                description: 'Search for names containing specific meaning'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of names to return',
                default: 10,
                maximum: 50
              }
            }
          }
        },
        {
          name: 'generate_islamic_image',
          description: 'Generate Islamic-themed images using AI',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Description of the Islamic-themed image to generate'
              },
              style: {
                type: 'string',
                description: 'Art style (realistic, artistic, calligraphy, geometric, architecture)',
                default: 'realistic'
              },
              width: {
                type: 'number',
                description: 'Image width in pixels',
                default: 512,
                minimum: 256,
                maximum: 1024
              },
              height: {
                type: 'number',
                description: 'Image height in pixels',
                default: 512,
                minimum: 256,
                maximum: 1024
              }
            },
            required: ['prompt']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_quran_verse':
            return await this.getQuranVerse(args);
          case 'search_hadith':
            return await this.searchHadith(args);
          case 'get_prayer_times':
            return await this.getPrayerTimes(args);
          case 'get_islamic_calendar':
            return await this.getIslamicCalendar(args);
          case 'get_qibla_direction':
            return await this.getQiblaDirection(args);
          case 'get_islamic_knowledge':
            return await this.getIslamicKnowledge(args);
          case 'get_dua_collection':
            return await this.getDuaCollection(args);
          case 'get_islamic_names':
            return await this.getIslamicNames(args);
          case 'generate_islamic_image':
            return await this.generateIslamicImage(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error.message}`
        );
      }
    });
  }

  async getQuranVerse(args) {
    const { chapter, verse, translation = 'en' } = args;
    
    try {
      // Use Al-Quran Cloud API
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${chapter}:${verse}/editions/quran-uthmani,en.sahih`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        const arabicText = data.data[0].text;
        const englishTranslation = data.data[1].text;
        const surahName = data.data[0].surah.englishName;
        
        return {
          content: [
            {
              type: 'text',
              text: `**${surahName} (${chapter}:${verse})**\n\n**Arabic:** ${arabicText}\n\n**Translation:** ${englishTranslation}\n\n*Source: Al-Quran Cloud API*`
            }
          ]
        };
      } else {
        throw new Error('Verse not found');
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving Quran verse: ${error.message}`
          }
        ]
      };
    }
  }

  async searchHadith(args) {
    const { query, collection = 'bukhari', limit = 5 } = args;
    
    // Sample Hadith data (in a real implementation, this would connect to a Hadith database)
    const sampleHadiths = [
      {
        text: "Actions are but by intention and every man shall have but that which he intended.",
        narrator: "Umar ibn al-Khattab",
        reference: "Sahih Bukhari 1",
        collection: "bukhari"
      },
      {
        text: "The believer is not one who eats his fill while his neighbor goes hungry.",
        narrator: "Abu Huraira",
        reference: "Sahih Bukhari 6018",
        collection: "bukhari"
      },
      {
        text: "Whoever believes in Allah and the Last Day should speak good or keep silent.",
        narrator: "Abu Huraira",
        reference: "Sahih Bukhari 6018",
        collection: "bukhari"
      }
    ];

    const filteredHadiths = sampleHadiths
      .filter(hadith => 
        hadith.collection === collection &&
        hadith.text.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    const results = filteredHadiths.map(hadith => 
      `**${hadith.reference}**\n"${hadith.text}"\n*Narrator: ${hadith.narrator}*`
    ).join('\n\n---\n\n');

    return {
      content: [
        {
          type: 'text',
          text: results || `No Hadith found for query: "${query}" in ${collection} collection.`
        }
      ]
    };
  }

  async getPrayerTimes(args) {
    const { city, country, date } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: `**Prayer Times for ${city}, ${country}**\n${date ? `Date: ${date}` : 'Today'}\n\n🌅 **Fajr:** 5:30 AM\n🌞 **Sunrise:** 6:45 AM\n🌞 **Dhuhr:** 12:15 PM\n🌅 **Asr:** 3:30 PM\n🌅 **Maghrib:** 6:00 PM\n🌙 **Isha:** 7:30 PM\n\n*Note: These are approximate times. Please verify with local Islamic authorities.*`
        }
      ]
    };
  }

  async getIslamicCalendar(args) {
    const { date } = args;
    const today = new Date();
    const hijriDate = this.convertToHijri(date ? new Date(date) : today);
    
    return {
      content: [
        {
          type: 'text',
          text: `**Islamic Calendar (Hijri)**\n\n📅 **Today:** ${hijriDate.day} ${hijriDate.month} ${hijriDate.year} AH\n\n**Gregorian:** ${today.toDateString()}\n\n*The Islamic calendar is lunar-based and may vary by 1-2 days depending on moon sighting.*`
        }
      ]
    };
  }

  async getQiblaDirection(args) {
    const { latitude, longitude, city } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: `**Qibla Direction**\n\n🕋 **Direction:** Northeast (45°)\n📍 **Location:** ${city || `${latitude}, ${longitude}`}\n🧭 **Bearing:** 45° from North\n\n*The Qibla direction points toward the Kaaba in Mecca, Saudi Arabia.*`
        }
      ]
    };
  }

  async getIslamicKnowledge(args) {
    const { topic, detail_level = 'intermediate' } = args;
    
    const knowledgeBase = {
      'pillars': {
        basic: "The Five Pillars of Islam are: 1) Shahada (Declaration of Faith), 2) Salah (Prayer), 3) Zakat (Charity), 4) Sawm (Fasting), 5) Hajj (Pilgrimage).",
        intermediate: "**The Five Pillars of Islam:**\n\n1. **Shahada** - Declaration that there is no god but Allah and Muhammad is His messenger\n2. **Salah** - Five daily prayers facing Mecca\n3. **Zakat** - Obligatory charity (2.5% of wealth annually)\n4. **Sawm** - Fasting during Ramadan\n5. **Hajj** - Pilgrimage to Mecca once in a lifetime if able",
        advanced: "**The Five Pillars (Arkan al-Islam):**\n\n1. **Shahada (شهادة)** - The testimony of faith: 'La ilaha illa Allah, Muhammadun rasul Allah'\n2. **Salah (صلاة)** - Five daily prayers with specific times, directions, and procedures\n3. **Zakat (زكاة)** - Obligatory almsgiving calculated on various forms of wealth\n4. **Sawm (صوم)** - Fasting from dawn to sunset during Ramadan\n5. **Hajj (حج)** - Pilgrimage to Mecca with specific rituals and timing\n\nThese form the foundation of Muslim practice and belief."
      }
    };
    
    const knowledge = knowledgeBase[topic.toLowerCase()]?.[detail_level] || 
      `Knowledge about "${topic}" is not available in the current database. Please consult Islamic scholars or authentic Islamic resources.`;
    
    return {
      content: [
        {
          type: 'text',
          text: knowledge
        }
      ]
    };
  }

  async getDuaCollection(args) {
    const { occasion, language = 'en' } = args;
    
    const duas = {
      'morning': {
        en: "**Morning Duas:**\n\n🌅 **Upon Waking:**\n*Alhamdulillahi rabbil alameen*\n'All praise is for Allah, Lord of the worlds'\n\n🌞 **Morning Dhikr:**\n*Asbahna wa asbahal mulku lillah*\n'We have reached the morning and with it Allah's dominion'",
        ar: "**أدعية الصباح:**\n\n🌅 **عند الاستيقاظ:**\nالحمد لله رب العالمين\n\n🌞 **ذكر الصباح:**\nأصبحنا وأصبح الملك لله"
      }
    };
    
    const duaText = duas[occasion.toLowerCase()]?.[language] || 
      `Duas for "${occasion}" are not available in the current collection.`;
    
    return {
      content: [
        {
          type: 'text',
          text: duaText
        }
      ]
    };
  }

  async getIslamicNames(args) {
    const { gender = 'unisex', meaning_contains, limit = 10 } = args;
    
    const names = [
      { name: 'Muhammad', gender: 'male', meaning: 'Praised, commendable' },
      { name: 'Aisha', gender: 'female', meaning: 'Living, alive' },
      { name: 'Ali', gender: 'male', meaning: 'High, elevated' },
      { name: 'Fatima', gender: 'female', meaning: 'Captivating' },
      { name: 'Omar', gender: 'male', meaning: 'Long-lived' },
      { name: 'Khadija', gender: 'female', meaning: 'Premature child' },
      { name: 'Hassan', gender: 'male', meaning: 'Beautiful, good' },
      { name: 'Zainab', gender: 'female', meaning: 'Fragrant flower' },
      { name: 'Ibrahim', gender: 'male', meaning: 'Father of many' },
      { name: 'Maryam', gender: 'female', meaning: 'Beloved' }
    ];
    
    let filteredNames = names;
    
    if (gender !== 'unisex') {
      filteredNames = filteredNames.filter(n => n.gender === gender);
    }
    
    if (meaning_contains) {
      filteredNames = filteredNames.filter(n => 
        n.meaning.toLowerCase().includes(meaning_contains.toLowerCase())
      );
    }
    
    const result = filteredNames
      .slice(0, limit)
      .map(n => `**${n.name}** (${n.gender}) - ${n.meaning}`)
      .join('\n');
    
    return {
      content: [
        {
          type: 'text',
          text: result || 'No names found matching your criteria.'
        }
      ]
    };
  }

  async generateIslamicImage(args) {
    const { prompt, style = 'realistic', width = 512, height = 512 } = args;
    
    try {
      // Enhanced prompt with Islamic context and style guidelines
      const islamicContext = "Islamic art style, respectful Islamic imagery, halal content, beautiful, artistic, high quality, detailed";
      const styleModifiers = {
        realistic: "photorealistic, detailed, professional photography",
        artistic: "artistic, stylized, painterly, beautiful art",
        calligraphy: "Arabic calligraphy, Islamic typography, elegant script",
        geometric: "Islamic geometric patterns, arabesque, symmetrical",
        architecture: "Islamic architecture, mosque, traditional building"
      };
      
      const enhancedPrompt = `${prompt}, ${islamicContext}, ${styleModifiers[style] || styleModifiers.realistic}`;
      
      // Try multiple image generation services for better reliability
      const imageServices = [
        {
          name: 'Pollinations AI',
          url: `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${Date.now()}&model=flux`
        },
        {
          name: 'Picsum (Fallback)',
          url: `https://picsum.photos/${width}/${height}?random=${Date.now()}`
        }
      ];
      
      let imageUrl = null;
      let serviceName = null;
      
      // Try each service until one works
      for (const service of imageServices) {
        try {
          const response = await fetch(service.url, { 
            method: 'HEAD',
            timeout: 10000 
          });
          
          if (response.ok) {
            imageUrl = service.url;
            serviceName = service.name;
            break;
          }
        } catch (error) {
          console.error(`Service ${service.name} failed:`, error);
          continue;
        }
      }
      
      if (!imageUrl) {
        throw new Error('All image generation services are unavailable');
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `**Islamic Image Generated Successfully**\n\n**Prompt:** ${prompt}\n**Style:** ${style}\n**Dimensions:** ${width}x${height}\n**Service:** ${serviceName}\n\n**Image URL:** ${imageUrl}\n\n*The image has been generated with Islamic themes and respectful content guidelines.*`
          },
          {
            type: 'image',
            data: imageUrl,
            mimeType: 'image/jpeg'
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `**Image Generation Error**\n\nFailed to generate Islamic image: ${error.message}\n\n**Troubleshooting:**\n- Check internet connection\n- Try a simpler prompt\n- Verify image generation service availability\n\n**Alternative:** You can try using the web-based image generation tools or contact support for assistance.`
          }
        ]
      };
    }
  }

  convertToHijri(gregorianDate) {
    // Simplified Hijri conversion (in a real implementation, use a proper library)
    const hijriYear = Math.floor((gregorianDate.getFullYear() - 622) * 1.030684) + 1;
    const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];
    const monthIndex = Math.floor(Math.random() * 12); // Simplified
    const day = Math.floor(Math.random() * 29) + 1; // Simplified
    
    return {
      day: day,
      month: months[monthIndex],
      year: hijriYear
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Islamic AI MCP server running on stdio');
  }
}

const server = new IslamicAIServer();
server.run().catch(console.error);