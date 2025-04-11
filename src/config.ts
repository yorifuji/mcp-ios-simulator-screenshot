/**
 * Application configuration
 */

/**
 * Escape function for command injection prevention
 * @param input String to escape
 * @returns Escaped string
 */
function escapeShellArg(input: string): string {
  // Remove dangerous characters (shell special characters)
  return input.replace(/[;&|`$(){}[\]<>"'\\]/g, '');
}

export const config = {
  /**
   * Screenshot settings
   */
  screenshot: {
    // Default output directory name for screenshots
    defaultOutputDirName: '.screenshots',
    
    // Default maximum width for resizing (pixels)
    defaultMaxWidth: 640,
    
    // Maximum buffer size for command execution (bytes)
    maxBufferSize: 50 * 1024 * 1024, // 50MB
    
    // Command definitions
    commands: {
      // Screenshot capture command
      capture: (deviceId?: string): string => {
        // Use 'booted' if deviceId is not specified
        const id = deviceId || 'booted';

        // Apply escape processing for command injection prevention
        const safeId = escapeShellArg(id);

        return `xcrun simctl io ${safeId} screenshot --type=png -`;
      }
    }
  }
};
