import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * Device ID Validator
 * Class for validating iOS simulator device IDs
 */
export class DeviceValidator {
  private execPromise = promisify(exec);

  /**
   * Check if a device ID is valid
   * @param deviceId Device ID to validate
   * @returns true if valid, false otherwise
   */
  public async isValidDeviceId(deviceId: string): Promise<boolean> {
    // 'booted' is always valid
    if (deviceId === 'booted') {
      return true;
    }

    try {
      // Basic UUID format check (first security layer)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(deviceId)) {
        console.error(`Invalid device ID format: ${deviceId}`);
        return false;
      }

      // Verify against actual device list (second security layer)
      const deviceList = await this.getDeviceList();
      if (!deviceList) {
        return false;
      }

      // Check UUID against all devices
      for (const deviceGroup of Object.values(deviceList.devices)) {
        for (const device of deviceGroup as any[]) {
          if (device.udid === deviceId) {
            return true;
          }
        }
      }

      console.error(`Device ID not found in available devices: ${deviceId}`);
      return false;
    } catch (error) {
      console.error('Error validating device ID:', error);
      // If an error occurs, fail safely by returning invalid
      return false;
    }
  }

  /**
   * Get a list of available device IDs
   * @returns List of available device IDs with metadata
   */
  public async getAvailableDeviceIds(): Promise<{ udid: string; name: string; state: string }[]> {
    try {
      const deviceList = await this.getDeviceList();
      if (!deviceList) {
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
      console.error('Error getting available device IDs:', error);
      return [];
    }
  }

  /**
   * Common method to get simulator device list
   * @returns Device list JSON object, or null on error
   * @private
   */
  private async getDeviceList(): Promise<any | null> {
    try {
      const { stdout } = await this.execPromise('xcrun simctl list devices --json');
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error fetching device list:', error);
      return null;
    }
  }
}