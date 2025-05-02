
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

export const testConnection = (connection: DbConnection): Promise<boolean> => {
  // In a real application, this would use an actual database connector
  // For our demo, we'll simulate a connection test
  console.log(`Testing connection to ${connection.name}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate success with 80% probability
      const success = Math.random() < 0.8;
      console.log(`Connection test ${success ? 'succeeded' : 'failed'}`);
      resolve(success);
    }, 1000);
  });
};

export const executeQuery = (connection: DbConnection, query: string): Promise<any[]> => {
  // In a real application, this would execute the query against the database
  // For our demo, we'll return mock data based on the query
  console.log(`Executing query on ${connection.name}: ${query}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (query.toLowerCase().includes('select')) {
        // Return mock data for SELECT queries
        if (query.toLowerCase().includes('customer')) {
          resolve([
            { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-20' },
            { id: 3, name: 'Robert Johnson', email: 'robert@example.com', created_at: '2023-03-10' },
          ]);
        } else if (query.toLowerCase().includes('product')) {
          resolve([
            { id: 101, name: 'Laptop', price: 1299.99, category: 'Electronics', stock: 45 },
            { id: 102, name: 'Smartphone', price: 799.99, category: 'Electronics', stock: 120 },
            { id: 103, name: 'Headphones', price: 199.99, category: 'Accessories', stock: 78 },
          ]);
        } else if (query.toLowerCase().includes('order')) {
          resolve([
            { id: 1001, customer_id: 1, total: 1499.98, status: 'Completed', date: '2023-04-15' },
            { id: 1002, customer_id: 2, total: 799.99, status: 'Processing', date: '2023-04-18' },
            { id: 1003, customer_id: 3, total: 2099.97, status: 'Shipped', date: '2023-04-20' },
          ]);
        } else {
          resolve([
            { result: 'Mock data for query', rows: 3 }
          ]);
        }
      } else {
        // Return success message for non-SELECT queries
        resolve([{ message: 'Query executed successfully', affectedRows: 5 }]);
      }
    }, 1000);
  });
};

export const getSchemaForConnection = (connection: DbConnection): Promise<any> => {
  // In a real application, this would fetch the actual database schema
  // For our demo, we'll return mock schema data
  console.log(`Getting schema for ${connection.name}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        tables: [
          {
            name: 'customers',
            columns: [
              { name: 'id', type: 'int', isPrimary: true },
              { name: 'name', type: 'varchar(100)' },
              { name: 'email', type: 'varchar(100)' },
              { name: 'created_at', type: 'datetime' }
            ]
          },
          {
            name: 'products',
            columns: [
              { name: 'id', type: 'int', isPrimary: true },
              { name: 'name', type: 'varchar(100)' },
              { name: 'price', type: 'decimal(10,2)' },
              { name: 'category', type: 'varchar(50)' },
              { name: 'stock', type: 'int' }
            ]
          },
          {
            name: 'orders',
            columns: [
              { name: 'id', type: 'int', isPrimary: true },
              { name: 'customer_id', type: 'int', isForeign: true, references: 'customers.id' },
              { name: 'total', type: 'decimal(10,2)' },
              { name: 'status', type: 'varchar(50)' },
              { name: 'date', type: 'datetime' }
            ]
          },
          {
            name: 'order_items',
            columns: [
              { name: 'id', type: 'int', isPrimary: true },
              { name: 'order_id', type: 'int', isForeign: true, references: 'orders.id' },
              { name: 'product_id', type: 'int', isForeign: true, references: 'products.id' },
              { name: 'quantity', type: 'int' },
              { name: 'price', type: 'decimal(10,2)' }
            ]
          }
        ]
      });
    }, 800);
  });
};
