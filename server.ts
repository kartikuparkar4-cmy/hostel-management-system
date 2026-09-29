import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { connectDB } from './server/db.ts';
import authRoutes from './server/routes/auth.ts';
import adminRoutes from './server/routes/admin.ts';
import studentRoutes from './server/routes/student.ts';
import seedRoutes from './server/routes/seed.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global references for graceful shutdown
let httpServer: ReturnType<typeof createServer> | null = null;
let viteDevServer: any = null;

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number): Promise<number> {
  const net = await import('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Port is busy, try next one
        console.log(`[Server] Port ${startPort} is busy, trying ${startPort + 1}...`);
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : startPort;
      server.close(() => resolve(port));
    });
    
    server.listen(startPort, '0.0.0.0');
  });
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string) {
  console.log(`\n[Server] Received ${signal}, starting graceful shutdown...`);
  
  const shutdownPromises: Promise<void>[] = [];
  
  // Close HTTP server
  if (httpServer) {
    shutdownPromises.push(
      new Promise((resolve) => {
        httpServer!.close(() => {
          console.log('[Server] HTTP server closed');
          resolve();
        });
      })
    );
  }
  
  // Close Vite dev server
  if (viteDevServer) {
    shutdownPromises.push(
      (async () => {
        await viteDevServer.close();
        console.log('[Server] Vite dev server closed');
      })()
    );
  }
  
  // Close database connection (if using MongoDB)
  shutdownPromises.push(
    (async () => {
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState !== 0) {
        await mongoose.default.connection.close();
        console.log('[Database] MongoDB connection closed');
      }
    })()
  );
  
  await Promise.all(shutdownPromises);
  console.log('[Server] Graceful shutdown complete');
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function startServer() {
  const app = express();
  const requestedPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware
  app.use(express.json());

  // Connect to DB and seed default demo accounts
  await connectDB();

  // API Routes
  app.use('/api', authRoutes);
  app.use('/api', adminRoutes);
  app.use('/api', studentRoutes);
  app.use('/api/seed', seedRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'Hostel Management System API',
      timestamp: new Date().toISOString(),
    });
  });

  // Handle 404 for undefined API routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Vite middleware in development / Static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    
    // Create HTTP server first
    httpServer = createServer(app);
    
    // Create Vite server with middleware mode
    viteDevServer = await createViteServer({
      server: { 
        middlewareMode: true,
      },
      appType: 'spa',
    });
    
    app.use(viteDevServer.middlewares);
  }

  // Find an available port
  const availablePort = await findAvailablePort(requestedPort);
  
  if (availablePort !== requestedPort) {
    console.log(`[Server] ⚠️  Requested port ${requestedPort} was busy`);
    console.log(`[Server] 💡 To free port ${requestedPort}:`);
    console.log(`[Server]    - Windows: netstat -ano | findstr :${requestedPort}, then taskkill /PID <PID> /F`);
    console.log(`[Server]    - Linux/Mac: lsof -ti:${requestedPort} | xargs kill -9`);
    console.log(`[Server] 🚀 Using port ${availablePort} instead\n`);
  }

  // Start the server
  if (process.env.NODE_ENV === 'production' || !httpServer) {
    // Production mode or no Vite - create new HTTP server
    httpServer = app.listen(availablePort, '0.0.0.0', () => {
      console.log(`[Hostel App] Server is running at http://0.0.0.0:${availablePort}`);
      console.log(`[Hostel App] Local: http://localhost:${availablePort}`);
    });
  } else {
    // Development mode with Vite - use existing HTTP server
    httpServer.listen(availablePort, '0.0.0.0', () => {
      console.log(`[Hostel App] Server is running at http://0.0.0.0:${availablePort}`);
      console.log(`[Hostel App] Local: http://localhost:${availablePort}`);
    });
  }
  
  // Handle server errors
  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] ❌ Port ${availablePort} is still in use. Please free the port and try again.`);
      process.exit(1);
    } else {
      console.error('[Server] ❌ Server error:', err);
      process.exit(1);
    }
  });
}

startServer().catch((err) => {
  console.error('[Hostel App] Fatal startup error:', err);
  process.exit(1);
});
