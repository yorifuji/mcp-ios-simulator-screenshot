/**
 * Application settings
 */
export const config = {
  /**
   * Screenshot related settings
   */
  screenshot: {
    /**
     * Default output directory
     */
    defaultOutputDir: '.screenshots',
    
    /**
     * Default maximum width for resizing (pixels)
     */
    defaultMaxWidth: 640,
    
    /**
     * Maximum buffer size for command execution (bytes)
     */
    maxBufferSize: 50 * 1024 * 1024, // 50MB
    
    /**
     * Command definitions
     */
    commands: {
      /**
       * Screenshot capture command
       * @param deviceId Optional device ID
       * @returns Command string
       */
      capture: (deviceId?: string): string =>
        deviceId
          ? `xcrun simctl io ${deviceId} screenshot --type=png -`
          : 'xcrun simctl io booted screenshot --type=png -',
    }
  },
  
  /**
   * Server related settings
   */
  server: {
    /**
     * Server name
     */
    name: 'mcp-ios-simulator-screenshot',
    
    /**
     * Version
     */
    version: '1.0.0'
  }
};