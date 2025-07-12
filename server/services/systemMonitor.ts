import { db, pool } from '../db';
import yahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch';

// Track server start time for uptime calculation
const serverStartTime = Date.now();

// Track active connections and requests
let activeConnections = 0;
let totalRequests = 0;
let errorCount = 0;
let responseTimes: number[] = [];

// Track API health with individual timestamps
interface APIHealth {
  yahooFinance: { status: boolean; lastChecked: number };
  finnhub: { status: boolean; lastChecked: number };
  twelveData: { status: boolean; lastChecked: number };
  polygon: { status: boolean; lastChecked: number };
}

const apiHealth: APIHealth = {
  yahooFinance: { status: false, lastChecked: 0 },
  finnhub: { status: false, lastChecked: 0 },
  twelveData: { status: false, lastChecked: 0 },
  polygon: { status: false, lastChecked: 0 }
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

// Check Yahoo Finance API health (every minute)
export async function checkYahooFinanceHealth(): Promise<boolean> {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  // Check if we need to update (every minute)
  if (now - apiHealth.yahooFinance.lastChecked < oneMinute) {
    return apiHealth.yahooFinance.status;
  }
  
  try {
    // Test with a simple quote request
    const quote = await yahooFinance.quote('AAPL');
    const isHealthy = quote && quote.regularMarketPrice !== undefined;
    
    apiHealth.yahooFinance.status = isHealthy;
    apiHealth.yahooFinance.lastChecked = now;
    
    return isHealthy;
  } catch (error) {
    console.error('Yahoo Finance health check failed:', error);
    apiHealth.yahooFinance.status = false;
    apiHealth.yahooFinance.lastChecked = now;
    return false;
  }
}

// Check Finnhub API health (every hour)
export async function checkFinnhubHealth(): Promise<boolean> {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Check if we need to update (every hour)
  if (now - apiHealth.finnhub.lastChecked < oneHour) {
    return apiHealth.finnhub.status;
  }
  
  try {
    if (!process.env.FINNHUB_API_KEY) {
      apiHealth.finnhub.status = false;
      apiHealth.finnhub.lastChecked = now;
      return false;
    }
    
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`);
    const data = await response.json();
    
    const isHealthy = response.ok && data.c !== undefined; // c = current price
    apiHealth.finnhub.status = isHealthy;
    apiHealth.finnhub.lastChecked = now;
    
    return isHealthy;
  } catch (error) {
    console.error('Finnhub health check failed:', error);
    apiHealth.finnhub.status = false;
    apiHealth.finnhub.lastChecked = now;
    return false;
  }
}

// Check Twelve Data API health (every hour)
export async function checkTwelveDataHealth(): Promise<boolean> {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Check if we need to update (every hour)
  if (now - apiHealth.twelveData.lastChecked < oneHour) {
    return apiHealth.twelveData.status;
  }
  
  try {
    if (!process.env.TWELVE_DATA_API_KEY) {
      apiHealth.twelveData.status = false;
      apiHealth.twelveData.lastChecked = now;
      return false;
    }
    
    const response = await fetch(`https://api.twelvedata.com/price?symbol=AAPL&apikey=${process.env.TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    const isHealthy = response.ok && data.price !== undefined;
    apiHealth.twelveData.status = isHealthy;
    apiHealth.twelveData.lastChecked = now;
    
    return isHealthy;
  } catch (error) {
    console.error('Twelve Data health check failed:', error);
    apiHealth.twelveData.status = false;
    apiHealth.twelveData.lastChecked = now;
    return false;
  }
}

// Check Polygon API health (every hour)
export async function checkPolygonHealth(): Promise<boolean> {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Check if we need to update (every hour)
  if (now - apiHealth.polygon.lastChecked < oneHour) {
    return apiHealth.polygon.status;
  }
  
  try {
    if (!process.env.POLYGON_API_KEY) {
      apiHealth.polygon.status = false;
      apiHealth.polygon.lastChecked = now;
      return false;
    }
    
    // Use the previous day's aggregates endpoint which works with basic access
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apikey=${process.env.POLYGON_API_KEY}`);
    const data = await response.json();
    
    const isHealthy = response.ok && (data.status === 'OK' || data.results?.length > 0);
    apiHealth.polygon.status = isHealthy;
    apiHealth.polygon.lastChecked = now;
    
    return isHealthy;
  } catch (error) {
    console.error('Polygon health check failed:', error);
    apiHealth.polygon.status = false;
    apiHealth.polygon.lastChecked = now;
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
  
  // Check all APIs in parallel
  const [yahooHealth, finnhubHealth, twelveDataHealth, polygonHealth] = await Promise.all([
    checkYahooFinanceHealth(),
    checkFinnhubHealth(),
    checkTwelveDataHealth(),
    checkPolygonHealth()
  ]);
  
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
        lastChecked: apiHealth.yahooFinance.lastChecked,
        checkInterval: '1 minute'
      },
      finnhub: {
        status: finnhubHealth,
        keyExists: !!process.env.FINNHUB_API_KEY,
        lastChecked: apiHealth.finnhub.lastChecked,
        checkInterval: '1 hour'
      },
      twelveData: {
        status: twelveDataHealth,
        keyExists: !!process.env.TWELVE_DATA_API_KEY,
        lastChecked: apiHealth.twelveData.lastChecked,
        checkInterval: '1 hour'
      },
      polygon: {
        status: polygonHealth,
        keyExists: !!process.env.POLYGON_API_KEY,
        lastChecked: apiHealth.polygon.lastChecked,
        checkInterval: '1 hour'
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