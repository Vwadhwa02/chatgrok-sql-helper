
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, User, Bot, Database, Play, AlertCircle, X } from 'lucide-react';
import { generateSqlFromNaturalLanguage } from '../utils/ragService';
import { executeQuery } from '../utils/dbConnector';

const ChatInterface: React.FC = () => {
  const { activeConnection, messages, addUserMessage, addAssistantMessage, schema } = useApp();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!activeConnection) {
      toast({
        title: "No active connection",
        description: "Please select a database connection first.",
        variant: "destructive",
      });
      return;
    }
    
    const userQuestion = input.trim();
    addUserMessage(userQuestion);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Convert natural language to SQL using RAG
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      const { sql, explanation } = await generateSqlFromNaturalLanguage(
        userQuestion,
        schema,
        history,
      );
      
      // Execute the generated SQL query
      const results = await executeQuery(activeConnection, sql);
      
      // Add assistant response with results
      addAssistantMessage(
        `${explanation}\n\nHere's the SQL query:`,
        sql,
        results
      );
    } catch (error) {
      console.error('Error processing query:', error);
      addAssistantMessage(
        "I'm sorry, I encountered an error while processing your request. Please try again with a different question."
      );
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Help message at the beginning
  useEffect(() => {
    if (messages.length === 0 && activeConnection) {
      addAssistantMessage(
        "Hi there! I'm your SQL assistant. You can ask me questions about your database in natural language, and I'll generate and run SQL queries for you. Try asking something like 'Show me all customers' or 'What are the top 10 most expensive products?'"
      );
    }
  }, [activeConnection, messages.length]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !activeConnection ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <Database size={48} className="mb-4 opacity-50" />
            <p>Connect to a database to get started</p>
            <p className="text-sm">Use the left panel to add or select a database connection</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card'
                }`}
              >
                <CardContent className={`p-3 ${message.sql ? 'pb-1' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {message.role === 'user' ? (
                        <User size={18} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.sql && (
                        <>
                          <div className="mt-2 relative rounded-md overflow-hidden">
                            <SyntaxHighlighter
                              language="sql"
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                padding: '12px',
                                fontSize: '13px',
                                borderRadius: '0.375rem',
                              }}
                            >
                              {message.sql}
                            </SyntaxHighlighter>
                            
                            <Button
                              className="absolute top-2 right-2 h-7 w-7 p-0"
                              size="icon"
                              variant="secondary"
                              onClick={() => {
                                navigator.clipboard.writeText(message.sql || '');
                                toast({
                                  title: "Copied to clipboard",
                                  description: "SQL query copied to clipboard",
                                });
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                            </Button>
                          </div>
                          
                          {message.results && (
                            <div className="mt-3">
                              <Tabs defaultValue="table">
                                <TabsList className="mb-2">
                                  <TabsTrigger value="table">Table</TabsTrigger>
                                  <TabsTrigger value="json">JSON</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="table">
                                  {message.results.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="w-full border-collapse">
                                        <thead>
                                          <tr className="bg-muted">
                                            {Object.keys(message.results[0]).map((key) => (
                                              <th key={key} className="p-2 text-left text-xs font-medium text-muted-foreground">
                                                {key}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {message.results.map((row, i) => (
                                            <tr key={i} className="border-b border-muted">
                                              {Object.values(row).map((value: any, j) => (
                                                <td key={j} className="p-2 text-xs">
                                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-3 text-sm text-muted-foreground">
                                      No results returned
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="json">
                                  <div className="relative rounded-md overflow-hidden">
                                    <SyntaxHighlighter
                                      language="json"
                                      style={vscDarkPlus}
                                      customStyle={{
                                        margin: 0,
                                        padding: '12px',
                                        fontSize: '13px',
                                        borderRadius: '0.375rem',
                                      }}
                                    >
                                      {JSON.stringify(message.results, null, 2)}
                                    </SyntaxHighlighter>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your database..."
            disabled={isProcessing || !activeConnection}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !input.trim() || !activeConnection}
          >
            {isProcessing ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
