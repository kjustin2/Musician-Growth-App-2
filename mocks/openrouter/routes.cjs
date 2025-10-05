const express = require('express');
const router = express.Router();

// Mock AI responses for different contexts
const mockResponses = {
  social_media: [
    "🎵 Just finished an incredible show at The Bluebird Cafe! The acoustic vibes were perfect and the audience was so engaged. There's nothing quite like that intimate Nashville magic. #LiveMusic #TheBluebird #AcousticVibes",
    "✨ New song 'Whispers in the Dark' is now streaming everywhere! This one's close to our hearts - written during those late night sessions when creativity flows freely. Give it a listen and let us know what you think! 🎶",
    "🌟 Thank you to everyone who came out to our show last night! Your energy was incredible and made every song feel special. Already planning our next performance - stay tuned! #ThankYou #LiveMusic #GratefulBand"
  ],
  planning: [
    "I'd recommend starting with smaller venues to build your fanbase, then gradually moving to larger spaces. Consider booking 2-3 shows per month to maintain momentum without overwhelming your schedule.",
    "For your summer tour, I suggest focusing on college towns and music festivals. The demographic tends to be more open to discovering new music, and the atmosphere is perfect for building a loyal following.",
    "Based on your current performance schedule, adding merchandise sales could increase your revenue by 20-30%. Consider starting with simple items like stickers, t-shirts, and digital downloads."
  ],
  creative: [
    "Here's a creative setlist idea: Start with your most recognizable song to grab attention, then take the audience on an emotional journey with 2-3 deeper cuts, and end with your most energetic crowd-pleaser.",
    "For your next music video, consider a simple performance-style video in an interesting location. Nashville has so many iconic spots that would complement your sound - maybe the pedestrian bridge or East Nashville murals?",
    "Try experimenting with alternate tunings on your guitar for your next writing session. Drop D or DADGAD can inspire completely different chord progressions and melodies you might not find in standard tuning."
  ]
};

const getRandomResponse = (category) => {
  const responses = mockResponses[category] || mockResponses.planning;
  return responses[Math.floor(Math.random() * responses.length)];
};

const detectCategory = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('social') || lowerPrompt.includes('post') || lowerPrompt.includes('caption') || lowerPrompt.includes('instagram') || lowerPrompt.includes('twitter')) {
    return 'social_media';
  }
  
  if (lowerPrompt.includes('creative') || lowerPrompt.includes('music') || lowerPrompt.includes('song') || lowerPrompt.includes('setlist') || lowerPrompt.includes('video')) {
    return 'creative';
  }
  
  return 'planning';
};

// Authentication middleware (mock)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: {
        message: 'No API key provided',
        type: 'invalid_request_error'
      }
    });
  }
  
  if (!token.startsWith('mock_openrouter_key')) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error'
      }
    });
  }
  
  next();
};

// Chat completions endpoint
router.post('/api/v1/chat/completions', authenticateToken, (req, res) => {
  const { messages, model, max_tokens = 150, temperature = 0.7, stream = false } = req.body;
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: {
        message: 'Invalid messages format',
        type: 'invalid_request_error'
      }
    });
  }
  
  const lastMessage = messages[messages.length - 1];
  const prompt = lastMessage.content;
  const category = detectCategory(prompt);
  const response = getRandomResponse(category);
  
  const completion = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model || 'anthropic/claude-3-sonnet',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: Math.floor(prompt.length / 4), // Rough token estimation
      completion_tokens: Math.floor(response.length / 4),
      total_tokens: Math.floor((prompt.length + response.length) / 4)
    }
  };
  
  if (stream) {
    // Mock streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    const words = response.split(' ');
    words.forEach((word, index) => {
      setTimeout(() => {
        const chunk = {
          id: completion.id,
          object: 'chat.completion.chunk',
          created: completion.created,
          model: completion.model,
          choices: [
            {
              index: 0,
              delta: {
                content: word + (index < words.length - 1 ? ' ' : '')
              },
              finish_reason: index === words.length - 1 ? 'stop' : null
            }
          ]
        };
        
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        
        if (index === words.length - 1) {
          res.write('data: [DONE]\n\n');
          res.end();
        }
      }, index * 100); // Simulate typing delay
    });
  } else {
    res.json(completion);
  }
});

// Text completions endpoint (legacy)
router.post('/api/v1/completions', authenticateToken, (req, res) => {
  const { prompt, model, max_tokens = 150, temperature = 0.7, stream = false } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: {
        message: 'No prompt provided',
        type: 'invalid_request_error'
      }
    });
  }
  
  const category = detectCategory(prompt);
  const response = getRandomResponse(category);
  
  const completion = {
    id: `cmpl-${Date.now()}`,
    object: 'text_completion',
    created: Math.floor(Date.now() / 1000),
    model: model || 'anthropic/claude-3-sonnet',
    choices: [
      {
        text: response,
        index: 0,
        logprobs: null,
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: Math.floor(prompt.length / 4),
      completion_tokens: Math.floor(response.length / 4),
      total_tokens: Math.floor((prompt.length + response.length) / 4)
    }
  };
  
  res.json(completion);
});

// Models endpoint
router.get('/api/v1/models', authenticateToken, (req, res) => {
  res.json({
    object: 'list',
    data: [
      {
        id: 'anthropic/claude-3-sonnet',
        object: 'model',
        created: 1677610602,
        owned_by: 'anthropic',
        pricing: {
          prompt: '0.000003',
          completion: '0.000015'
        },
        context_length: 200000,
        architecture: {
          modality: 'text',
          tokenizer: 'Claude',
          instruct_type: 'claude'
        }
      },
      {
        id: 'openai/gpt-3.5-turbo',
        object: 'model',
        created: 1677610602,
        owned_by: 'openai',
        pricing: {
          prompt: '0.0000005',
          completion: '0.0000015'
        },
        context_length: 4096,
        architecture: {
          modality: 'text',
          tokenizer: 'cl100k_base',
          instruct_type: 'chatml'
        }
      },
      {
        id: 'openai/gpt-4',
        object: 'model',
        created: 1687882411,
        owned_by: 'openai',
        pricing: {
          prompt: '0.00003',
          completion: '0.00006'
        },
        context_length: 8192,
        architecture: {
          modality: 'text',
          tokenizer: 'cl100k_base',
          instruct_type: 'chatml'
        }
      }
    ]
  });
});

// Generation endpoint (for specific use cases)
router.post('/api/v1/generation', authenticateToken, (req, res) => {
  const { prompt, context, type = 'general' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: {
        message: 'No prompt provided',
        type: 'invalid_request_error'
      }
    });
  }
  
  let response;
  
  switch (type) {
    case 'social_media':
      response = getRandomResponse('social_media');
      break;
    case 'planning':
      response = getRandomResponse('planning');
      break;
    case 'creative':
      response = getRandomResponse('creative');
      break;
    default:
      const category = detectCategory(prompt);
      response = getRandomResponse(category);
  }
  
  res.json({
    id: `gen-${Date.now()}`,
    object: 'generation',
    created: Math.floor(Date.now() / 1000),
    result: {
      text: response,
      type: type
    },
    usage: {
      prompt_tokens: Math.floor(prompt.length / 4),
      completion_tokens: Math.floor(response.length / 4),
      total_tokens: Math.floor((prompt.length + response.length) / 4)
    }
  });
});

// Usage/billing endpoint
router.get('/api/v1/usage', authenticateToken, (req, res) => {
  res.json({
    object: 'usage',
    data: {
      total_usage: '$2.45',
      current_month: '$0.87',
      requests_count: 156,
      tokens_used: 12450,
      models_used: [
        {
          model: 'anthropic/claude-3-sonnet',
          requests: 89,
          tokens: 7890,
          cost: '$1.23'
        },
        {
          model: 'openai/gpt-3.5-turbo',
          requests: 67,
          tokens: 4560,
          cost: '$1.22'
        }
      ]
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'openrouter-mock',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;