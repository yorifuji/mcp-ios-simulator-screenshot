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

/**
 * iOS Simulator Screenshot Server
 * A server that uses MCP protocol to capture screenshots from iOS Simulator
 */
class IOSSimulatorScreenshotServer {
  /**
   * MCP server
   */
  private server: Server;
  
  /**
   * Screenshot service
   */
  private screenshotService: ScreenshotService;

  /**
   * Constructor
   */
  constructor() {
    this.screenshotService = new ScreenshotService();
    
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );
    
    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up resource handlers
   */
  private setupResourceHandlers(): void {
    // Provide resource list (returns empty list)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return { resources: [] };
    });
  }

  /**
   * Set up tool handlers
   */
  private setupToolHandlers(): void {
    // Provide tool list
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_ios_simulator_screenshot',
          description: 'Capture a screenshot from iOS Simulator',
          inputSchema: {
            type: 'object',
            properties: {
              output_filename: {
                type: 'string',
                description: 'Output filename (if not specified, timestamp.png will be used)'
              },
              output_directory: {
                type: 'string',
                description: 'Output directory (if not specified, .screenshots will be used)',
                default: '.screenshots'
              },
              resize: {
                type: 'boolean',
                description: 'Whether to resize the image to approximately VGA size (640x480)',
                default: true
              },
              max_width: {
                type: 'integer',
                description: 'Maximum width for resizing (pixels)',
                default: 640
              },
              device_id: {
                type: 'string',
                description: 'Specify a simulator device (if not specified, the booted device will be used)'
              }
            },
            required: []
          }
        }
      ]
    }));

    // Tool invocation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // When capturing iOS Simulator screenshot
      if (request.params.name === 'get_ios_simulator_screenshot') {
        try {
          // Convert parameters
          const args = request.params.arguments as Record<string, unknown> || {};
          const options: ScreenshotOptions = {
            outputFileName: args.output_filename as string,
            outputDirectory: args.output_directory as string,
            resize: args.resize as boolean,
            maxWidth: args.max_width as number,
            deviceId: args.device_id as string
          };
          
          // Capture screenshot
          const result = await this.screenshotService.captureScreenshot(options);
          
          // Convert result to MCP response
          return this.createMcpResponse(result);
        } catch (error) {
          // Handle unexpected errors
          const err = error as Error;
          console.error('Unexpected error:', err);
          
          return this.createMcpResponse({
            success: false,
            message: `Unexpected error: ${err.message}`,
            error: {
              code: 'UNEXPECTED_ERROR'
            }
          });
        }
      } else {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    });
  }

  /**
   * Convert screenshot result to MCP response
   * @param result Screenshot result
   * @returns MCP response
   */
  private createMcpResponse(result: ScreenshotResult): any {
    if (result.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: true
      };
    }
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

// サーバーのインスタンスを作成して起動
const server = new IOSSimulatorScreenshotServer();
server.run().catch(console.error);