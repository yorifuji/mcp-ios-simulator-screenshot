import { exec } from 'child_process';
import { promisify } from 'util';
import { DeviceValidationResult, IDeviceValidator } from '../core/interfaces/device.js';

/**
 * Device ID Validator
 * Class for validating iOS simulator device IDs
 */
export class DeviceValidator implements IDeviceValidator {
  private execPromise = promisify(exec);

  /**
   * Check if a device ID is valid
   * @param deviceId Device ID to validate
   * @returns Promise resolving to validation result
   */
  public async validateDeviceId(deviceId: string): Promise<DeviceValidationResult> {
    // 'booted' is always valid
    if (deviceId === 'booted') {
      return { isValid: true };
    }

    try {
      // Basic UUID format check (first security layer)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(deviceId)) {
        return {
          isValid: false,
          errorMessage: `Invalid device ID format: ${deviceId}`,
          errorDetails: { deviceId, reason: 'invalid_format' }
        };
      }

      // Verify against actual device list (second security layer)
      const deviceList = await this.getDeviceList();
      
      // Check if deviceList contains an error
      if (deviceList.error) {
        return {
          isValid: false,
          errorMessage: 'Error validating device ID',
          errorDetails: { deviceId, reason: 'fetch_failed', error: deviceList.error }
        };
      }

      // Check UUID against all devices
      for (const deviceGroup of Object.values(deviceList.devices)) {
        for (const device of deviceGroup as any[]) {
          if (device.udid === deviceId) {
            return { isValid: true };
          }
        }
      }

      return {
        isValid: false,
        errorMessage: `Device ID not found in available devices: ${deviceId}`,
        errorDetails: { deviceId, reason: 'not_found' }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: 'Error validating device ID',
        errorDetails: { deviceId, error }
      };
    }
  }

  /**
   * Check if a device ID is valid (legacy method)
   * @param deviceId Device ID to validate
   * @returns true if valid, false otherwise
   * @deprecated Use validateDeviceId instead
   */
  public async isValidDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.validateDeviceId(deviceId);
    return result.isValid;
  }

  /**
   * Get a list of available device IDs
   * @returns List of available device IDs with metadata
   */
  public async getAvailableDeviceIds(): Promise<{ udid: string; name: string; state: string }[]> {
    try {
      const deviceList = await this.getDeviceList();
      
      // Check if deviceList contains an error
      if (deviceList.error) {
        return [];
      }

      const devices: { udid: string; name: string; state: string }[] = [];

      // Collect information for all devices
      for (const deviceGroup of Object.values(deviceList.devices)) {
        for (const device of deviceGroup as any[]) {
          if (device.udid && device.name && device.state) {
            devices.push({
              udid: device.udid,
              name: device.name,
              state: device.state
            });
          }
        }
      }

      return devices;
    } catch (error) {
      // Return empty array on error
      return [];
    }
  }

  /**
   * Common method to get simulator device list
   * @returns Device list JSON object, or object with error property
   * @private
   */
  private async getDeviceList(): Promise<any> {
    try {
      const { stdout } = await this.execPromise('xcrun simctl list devices --json');
      return JSON.parse(stdout);
    } catch (error) {
      // Return error object for proper error handling
      return { error };
    }
  }
}