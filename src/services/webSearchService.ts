interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilySearchResponse {
  query: string;
  follow_up_questions: string[];
  answer: string;
  images: string[];
  results: SearchResult[];
  response_time: number;
}

export class WebSearchService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';

  constructor() {
    // For frontend access, we need to add VITE_ prefix to the env var
    this.apiKey = import.meta.env.VITE_TAVILY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Tavily API key not found. Web search functionality will be limited.');
    }
  }

  async search(query: string, options: {
    searchDepth?: 'basic' | 'advanced';
    includeImages?: boolean;
    includeAnswer?: boolean;
    maxResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
  } = {}): Promise<TavilySearchResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key is not configured');
    }

    const {
      searchDepth = 'basic',
      includeImages = false,
      includeAnswer = true,
      maxResults = 5,
      includeDomains = [],
      excludeDomains = []
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          search_depth: searchDepth,
          include_images: includeImages,
          include_answer: includeAnswer,
          max_results: maxResults,
          include_domains: includeDomains,
          exclude_domains: excludeDomains,
          include_raw_content: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const data: TavilySearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Web search error:', error);
      throw error instanceof Error ? error : new Error('Failed to perform web search');
    }
  }

  async searchForIslamic(query: string): Promise<TavilySearchResponse> {
    // Add Islamic-specific domains for better results
    const islamicDomains = [
      'islamqa.info',
      'islamweb.net',
      'islamhouse.com',
      'quran.com',
      'sunnah.com',
      'islamicfinder.org',
      'aboutislam.net',
      'islamreligion.com'
    ];

    return this.search(query, {
      searchDepth: 'advanced',
      includeAnswer: true,
      maxResults: 8,
      includeDomains: islamicDomains
    });
  }

  formatSearchResults(searchResponse: TavilySearchResponse): string {
    let formattedResult = '';

    // Add the AI-generated answer if available
    if (searchResponse.answer) {
      formattedResult += `**Answer:**\n${searchResponse.answer}\n\n`;
    }

    // Add search results
    if (searchResponse.results && searchResponse.results.length > 0) {
      formattedResult += `**Sources:**\n`;
      searchResponse.results.forEach((result, index) => {
        formattedResult += `${index + 1}. **[${result.title}](${result.url})**\n`;
        formattedResult += `   ${result.content.substring(0, 200)}...\n\n`;
      });
    }

    // Add follow-up questions if available
    if (searchResponse.follow_up_questions && searchResponse.follow_up_questions.length > 0) {
      formattedResult += `**Related Questions:**\n`;
      searchResponse.follow_up_questions.forEach((question, index) => {
        formattedResult += `${index + 1}. ${question}\n`;
      });
    }

    return formattedResult;
  }
}

// Export a singleton instance
export const webSearchService = new WebSearchService();

// Export a simple webSearch function for easy use
export async function webSearch(query: string): Promise<string> {
  try {
    const searchResponse = await webSearchService.searchForIslamic(query);
    return webSearchService.formatSearchResults(searchResponse);
  } catch (error) {
    console.error('Web search failed:', error);
    return `I apologize, but I couldn't perform a web search at the moment. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}