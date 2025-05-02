
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { testConnection, getSchemaForConnection } from '../utils/dbConnector';

interface DbConnection {
  id: string;
  name: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  type: 'mysql' | 'postgresql' | 'sqlserver';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sql?: string;
  results?: any[];
}

interface AppContextType {
  connections: DbConnection[];
  activeConnection: DbConnection | null;
  connectionsLoading: boolean;
  messages: Message[];
  addConnection: (connection: Omit<DbConnection, 'id'>) => Promise<boolean>;
  editConnection: (id: string, connection: Omit<DbConnection, 'id'>) => Promise<boolean>;
  deleteConnection: (id: string) => void;
  setActiveConnection: (id: string | null) => void;
  schema: any | null;
  schemaLoading: boolean;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string, sql?: string, results?: any[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<DbConnection[]>(() => {
    const saved = localStorage.getItem('chatgrok-connections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved connections', e);
        return [];
      }
    }
    return [];
  });
  
  const [activeConnection, setActiveConnectionState] = useState<DbConnection | null>(null);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [schema, setSchema] = useState<any | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Save connections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatgrok-connections', JSON.stringify(connections));
  }, [connections]);
  
  // Fetch schema when active connection changes
  useEffect(() => {
    if (activeConnection) {
      setSchemaLoading(true);
      setSchema(null);
      
      getSchemaForConnection(activeConnection)
        .then(schemaData => {
          setSchema(schemaData);
        })
        .catch(error => {
          console.error('Failed to fetch schema', error);
        })
        .finally(() => {
          setSchemaLoading(false);
        });
    } else {
      setSchema(null);
    }
  }, [activeConnection]);
  
  const addConnection = async (connectionData: Omit<DbConnection, 'id'>): Promise<boolean> => {
    setConnectionsLoading(true);
    
    try {
      const newConnection = {
        ...connectionData,
        id: `conn_${Date.now()}`,
      };
      
      const success = await testConnection(newConnection as DbConnection);
      
      if (success) {
        setConnections(prev => [...prev, newConnection as DbConnection]);
      }
      
      return success;
    } finally {
      setConnectionsLoading(false);
    }
  };
  
  const editConnection = async (id: string, connectionData: Omit<DbConnection, 'id'>): Promise<boolean> => {
    setConnectionsLoading(true);
    
    try {
      const updatedConnection = {
        ...connectionData,
        id,
      };
      
      const success = await testConnection(updatedConnection as DbConnection);
      
      if (success) {
        setConnections(prev => 
          prev.map(conn => conn.id === id ? updatedConnection as DbConnection : conn)
        );
        
        if (activeConnection?.id === id) {
          setActiveConnectionState(updatedConnection as DbConnection);
        }
      }
      
      return success;
    } finally {
      setConnectionsLoading(false);
    }
  };
  
  const deleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    
    if (activeConnection?.id === id) {
      setActiveConnectionState(null);
    }
  };
  
  const setActiveConnection = (id: string | null) => {
    if (id === null) {
      setActiveConnectionState(null);
      return;
    }
    
    const connection = connections.find(conn => conn.id === id);
    setActiveConnectionState(connection || null);
  };
  
  const addUserMessage = (content: string) => {
    setMessages(prev => [
      ...prev, 
      {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      }
    ]);
  };
  
  const addAssistantMessage = (content: string, sql?: string, results?: any[]) => {
    setMessages(prev => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
        sql,
        results,
      }
    ]);
  };
  
  const value = {
    connections,
    activeConnection,
    connectionsLoading,
    messages,
    addConnection,
    editConnection,
    deleteConnection,
    setActiveConnection,
    schema,
    schemaLoading,
    addUserMessage,
    addAssistantMessage,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};
