#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { config } from './config.js';
import { ScreenshotOptions, ScreenshotResult } from './types.js';
import { ScreenshotService } from './services/screenshot-service.js';
import { OutputDirectoryManager } from './services/output-directory-manager.js';
import * as path from 'path';
import * as fs from 'fs';

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
 * iOS Simulator Screenshot Server
 * A server that uses MCP protocol to capture screenshots from iOS Simulator
 */
class IOSSimulatorScreenshotServer {
  private server: Server;
  private screenshotService: ScreenshotService;
  private outputManager: OutputDirectoryManager;

  /**
   * Constructor
   */
  // Package info loaded from package.json
  private packageInfo: { name: string; version: string };

  constructor() {
    // Load package info
    this.packageInfo = this.loadPackageInfo();
    
    // Initialize output directory manager with default subdirectory name
    this.outputManager = new OutputDirectoryManager(
      config.screenshot.defaultOutputDirName
    );
    
    // Apply command line arguments
    this.applyCommandLineArgs();
    
    // Initialize screenshot service
    this.screenshotService = new ScreenshotService(this.outputManager);
    
    // Initialize MCP server
    this.server = new Server(
      {
        name: this.packageInfo.name,
        version: this.packageInfo.version,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );
    
    // Set up handlers
    this.setupHandlers();
    
    // Set up error handling
    this.setupErrorHandling();
  }

  /**
   * Load package info from package.json
   */
  private loadPackageInfo(): { name: string; version: string } {
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
   * Apply command line arguments
   */
  private applyCommandLineArgs(): void {
    const args = parseCommandLineArgs();
    
    // Handle output directory argument
    if (args['output-dir']) {
      // Set the root directory to the specified output directory
      // and use it directly (without subdirectory)
      this.outputManager.setRootDirectory(args['output-dir'], true);
    }
  }

  /**
   * Set up all handlers
   */
  private setupHandlers(): void {
    // Resource handlers (empty list)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return { resources: [] };
    });

    // Tool list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [this.getScreenshotToolDefinition()]
    }));

    // Tool invocation handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'get_screenshot') {
        return await this.handleScreenshotRequest(request);
      } else {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    });
  }

  /**
   * Get screenshot tool definition
   */
  private getScreenshotToolDefinition() {
    return {
      name: 'get_screenshot',
      description: 'Capture a screenshot from iOS Simulator',
      inputSchema: {
        type: 'object',
        properties: {
          output_filename: {
            type: 'string',
            description: 'Output filename (if not specified, timestamp.png will be used)'
          },
          output_directory_name: {
            type: 'string',
            description: 'Subdirectory name for screenshots (if not specified, .screenshots will be used)',
            default: config.screenshot.defaultOutputDirName
          },
          resize: {
            type: 'boolean',
            description: 'Whether to resize the image to approximately VGA size',
            default: true
          },
          max_width: {
            type: 'integer',
            description: 'Maximum width for resizing (pixels)',
            default: config.screenshot.defaultMaxWidth
          },
          device_id: {
            type: 'string',
            description: 'Specify a simulator device (if not specified, the booted device will be used)'
          }
        },
        required: []
      }
    };
  }

  /**
   * Handle screenshot request
   */
  private async handleScreenshotRequest(request: any): Promise<any> {
    try {
      const args = request.params.arguments as Record<string, unknown> || {};
      
      // Map API parameters to internal options
      const options: ScreenshotOptions = {
        outputFileName: args.output_filename as string,
        outputDirectoryName: args.output_directory_name as string,
        resize: args.resize as boolean,
        maxWidth: args.max_width as number,
        deviceId: args.device_id as string
      };
      
      // Capture screenshot
      const result = await this.screenshotService.captureScreenshot(options);
      
      // Return formatted response
      return this.createMcpResponse(result);
    } catch (error) {
      const err = error as Error;
      return this.createMcpResponse({
        success: false,
        message: `Error: ${err.message}`,
        error: { code: 'UNEXPECTED_ERROR' }
      });
    }
  }

  /**
   * Set up error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Create MCP response from screenshot result
   */
  private createMcpResponse(result: ScreenshotResult): any {
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      isError: !result.success
    };
  }

  /**
   * Start the server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP iOS Simulator Screenshot server running on stdio');
  }
}

// Create and run server
const server = new IOSSimulatorScreenshotServer();
server.run().catch(console.error);