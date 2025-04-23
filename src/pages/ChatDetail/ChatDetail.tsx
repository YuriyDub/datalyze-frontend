import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChatMessage } from '@/features/chat/components/ChatMessage';
import {
  getChat,
  sendMessage,
  executeQuery,
  IChatMessage,
  IQueryResult,
} from '@/services/api/chat';
import { Separator } from '@radix-ui/react-separator';
import { Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<{
    id: string;
    title: string;
    datasetId: string;
    datasetName?: string;
  } | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      navigate('/chats');
      return;
    }

    const fetchChat = async () => {
      setIsLoading(true);
      try {
        const data = await getChat(id);
        setChat(data.chat);
        setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching chat:', error);
        toast.error('Failed to load chat');
        navigate('/chats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChat();
  }, [id, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    setIsSending(true);
    try {
      // Optimistically add user message to the UI
      const userMessage: IChatMessage = {
        id: `temp-${Date.now()}`,
        chatId: id,
        content: newMessage,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage('');

      // Send message to the server
      const response = await sendMessage(id, newMessage);

      // Add assistant response
      const assistantMessage: IChatMessage = {
        id: `temp-response-${Date.now()}`,
        chatId: id,
        content: response.content,
        role: 'assistant',
        createdAt: new Date().toISOString(),
        title: response.title,
        sqlQuery: response.sqlQuery,
        visualizationType: response.visualizationType,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleExecuteQuery = async (query: string): Promise<IQueryResult> => {
    if (!chat?.datasetId) {
      throw new Error('Dataset ID not found');
    }

    try {
      return await executeQuery(chat.datasetId, query);
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/chats">AI Chat</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{chat?.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onExecuteQuery={handleExecuteQuery} />
        ))}
        {isSending ? <LoadingSpinner /> : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about your data..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
            {isSending ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
