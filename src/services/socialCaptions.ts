// Social Caption Generator Service
interface ShowData {
  title: string;
  date: string;
  time?: string;
  venue?: {
    name: string;
    city: string;
  };
  setlist?: string[];
}

interface CaptionOptions {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  tone: 'casual' | 'professional' | 'energetic' | 'elegant';
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeSetlist: boolean;
}

class SocialCaptionService {
  private useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Generate caption for a show
  async generateCaption(showData: ShowData, options: CaptionOptions): Promise<string> {
    try {
      if (this.useMockData || !import.meta.env.VITE_OPENROUTER_API_KEY) {
        return this.generateMockCaption(showData, options);
      }

      // Use OpenRouter API for AI-generated captions
      return await this.generateAICaption(showData, options);
    } catch (error) {
      console.error('Error generating caption:', error);
      return this.generateMockCaption(showData, options);
    }
  }

  // Generate multiple caption variations
  async generateCaptionVariations(showData: ShowData, options: CaptionOptions): Promise<string[]> {
    const captions = [];
    
    // Generate 3 variations with different tones
    const tones: CaptionOptions['tone'][] = ['casual', 'energetic', 'professional'];
    
    for (const tone of tones) {
      const caption = await this.generateCaption(showData, { ...options, tone });
      captions.push(caption);
    }
    
    return captions;
  }

  // Generate AI caption using OpenRouter
  private async generateAICaption(showData: ShowData, options: CaptionOptions): Promise<string> {
    const prompt = this.buildPrompt(showData, options);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'ChordLine Social Caption Generator'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || this.generateMockCaption(showData, options);
  }

  // Build prompt for AI caption generation
  private buildPrompt(showData: ShowData, options: CaptionOptions): string {
    const { platform, tone, includeHashtags, includeEmojis, includeSetlist } = options;
    
    let prompt = `Generate a ${tone} social media caption for ${platform} about an upcoming music show with these details:
    
Show: ${showData.title}
Date: ${new Date(showData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${showData.time || 'TBD'}
Venue: ${showData.venue?.name || 'TBD'}
Location: ${showData.venue?.city || 'TBD'}`;

    if (includeSetlist && showData.setlist?.length) {
      prompt += `\nSetlist highlights: ${showData.setlist.slice(0, 3).join(', ')}`;
    }

    prompt += `\n\nRequirements:
- ${tone} tone
- ${includeEmojis ? 'Include relevant emojis' : 'No emojis'}
- ${includeHashtags ? 'Include relevant hashtags at the end' : 'No hashtags'}
- Keep it engaging and encourage attendance
- ${platform === 'twitter' ? 'Keep under 280 characters' : platform === 'instagram' ? 'Optimize for Instagram (can be longer)' : 'Appropriate length for the platform'}

Generate only the caption text, no additional commentary.`;

    return prompt;
  }

  // Generate mock caption with templates
  private generateMockCaption(showData: ShowData, options: CaptionOptions): string {
    const templates = this.getTemplates(options.platform, options.tone);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let caption = template
      .replace('{show}', showData.title)
      .replace('{venue}', showData.venue?.name || 'an amazing venue')
      .replace('{city}', showData.venue?.city || 'the city')
      .replace('{date}', new Date(showData.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }))
      .replace('{time}', showData.time || '8:00 PM');

    // Add emojis if requested
    if (options.includeEmojis) {
      caption = this.addEmojis(caption, options.tone);
    }

    // Add setlist if requested and available
    if (options.includeSetlist && showData.setlist?.length) {
      caption += `\n\nSetlist includes: ${showData.setlist.slice(0, 3).join(', ')} and more!`;
    }

    // Add hashtags if requested
    if (options.includeHashtags) {
      caption += '\n\n' + this.generateHashtags(showData, options.platform);
    }

    return caption;
  }

  // Get caption templates based on platform and tone
  private getTemplates(platform: string, tone: CaptionOptions['tone']): string[] {
    const templates = {
      casual: [
        "Hey everyone! We're playing {show} at {venue} in {city} on {date} at {time}! Come hang out with us!",
        "Can't wait to see you all at {show}! We'll be at {venue} on {date} starting at {time}. It's going to be awesome!",
        "Mark your calendars! {show} is happening at {venue} on {date} at {time}. Hope to see you there!"
      ],
      energetic: [
        "GET READY TO ROCK! {show} is coming to {venue} in {city} on {date} at {time}! This is going to be EPIC!",
        "The energy is building! Join us for {show} at {venue} on {date} at {time}. Let's make some noise!",
        "SHOWTIME! We're bringing the heat to {venue} on {date} at {time} for {show}. Don't miss this!"
      ],
      professional: [
        "We're pleased to announce our upcoming performance: {show} at {venue} in {city} on {date} at {time}.",
        "Join us for an evening of music at {venue} on {date} at {time} for {show}. Tickets available now.",
        "We cordially invite you to attend {show} at the prestigious {venue} on {date} beginning at {time}."
      ],
      elegant: [
        "An enchanting evening awaits at {venue} on {date} at {time} for {show}. We look forward to sharing this magical experience with you.",
        "Join us for a sophisticated musical journey at {venue} in {city} on {date} at {time} for {show}.",
        "Experience the artistry of live music at {venue} on {date} at {time}. {show} promises to be an unforgettable evening."
      ]
    };

    return templates[tone] || templates.casual;
  }

  // Add emojis based on tone
  private addEmojis(caption: string, tone: CaptionOptions['tone']): string {
    const emojiSets = {
      casual: ['🎵', '🎸', '🎤', '😊', '🎶', '✨'],
      energetic: ['🔥', '⚡', '🎸', '🤘', '🎵', '💥', '🎤'],
      professional: ['🎵', '🎼', '🎹', '🎻', '🎺'],
      elegant: ['✨', '🎵', '🎼', '🌟', '🎹', '🎻']
    };

    const emojis = emojiSets[tone] || emojiSets.casual;
    const selectedEmojis = emojis.slice(0, 3);
    
    return selectedEmojis.join(' ') + ' ' + caption;
  }

  // Generate hashtags
  private generateHashtags(showData: ShowData, platform: string): string {
    const baseHashtags = [
      '#livemusic',
      '#concert',
      '#music',
      '#band',
      '#show'
    ];

    // Add venue-specific hashtags
    if (showData.venue?.city) {
      baseHashtags.push(`#${showData.venue.city.toLowerCase().replace(/\s+/g, '')}`);
    }

    // Add date-based hashtags
    const date = new Date(showData.date);
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    baseHashtags.push(`#${month}shows`);

    // Platform-specific hashtag limits
    const maxHashtags = platform === 'twitter' ? 5 : platform === 'instagram' ? 10 : 7;
    
    return baseHashtags
      .slice(0, maxHashtags)
      .join(' ');
  }

  // Copy caption to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        textArea.remove();
        return success;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Get platform-specific character limits
  getCharacterLimit(platform: CaptionOptions['platform']): number {
    const limits = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 3000
    };
    
    return limits[platform] || 2200;
  }

  // Validate caption length for platform
  validateCaptionLength(caption: string, platform: CaptionOptions['platform']): {
    isValid: boolean;
    length: number;
    limit: number;
  } {
    const length = caption.length;
    const limit = this.getCharacterLimit(platform);
    
    return {
      isValid: length <= limit,
      length,
      limit
    };
  }
}

export const socialCaptionService = new SocialCaptionService();
export default socialCaptionService;