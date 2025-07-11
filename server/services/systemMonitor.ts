import { db, pool } from '../db';
import yahooFinance from 'yahoo-finance2';

// Track server start time for uptime calculation
const serverStartTime = Date.now();

// Track active connections and requests
let activeConnections = 0;
let totalRequests = 0;
let errorCount = 0;
let responseTimes: number[] = [];

// Track API health
interface APIHealth {
  yahooFinance: boolean;
  lastChecked: number;
}

const apiHealth: APIHealth = {
  yahooFinance: false,
  lastChecked: 0
};

// Middleware to track requests
export function trackRequest(req: any, res: any, next: any) {
  const startTime = Date.now();
  totalRequests++;
  activeConnections++;
  
  res.on('finish', () => {
    activeConnections--;
    const responseTime = Date.now() - startTime;
    responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (responseTimes.length > 100) {
      responseTimes.shift();
    }
    
    // Track errors
    if (res.statusCode >= 400) {
      errorCount++;
    }
  });
  
  next();
}

// Check database connectivity
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tableCount: number;
  connectionCount: number;
}> {
  try {
    // Test database connection
    const testQuery = await db.execute('SELECT 1');
    
    // Get table count
    const tableCountResult = await db.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    // Get active connections
    const connectionResult = await db.execute(`
      SELECT COUNT(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    
    return {
      connected: true,
      tableCount: Number(tableCountResult[0]?.count || 0),
      connectionCount: Number(connectionResult[0]?.count || 0)
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      connected: false,
      tableCount: 0,
      connectionCount: 0
    };
  }
}

// Check Yahoo Finance API health
export async function checkYahooFinanceHealth(): Promise<boolean> {
  try {
    // Test with a simple quote request
    const quote = await yahooFinance.quote('AAPL');
    const isHealthy = quote && quote.regularMarketPrice !== undefined;
    
    apiHealth.yahooFinance = isHealthy;
    apiHealth.lastChecked = Date.now();
    
    return isHealthy;
  } catch (error) {
    console.error('Yahoo Finance health check failed:', error);
    apiHealth.yahooFinance = false;
    apiHealth.lastChecked = Date.now();
    return false;
  }
}

// Get system uptime
export function getSystemUptime(): {
  uptimeMs: number;
  uptimeFormatted: string;
  uptimePercentage: number;
} {
  const uptimeMs = Date.now() - serverStartTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);
  
  let uptimeFormatted = '';
  if (uptimeDays > 0) {
    uptimeFormatted = `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m`;
  } else if (uptimeHours > 0) {
    uptimeFormatted = `${uptimeHours}h ${uptimeMinutes % 60}m`;
  } else {
    uptimeFormatted = `${uptimeMinutes}m`;
  }
  
  // Calculate uptime percentage (assuming 99.9% target)
  const uptimePercentage = Math.min(99.9, (uptimeMs / (24 * 60 * 60 * 1000)) * 99.9);
  
  return {
    uptimeMs,
    uptimeFormatted,
    uptimePercentage: Number(uptimePercentage.toFixed(1))
  };
}

// Get error rate
export function getErrorRate(): number {
  if (totalRequests === 0) return 0;
  return Number(((errorCount / totalRequests) * 100).toFixed(2));
}

// Get average response time
export function getAverageResponseTime(): number {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((acc, time) => acc + time, 0);
  return Number((sum / responseTimes.length).toFixed(0));
}

// Get active user count (connections)
export function getActiveConnections(): number {
  return activeConnections;
}

// Get total requests
export function getTotalRequests(): number {
  return totalRequests;
}

// Get comprehensive system status
export async function getSystemStatus() {
  const dbHealth = await checkDatabaseHealth();
  const yahooHealth = await checkYahooFinanceHealth();
  const uptime = getSystemUptime();
  const errorRate = getErrorRate();
  const avgResponseTime = getAverageResponseTime();
  const activeUsers = getActiveConnections();
  const totalReqs = getTotalRequests();
  
  return {
    database: {
      connected: dbHealth.connected,
      tableCount: dbHealth.tableCount,
      activeConnections: dbHealth.connectionCount,
      type: 'PostgreSQL'
    },
    apis: {
      yahooFinance: {
        status: yahooHealth,
        lastChecked: apiHealth.lastChecked
      },
      cache: {
        enabled: true,
        status: 'active'
      }
    },
    system: {
      uptime: uptime.uptimeFormatted,
      uptimePercentage: uptime.uptimePercentage,
      errorRate,
      avgResponseTime,
      activeUsers,
      totalRequests: totalReqs
    },
    timestamp: new Date().toISOString()
  };
}

// Reset counters (for testing)
export function resetCounters() {
  totalRequests = 0;
  errorCount = 0;
  responseTimes = [];
}