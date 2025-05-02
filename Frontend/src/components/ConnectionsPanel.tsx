
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Label } from './ui/label';
import { Database, Plus, Edit, Trash2 } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (data: any) => Promise<boolean>;
  initialValues?: any;
  onClose: () => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, initialValues, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    type: initialValues?.type || 'postgresql',
    host: initialValues?.host || 'localhost',
    port: initialValues?.port || '',
    database: initialValues?.database || '',
    username: initialValues?.username || '',
    password: initialValues?.password || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      } else {
        setError('Failed to connect to database. Please check your connection details.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Set default ports based on database type
  React.useEffect(() => {
    if (formData.type === 'mysql' && !formData.port) {
      setFormData(prev => ({ ...prev, port: '3306' }));
    } else if (formData.type === 'postgresql' && !formData.port) {
      setFormData(prev => ({ ...prev, port: '5432' }));
    } else if (formData.type === 'sqlserver' && !formData.port) {
      setFormData(prev => ({ ...prev, port: '1433' }));
    }
  }, [formData.type]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="My Database"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Database Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange('type', value)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select database type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlserver">SQL Server</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host">Host</Label>
          <Input
            id="host"
            value={formData.host}
            onChange={(e) => handleChange('host', e.target.value)}
            placeholder="localhost"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            value={formData.port}
            onChange={(e) => handleChange('port', e.target.value)}
            placeholder={formData.type === 'postgresql' ? '5432' : formData.type === 'mysql' ? '3306' : '1433'}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="database">Database Name</Label>
        <Input
          id="database"
          value={formData.database}
          onChange={(e) => handleChange('database', e.target.value)}
          placeholder="mydb"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="postgres"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Testing Connection...' : initialValues ? 'Update Connection' : 'Add Connection'}
        </Button>
      </div>
    </form>
  );
};

const ConnectionsPanel: React.FC = () => {
  const {
    connections,
    activeConnection,
    setActiveConnection,
    addConnection,
    editConnection,
    deleteConnection,
  } = useApp();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  
  const handleEdit = (id: string) => {
    setEditingConnection(id);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      deleteConnection(id);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">Database Connections</h2>
        
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus size={16} />
              Add
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Database Connection</SheetTitle>
              <SheetDescription>
                Enter your database connection details below.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <ConnectionForm
                onSubmit={addConnection}
                onClose={() => setIsAddOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
            <Database size={48} className="mb-4 opacity-50" />
            <p>No database connections yet</p>
            <p className="text-sm">Add a connection to get started</p>
          </div>
        ) : (
          connections.map(connection => (
            <Card
              key={connection.id}
              className={`cursor-pointer ${
                activeConnection?.id === connection.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setActiveConnection(connection.id)}
            >
              <CardHeader className="py-3">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{connection.name}</span>
                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(connection.id)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(connection.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs">
                  {connection.type} • {connection.host}:{connection.port}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      
      {editingConnection && (
        <Sheet
          open={!!editingConnection}
          onOpenChange={(open) => {
            if (!open) setEditingConnection(null);
          }}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Database Connection</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <ConnectionForm
                initialValues={connections.find(c => c.id === editingConnection)}
                onSubmit={(data) => editConnection(editingConnection, data)}
                onClose={() => setEditingConnection(null)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default ConnectionsPanel;
