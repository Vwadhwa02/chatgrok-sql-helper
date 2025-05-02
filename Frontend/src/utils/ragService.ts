
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SqlQueryResult {
  sql: string;
  explanation: string;
}

export const generateSqlFromNaturalLanguage = async (
  question: string, 
  schema: any, 
  history: Message[]
): Promise<SqlQueryResult> => {
  // In a real application, this would call an AI model API like OpenAI
  // For our demo, we'll simulate responses based on the question
  console.log(`Generating SQL for: ${question}`);
  
  // Simple pattern matching for demo purposes
  let sql = '';
  let explanation = '';
  
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('all customer') || lowerQuestion.includes('list customer')) {
    sql = 'SELECT * FROM customers';
    explanation = 'This query retrieves all customers from the database.';
  } else if (lowerQuestion.includes('products') && lowerQuestion.includes('price')) {
    if (lowerQuestion.includes('expensive') || lowerQuestion.includes('highest')) {
      sql = 'SELECT * FROM products ORDER BY price DESC LIMIT 10';
      explanation = 'This query lists the 10 most expensive products in descending order of price.';
    } else if (lowerQuestion.includes('cheap') || lowerQuestion.includes('lowest')) {
      sql = 'SELECT * FROM products ORDER BY price ASC LIMIT 10';
      explanation = 'This query lists the 10 least expensive products in ascending order of price.';
    } else {
      sql = 'SELECT * FROM products';
      explanation = 'This query lists all products.';
    }
  } else if (lowerQuestion.includes('order') && lowerQuestion.includes('customer')) {
    sql = 'SELECT c.name, o.* FROM orders o JOIN customers c ON o.customer_id = c.id';
    explanation = 'This query joins the orders and customers tables to show orders with customer names.';
  } else if (lowerQuestion.includes('count') && lowerQuestion.includes('order')) {
    sql = 'SELECT COUNT(*) as order_count FROM orders';
    explanation = 'This query counts the total number of orders.';
  } else if (lowerQuestion.includes('average') && lowerQuestion.includes('price')) {
    sql = 'SELECT AVG(price) as average_price FROM products';
    explanation = 'This query calculates the average price of all products.';
  } else if (lowerQuestion.includes('total sales')) {
    sql = 'SELECT SUM(total) as total_sales FROM orders WHERE status = \'Completed\'';
    explanation = 'This query calculates the sum of all completed order totals.';
  } else if (lowerQuestion.includes('product') && lowerQuestion.includes('category')) {
    sql = 'SELECT category, COUNT(*) as product_count FROM products GROUP BY category';
    explanation = 'This query counts products by category.';
  } else {
    sql = 'SELECT * FROM customers LIMIT 10';
    explanation = 'I\'m not sure what you\'re asking for. Here\'s a sample query to get you started.';
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return { sql, explanation };
};
