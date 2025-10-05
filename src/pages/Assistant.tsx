import { useState } from 'react';
import { Send, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'action';
  content: string;
  timestamp: Date;
  actions?: {
    type: string;
    description: string;
    data: Record<string, unknown>;
  }[];
}

export default function Assistant() {
  const { currentOrg } = useOrg();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your ChordLine AI assistant${currentOrg ? ` for ${currentOrg.name}` : ''}. I can help you:\n\n• Log shows and earnings\n• Track your performance data\n• Answer questions about your band\n\nTry telling me: "We played at The Bluebird last night for $600"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (in production, this would call OpenRouter/OpenAI)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'd love to help you with that! However, I need to be connected to an AI service to provide intelligent responses.\n\nFor now, I can suggest some actions based on your message:",
        timestamp: new Date(),
        actions: input.toLowerCase().includes('played') && input.toLowerCase().includes('$') ? [
          {
            type: 'create_show',
            description: 'Create a new show entry',
            data: { venue: 'The Bluebird', earnings: 600 }
          },
          {
            type: 'add_earnings',
            description: 'Add earnings record',
            data: { amount: 600, type: 'ticket_sales' }
          }
        ] : [
          {
            type: 'view_shows',
            description: 'View your recent shows',
            data: {}
          }
        ]
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleActionApprove = (_messageId: string, actionType: string) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Great! I would ${actionType === 'create_show' ? 'create that show' : 'perform that action'} for you. This feature will be fully implemented once connected to the database.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, actionMessage]);
  };

  const handleActionReject = (_messageId: string) => {
    const rejectMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'No problem! Is there anything else I can help you with?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, rejectMessage]);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex-shrink-0">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ChordLine AI</h1>
              <p className="text-xs text-muted-foreground">
                {currentOrg ? `Assistant for ${currentOrg.name}` : 'Your intelligent band assistant'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* Message bubble */}
              <div className={cn(
                "flex",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}>
                <div className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2",
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                )}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="space-y-2 ml-4">
                  {message.actions.map((action, index) => (
                    <div key={index} className="bg-accent/50 border border-border rounded-lg p-3">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {action.description}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleActionApprove(message.id, action.type)}
                          className={cn(
                            "flex items-center space-x-1 px-3 py-1 text-xs rounded-md",
                            "bg-green-100 text-green-800 hover:bg-green-200",
                            "dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
                          )}
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Yes, do it</span>
                        </button>
                        <button
                          onClick={() => handleActionReject(message.id)}
                          className={cn(
                            "flex items-center space-x-1 px-3 py-1 text-xs rounded-md",
                            "bg-red-100 text-red-800 hover:bg-red-200",
                            "dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                          )}
                        >
                          <XCircle className="h-3 w-3" />
                          <span>No thanks</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border flex-shrink-0">
        <div className="max-w-md mx-auto p-4">
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask me anything about your band..."
              className={cn(
                "flex-1 px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={cn(
                "px-3 py-2 bg-primary text-primary-foreground rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
