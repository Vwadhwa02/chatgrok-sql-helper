
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import ConnectionsPanel from '../components/ConnectionsPanel';
import SchemaViewer from '../components/SchemaViewer';
import ChatInterface from '../components/ChatInterface';
import { Database, Table2 } from 'lucide-react';
import { AppProvider } from '../context/AppContext';

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="border-b py-3 px-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Database className="text-blue-600" size={24} />
          <span>ChatGrok SQL</span>
          <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">Beta</span>
        </h1>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <AppProvider>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r">
              <Tabs defaultValue="connections">
                <TabsList className="w-full">
                  <TabsTrigger value="connections" className="flex-1">
                    <Database size={16} className="mr-2" />
                    Connections
                  </TabsTrigger>
                  <TabsTrigger value="schema" className="flex-1">
                    <Table2 size={16} className="mr-2" />
                    Schema
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="connections" className="h-[calc(100vh-108px)]">
                  <ConnectionsPanel />
                </TabsContent>
                
                <TabsContent value="schema" className="h-[calc(100vh-108px)]">
                  <SchemaViewer />
                </TabsContent>
              </Tabs>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={75}>
              <ChatInterface />
            </ResizablePanel>
          </ResizablePanelGroup>
        </AppProvider>
      </div>
    </div>
  );
};

export default Index;
