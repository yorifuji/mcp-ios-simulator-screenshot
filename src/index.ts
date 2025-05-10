#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import { IOSSimulatorScreenshotServer } from './mcp/server.js';
import { ScreenshotService } from './core/screenshot-service.js';
import { OutputDirectoryManager } from './services/output-directory-manager.js';
import { DeviceValidator } from './services/device-validator.js';
import { config } from './config.js';

/**
 * Parse command line arguments
 */
function parseCommandLineArgs(): { [key: string]: string } {
  const args = process.argv.slice(2);
  const result: { [key: string]: string } = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
      const key = arg.slice(2);
      result[key] = args[i + 1];
      i++; // Skip the next argument as it's the value
    }
  }
  
  return result;
}

/**
 * Load package info from package.json
 */
function loadPackageInfo(): { name: string; version: string } {
  try {
    // Try to load from package.json in the same directory as the running script
    const packagePath = path.resolve(process.cwd(), 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return {
      name: packageData.name || 'mcp-ios-simulator-screenshot',
      version: packageData.version || '1.0.0'
    };
  } catch (error) {
    // Fallback values if package.json cannot be read
    return {
      name: 'mcp-ios-simulator-screenshot',
      version: '1.0.0'
    };
  }
}

/**
 * Main function
 */
async function main() {
  // Load package info
  const packageInfo = loadPackageInfo();
  
  // Parse command line arguments
  const args = parseCommandLineArgs();
  
  // Initialize output directory manager
  const outputManager = new OutputDirectoryManager(
    config.screenshot.defaultOutputDirName
  );
  
  // Apply command line arguments
  if (args['output-dir']) {
    outputManager.setRootDirectory(args['output-dir'], true);
  }
  
  // Initialize device validator
  const deviceValidator = new DeviceValidator();
  
  // Initialize screenshot service
  const screenshotService = new ScreenshotService(outputManager, deviceValidator);
  
  // Create and run server
  const server = new IOSSimulatorScreenshotServer(
    screenshotService,
    packageInfo
  );
  
  await server.run();
}

// Run the application
main().catch(console.error);