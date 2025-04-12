// @ts-nocheck
import { ScreenshotService } from '../../core/screenshot-service.js';
import { OutputDirectoryManager } from '../../services/output-directory-manager.js';
import { DeviceValidator } from '../../services/device-validator.js';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// モック
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ size: 12345 })
  }
}));

jest.mock('sharp', () => {
  const mockSharp = jest.fn().mockReturnValue({
    metadata: jest.fn().mockResolvedValue({ width: 1000, height: 2000, format: 'png' }),
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('test'))
  });
  return mockSharp;
});

describe('ScreenshotService', () => {
  let service: ScreenshotService;
  let outputManager: OutputDirectoryManager;
  let deviceValidator: DeviceValidator;
  
  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();
    
    // モックの実装
    (exec as jest.Mock).mockImplementation((cmd: string, options: any, callback: (error: Error | null, result: { stdout: Buffer, stderr: string }) => void) => {
      if (callback) {
        callback(null, { stdout: Buffer.from('test'), stderr: '' });
      }
      return {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      };
    });
    
    // サービスの初期化
    outputManager = new OutputDirectoryManager();
    jest.spyOn(outputManager, 'resolveOutputPath').mockReturnValue('/test/path/screenshot.png');
    
    deviceValidator = new DeviceValidator();
    jest.spyOn(deviceValidator, 'validateDeviceId').mockResolvedValue({ isValid: true });
    jest.spyOn(deviceValidator, 'isValidDeviceId').mockResolvedValue(true);
    
    service = new ScreenshotService(outputManager, deviceValidator);
  });
  
  test('captureScreenshot should return success result', async () => {
    const result = await service.captureScreenshot();
    
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/test/path/screenshot.png');
    expect(exec).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });
  
  test('captureScreenshot should handle invalid device ID', async () => {
    jest.spyOn(deviceValidator, 'validateDeviceId').mockResolvedValue({
      isValid: false,
      errorMessage: 'Invalid device ID format: invalid-id',
      errorDetails: { deviceId: 'invalid-id', reason: 'invalid_format' }
    });
    
    const result = await service.captureScreenshot({ deviceId: 'invalid-id' });
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid device ID');
  });
  
  test('captureScreenshot should handle exec errors', async () => {
    (exec as jest.Mock).mockImplementation((cmd, options, callback) => {
      if (callback) {
        callback(new Error('Command failed'), { stdout: '', stderr: 'Error output' });
      }
      return {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() }
      };
    });
    
    const result = await service.captureScreenshot();
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('Error capturing');
  });
  
  test('captureScreenshot should use custom output filename', async () => {
    await service.captureScreenshot({ outputFileName: 'custom.png' });
    
    expect(outputManager.resolveOutputPath).toHaveBeenCalledWith('custom.png');
  });
  
  test('captureScreenshot should use custom output directory name', async () => {
    const setSubDirectoryNameSpy = jest.spyOn(outputManager, 'setSubDirectoryName');
    
    await service.captureScreenshot({ outputDirectoryName: 'custom-dir' });
    
    expect(setSubDirectoryNameSpy).toHaveBeenCalledWith('custom-dir');
  });
});