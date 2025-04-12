import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config.js';
import { ScreenshotOptions, ScreenshotResult } from '../types.js';
import { IScreenshotService } from '../core/interfaces/screenshot.js';

/**
 * iOS Simulator Screenshot Server
 * A server that uses MCP protocol to capture screenshots from iOS Simulator
 */
export class IOSSimulatorScreenshotServer {
  private server: Server;

  /**
   * Constructor
   * @param screenshotService Screenshot service
   * @param packageInfo Package information
   */
  constructor(
    private screenshotService: IScreenshotService,
    private packageInfo: { name: string; version: string }
  ) {
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