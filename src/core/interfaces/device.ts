/**
 * Device validation result
 */
export interface DeviceValidationResult {
  /**
   * Whether the device ID is valid
   */
  isValid: boolean;
  
  /**
   * Error message (if any)
   */
  errorMessage?: string;
  
  /**
   * Error details (if any)
   */
  errorDetails?: any;
}

/**
 * Device Validator Interface
 * Defines the contract for device validator implementations
 */
export interface IDeviceValidator {
  /**
   * Check if a device ID is valid
   * @param deviceId Device ID to validate
   * @returns Promise resolving to validation result
   */
  validateDeviceId(deviceId: string): Promise<DeviceValidationResult>;
  
  /**
   * Check if a device ID is valid (legacy method)
   * @param deviceId Device ID to validate
   * @returns true if valid, false otherwise
   * @deprecated Use validateDeviceId instead
   */
  isValidDeviceId(deviceId: string): Promise<boolean>;
  
  /**
   * Get a list of available device IDs
   * @returns Promise resolving to list of available device IDs with metadata
   */
  getAvailableDeviceIds(): Promise<Array<{ udid: string; name: string; state: string }>>;
}