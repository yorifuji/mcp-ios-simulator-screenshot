#!/usr/bin/env node
import { ScreenshotService } from './core/screenshot-service.js';
import { OutputDirectoryManager } from './services/output-directory-manager.js';
import { DeviceValidator } from './services/device-validator.js';
import { ScreenshotOptions } from './types.js';
import { config } from './config.js';

/**
 * Parse command line arguments
 */
function parseArgs(): ScreenshotOptions & { outputDir?: string; help?: boolean } {
  const args = process.argv.slice(2);
  const result: ScreenshotOptions & { outputDir?: string; help?: boolean } = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }
    
    if (arg.startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      
      // Map CLI arguments to options
      switch (key) {
        case 'output-filename':
          result.outputFileName = value;
          break;
        case 'output-directory-name':
          result.outputDirectoryName = value;
          break;
        case 'resize':
          result.resize = value.toLowerCase() === 'true';
          break;
        case 'max-width':
          result.maxWidth = parseInt(value, 10);
          break;
        case 'device-id':
          result.deviceId = value;
          break;
        case 'output-dir':
          result.outputDir = value;
          break;
      }
      
      i++; // Skip the value
    }
  }
  
  return result;
}

/**
 * Show help message
 */
function showHelp() {
  console.log('iOS Simulator Screenshot CLI');
  console.log('Usage: ios-screenshot [options]');
  console.log('');
  console.log('Options:');
  console.log('  --output-filename <name>       Output filename (default: timestamp.png)');
  console.log('  --output-directory-name <dir>  Subdirectory name (default: .screenshots)');
  console.log('  --resize <true|false>          Whether to resize the image (default: true)');
  console.log('  --max-width <pixels>           Maximum width for resizing (default: 640)');
  console.log('  --device-id <id>               Simulator device ID (default: booted)');
  console.log('  --output-dir <path>            Root output directory (default: current directory)');
  console.log('  --help, -h                     Show this help message');
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse arguments
    const args = parseArgs();
    
    // Show help if requested
    if (args.help) {
      showHelp();
      process.exit(0);
    }
    
    // Initialize services
    const outputManager = new OutputDirectoryManager(
      args.outputDirectoryName || config.screenshot.defaultOutputDirName
    );
    
    if (args.outputDir) {
      outputManager.setRootDirectory(args.outputDir, true);
    }
    
    const deviceValidator = new DeviceValidator();
    const screenshotService = new ScreenshotService(outputManager, deviceValidator);
    
    // Capture screenshot
    const result = await screenshotService.captureScreenshot({
      outputFileName: args.outputFileName,
      outputDirectoryName: args.outputDirectoryName,
      resize: args.resize,
      maxWidth: args.maxWidth,
      deviceId: args.deviceId
    });
    
    // Display result
    if (result.success) {
      console.log(`Screenshot saved successfully: ${result.filePath}`);
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } else {
      console.error(`Error: ${result.message}`);
      console.error(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (error) {
    const err = error as Error;
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run the application
main();