import { IChatMessage, IQueryResult } from '@/services/api/chat';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { VisualizationRenderer } from './visualizations/VisualizationRenderer';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ChatMessageProps {
  message: IChatMessage;
  onExecuteQuery: (query: string) => Promise<IQueryResult>;
}

export function ChatMessage({ message, onExecuteQuery }: ChatMessageProps) {
  const [queryResult, setQueryResult] = useState<IQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const date = new Date(message.createdAt);

  const isUser = message.role === 'user';

  useEffect(() => {
    if (message.sqlQuery) {
      if (!queryResult) {
        executeQuery(message.sqlQuery);
      }
    }
  }, [message]);

  const executeQuery = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await onExecuteQuery(query);
      setQueryResult(result);
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error('Failed to execute query');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentWithQueries = () => {
    if (!message.sqlQuery) {
      return <div className="prose dark:prose-invert max-w-none">{message.content}</div>;
    }

    // Split content into parts (text and code blocks)
    const parts = message.content
      .split(/```[\s\S]*?```/)
      .map((part) => part.trim())
      .filter((part) => part);

    // Extract pure SQL queries from code blocks
    const queries = [...message.content.matchAll(/```(?:.*?sql)?\s*\n?([\s\S]*?)```/g)].map(
      (match) => match[1].trim(),
    );
    return (
      <div className="prose dark:prose-invert max-w-none flex flex-col gap-4">
        {parts.map((part, index) => (
          <div key={`text-${index}`} className="flex flex-col gap-2">
            {part}
            {queries[index] && (
              <>
                {isLoading ? (
                  <LoadingSpinner className="mx-auto my-32" />
                ) : (
                  <div className="border rounded-md p-4 h-15/10">
                    <VisualizationRenderer title={message.title} data={queryResult} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex flex-col gap-2">
        <div className={`flex items-center ${isUser ? 'flex-row-reverse' : ''} `}>
          <h3 className="text-sm font-semibold">{isUser ? 'You' : 'AI Assistant'}</h3>
        </div>
        <Card
          className={`relative p-4 max-w-3xl gap-1 pb-8 min-w-50 ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-card rounded-tl-none'
          }`}>
          {renderContentWithQueries()}
          <div className={'absolute bottom-2 right-4 flex gap-1 justify-end'}>
            <span className="text-[10px]">
              {date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            </span>
            <span className="text-[10px]">
              {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
