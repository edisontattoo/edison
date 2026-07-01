import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input, Spinner, Card, ChatBubbleLeftEllipsisIcon } from '../common/UIElements';
import { createChat, sendMessageStream } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import { Chat } from '@google/genai'; // Only import Chat type if needed, but createChat returns it.
import { FAQ_DATA } from '../../services/mockDataService'; // For initial quick replies


const AIChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAiAvailable, setIsAiAvailable] = useState(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setMessages([{ 
            id: 'initial-greeting', 
            text: "Hello! I'm InkBot. The AI chat service is currently unavailable because the API key is not configured.", 
            sender: 'bot', 
            timestamp: new Date() 
        }]);
        return;
    }
    
    setIsAiAvailable(true);
    const systemInstruction = `You are InkBot, a friendly and helpful AI assistant for Edison Tattoo And Body Piercing, a tattoo and piercing shop. 
    Your goal is to answer questions about tattoos, piercings, appointments, aftercare, and our services. 
    Be informative, concise, and maintain a professional yet approachable tone. 
    If a question is outside your scope (e.g., medical advice beyond general aftercare, legal questions), politely state that you cannot answer it and suggest consulting a professional artist at the studio or a doctor.
    Keep your answers relatively short and to the point. You can use information from the following FAQs if relevant:
    ${FAQ_DATA.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}
    When asked about booking, direct them to the booking page. For release forms, direct them to the release form page.
    Do not make up information about artists or specific studio policies not covered in the FAQs.
    `;
    
    try {
      chatRef.current = createChat(systemInstruction);
    } catch (error) {
      console.error("Failed to initialize chat, likely due to a missing API key.", error);
    }

    setMessages([{ 
        id: 'initial-greeting', 
        text: "Hello! I'm InkBot, your AI assistant for Edison Tattoo And Body Piercing. How can I help you today? You can ask about services, aftercare, or booking.", 
        sender: 'bot', 
        timestamp: new Date() 
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!chatRef.current) {
        // Handle case where chat failed to initialize
        const botResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: "I'm currently unable to connect to the AI service. The API Key may be missing or invalid.",
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        return;
    }

    try {
      const stream = await sendMessageStream(chatRef.current, input);
      let currentBotMessageId = (Date.now() + 1).toString();
      let accumulatedText = "";

      // Add a placeholder for the bot's message
      setMessages(prev => [...prev, { id: currentBotMessageId, text: "...", sender: 'bot', timestamp: new Date() }]);

      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        setMessages(prev => prev.map(msg => 
          msg.id === currentBotMessageId ? { ...msg, text: accumulatedText } : msg
        ));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        text: "Sorry, I encountered an error. Please try again.", 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleQuickReply = (question: string) => {
    setInput(question);
    // Optionally, call handleSend directly or let user press send
    // For now, just sets the input
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col h-[70vh] max-h-[600px]">
        <div className="flex items-center mb-4">
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-2xl font-orbitron text-cyan-400">Ask the Pro</h2>
        </div>
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 bg-gray-800 p-3 rounded-lg">
            {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow ${
                    msg.sender === 'user' 
                    ? 'bg-cyan-600 text-white rounded-br-none' 
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-cyan-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                </div>
            </div>
            ))}
            {isLoading && messages[messages.length-1]?.sender === 'user' && ( // Show spinner only if user just sent
                 <div className="flex justify-start">
                    <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow bg-gray-700 text-gray-200 rounded-bl-none">
                        <Spinner size="sm" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && isAiAvailable && ( // Show quick replies only for initial state
            <div className="mb-3 flex flex-wrap gap-2">
                {FAQ_DATA.slice(0, 3).map(faq => (
                    <Button key={faq.question} variant="outline" size="sm" onClick={() => handleQuickReply(faq.question)}>
                        {faq.question.length > 30 ? faq.question.substring(0,27) + "..." : faq.question}
                    </Button>
                ))}
            </div>
        )}

        <div className="mt-auto flex items-center space-x-2 pt-2 border-t border-gray-700">
            <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isAiAvailable ? "Ask something..." : "AI chat is unavailable"}
            className="flex-grow"
            disabled={isLoading || !isAiAvailable}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim() || !isAiAvailable} variant="primary">
            {isLoading ? <Spinner size="sm" /> : 'Send'}
            </Button>
        </div>
    </Card>
  );
};

export default AIChatBot;