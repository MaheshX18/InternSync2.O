import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import net from 'net';

console.log('[InternSync] Initializing InternSync full-stack platform...');

async function checkMongoPort() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1200);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(27017, '127.0.0.1');
  });
}

async function startPlatform() {
  // 1. Ensure MongoDB daemon check (Cross-Platform)
  const isMongoRunning = await checkMongoPort();
  if (isMongoRunning) {
    console.log('[InternSync] MongoDB daemon is running on port 27017.');
  } else {
    console.log('[InternSync] MongoDB not detected on port 27017. Attempting to initialize if environment permits...');
    if (process.platform !== 'win32') {
      try {
        fs.mkdirSync('/data/db', { recursive: true });
        fs.mkdirSync('/var/log/mongodb', { recursive: true });
        execSync('mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /data/db', { stdio: 'ignore' });
        console.log('[InternSync] MongoDB daemon started successfully on port 27017.');
      } catch (e) {
        console.warn('[InternSync] Note: Please ensure MongoDB is running at mongodb://localhost:27017/internsync_db');
      }
    } else {
      console.warn('[InternSync] On Windows, please ensure MongoDB service or Docker container is running on port 27017.');
    }
  }

  // 2. Start backend service on port 8081
  console.log('[InternSync] Starting backend API service on port 8081...');
  let apiProcess;
  const jarPath = path.resolve('target/internsync-backend-1.0.0.jar');

  if (fs.existsSync(jarPath)) {
    console.log('[InternSync] Launching Spring Boot backend from JAR: ' + jarPath);
    apiProcess = spawn('java', ['-jar', jarPath], {
      stdio: 'pipe',
      env: { ...process.env, MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/internsync_db' }
    });
  } else {
    console.log('[InternSync] Launching API server (Express + MongoDB / JSON Store) on port 8081...');
    apiProcess = spawn('npx', ['tsx', 'server.ts'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
  }

  if (apiProcess && apiProcess.stdout) {
    apiProcess.stdout.on('data', (data) => console.log('[API Server]', data.toString().trim()));
  }
  if (apiProcess && apiProcess.stderr) {
    apiProcess.stderr.on('data', (data) => console.error('[API Server Error]', data.toString().trim()));
  }

  // 3. Start Vite Dev Server on port 3000
  console.log('[InternSync] Starting Vite React frontend on port 3000...');
  const viteProcess = spawn('npx', ['vite', '--port=3000', '--host=0.0.0.0'], {
    stdio: 'inherit',
    shell: true
  });

  const cleanup = () => {
    if (apiProcess) apiProcess.kill();
    if (viteProcess) viteProcess.kill();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startPlatform();

