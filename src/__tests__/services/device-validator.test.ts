// @ts-nocheck
import { DeviceValidator } from '../../services/device-validator.js';
import { exec } from 'child_process';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('DeviceValidator', () => {
  let validator: DeviceValidator;
  
  beforeEach(() => {
    jest.clearAllMocks();
    validator = new DeviceValidator();
  });
  
  // Tests for the new validateDeviceId method
  test('validateDeviceId should return valid result for "booted"', async () => {
    const result = await validator.validateDeviceId('booted');
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });
  
  test('validateDeviceId should return error for invalid format', async () => {
    const result = await validator.validateDeviceId('invalid-format');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Invalid device ID format');
    expect(result.errorDetails.reason).toBe('invalid_format');
  });
  
  // Tests for the legacy isValidDeviceId method
  test('isValidDeviceId should return true for "booted"', async () => {
    const result = await validator.isValidDeviceId('booted');
    expect(result).toBe(true);
  });
  
  test('isValidDeviceId should validate UUID format', async () => {
    const result = await validator.isValidDeviceId('invalid-format');
    expect(result).toBe(false);
  });
  
  test('isValidDeviceId should check against device list', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(null, {
          stdout: JSON.stringify({
            devices: {
              'com.apple.CoreSimulator.SimRuntime.iOS-15-0': [
                {
                  udid: '12345678-1234-1234-1234-123456789012',
                  name: 'iPhone 13',
                  state: 'Booted'
                }
              ]
            }
          })
        });
      }
    });
    
    const result = await validator.isValidDeviceId('12345678-1234-1234-1234-123456789012');
    expect(result).toBe(true);
  });
  
  test('isValidDeviceId should return false if device is not found', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(null, {
          stdout: JSON.stringify({
            devices: {
              'com.apple.CoreSimulator.SimRuntime.iOS-15-0': [
                {
                  udid: '12345678-1234-1234-1234-123456789012',
                  name: 'iPhone 13',
                  state: 'Booted'
                }
              ]
            }
          })
        });
      }
    });
    
    const result = await validator.isValidDeviceId('87654321-4321-4321-4321-210987654321');
    expect(result).toBe(false);
  });
  
  test('validateDeviceId should return error if device is not found', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(null, {
          stdout: JSON.stringify({
            devices: {
              'com.apple.CoreSimulator.SimRuntime.iOS-15-0': [
                {
                  udid: '12345678-1234-1234-1234-123456789012',
                  name: 'iPhone 13',
                  state: 'Booted'
                }
              ]
            }
          })
        });
      }
    });
    
    const result = await validator.validateDeviceId('87654321-4321-4321-4321-210987654321');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Device ID not found');
    expect(result.errorDetails.reason).toBe('not_found');
  });
  
  test('validateDeviceId should handle exec errors', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(new Error('Command failed'), { stdout: '', stderr: 'Error output' });
      }
    });
    
    const result = await validator.validateDeviceId('12345678-1234-1234-1234-123456789012');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Error validating device ID');
    expect(result.errorDetails.error).toBeDefined();
  });
  
  test('isValidDeviceId should handle exec errors', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(new Error('Command failed'), { stdout: '', stderr: 'Error output' });
      }
    });
    
    const result = await validator.isValidDeviceId('12345678-1234-1234-1234-123456789012');
    expect(result).toBe(false);
  });
  
  test('getAvailableDeviceIds should return device list', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(null, {
          stdout: JSON.stringify({
            devices: {
              'com.apple.CoreSimulator.SimRuntime.iOS-15-0': [
                {
                  udid: '12345678-1234-1234-1234-123456789012',
                  name: 'iPhone 13',
                  state: 'Booted'
                }
              ]
            }
          })
        });
      }
    });
    
    const devices = await validator.getAvailableDeviceIds();
    expect(devices).toHaveLength(1);
    expect(devices[0].udid).toBe('12345678-1234-1234-1234-123456789012');
    expect(devices[0].name).toBe('iPhone 13');
    expect(devices[0].state).toBe('Booted');
  });
  
  test('getAvailableDeviceIds should handle exec errors', async () => {
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      if (callback) {
        callback(new Error('Command failed'), { stdout: '', stderr: 'Error output' });
      }
    });
    
    const devices = await validator.getAvailableDeviceIds();
    expect(devices).toEqual([]);
  });
});