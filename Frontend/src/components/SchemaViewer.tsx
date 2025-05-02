
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Database, Table2, KeyRound, Link } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const SchemaViewer: React.FC = () => {
  const { schema, schemaLoading, activeConnection } = useApp();
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  
  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName) 
        : [...prev, tableName]
    );
  };
  
  if (!activeConnection) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
        <Database size={48} className="mb-4 opacity-50" />
        <p>No active connection</p>
        <p className="text-sm">Select a connection to view its schema</p>
      </div>
    );
  }
  
  if (schemaLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Database size={20} className="text-muted-foreground" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        
        {[1, 2, 3].map(i => (
          <div key={i} className="pl-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Table2 size={16} className="text-muted-foreground" />
              <Skeleton className="h-4 w-[180px]" />
            </div>
            
            <div className="pl-6 space-y-1">
              {[1, 2, 3, 4].map(j => (
                <Skeleton key={j} className="h-3 w-[150px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!schema) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
        <Database size={48} className="mb-4 opacity-50" />
        <p>Could not load schema</p>
        <p className="text-sm">Please check your connection and try again</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-1">Database Schema</h2>
        <p className="text-sm text-muted-foreground">{activeConnection.database}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <Accordion type="multiple" className="w-full">
          {schema.tables.map((table: any) => (
            <AccordionItem key={table.name} value={table.name}>
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <Table2 size={16} className="text-blue-500" />
                  <span>{table.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 py-1 space-y-1 text-sm">
                  {table.columns.map((column: any) => (
                    <div key={column.name} className="flex items-center gap-2">
                      {column.isPrimary && <KeyRound size={12} className="text-amber-500" />}
                      {column.isForeign && <Link size={12} className="text-purple-500" />}
                      {!column.isPrimary && !column.isForeign && <span className="w-3" />}
                      <span className="font-medium">{column.name}</span>
                      <span className="text-xs text-muted-foreground">{column.type}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default SchemaViewer;
