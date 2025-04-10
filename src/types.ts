/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  /**
   * Output filename
   * If not specified, a name with timestamp will be generated
   */
  outputFileName?: string;
  
  /**
   * Output directory
   * If not specified, default value will be used
   */
  outputDirectory?: string;
  
  /**
   * Whether to resize the image
   * Default is true
   */
  resize?: boolean;
  
  /**
   * Maximum width for resizing (pixels)
   * Default is 640px
   */
  maxWidth?: number;
  
  /**
   * Specify a simulator device
   * If not specified, the booted device will be used
   */
  deviceId?: string;
}

/**
 * Screenshot result
 */
export interface ScreenshotResult {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Message
   */
  message: string;
  
  /**
   * File path (only when successful)
   */
  filePath?: string;
  
  /**
   * Error information (only when failed)
   */
  error?: {
    /**
     * Error code
     */
    code: string;
    
    /**
     * Command
     */
    command?: string;
    
    /**
     * Standard error output
     */
    stderr?: string;
  };
  
  /**
   * Metadata (only when successful)
   */
  metadata?: {
    /**
     * Image width
     */
    width: number;
    
    /**
     * Image height
     */
    height: number;
    
    /**
     * Image format
     */
    format: string;
    
    /**
     * File size (bytes)
     */
    size: number;
    
    /**
     * Timestamp
     */
    timestamp: string;
  };
}

/**
 * MCP tool response
 */
export interface McpToolResponse {
  /**
   * Content
   */
  content: Array<{
    /**
     * Content type
     */
    type: 'text';
    
    /**
     * Text
     */
    text: string;
  }>;
  
  /**
   * Whether it's an error
   */
  isError?: boolean;
}