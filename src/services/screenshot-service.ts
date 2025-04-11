import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import { config } from '../config.js';
import { ScreenshotOptions, ScreenshotResult } from '../types.js';
import { OutputDirectoryManager } from './output-directory-manager.js';
import { DeviceValidator } from './device-validator.js';

/**
 * Screenshot Service
 * Provides functionality to capture screenshots from iOS Simulator
 */
export class ScreenshotService {
  private execPromise = promisify(exec);
  private deviceValidator: DeviceValidator;
  
  /**
   * Constructor
   * @param outputManager Output directory manager
   */
  constructor(private outputManager: OutputDirectoryManager) {
    this.deviceValidator = new DeviceValidator();
  }

  /**
   * Capture a screenshot
   * @param options Screenshot options
   * @returns Screenshot result
   */
  public async captureScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
    try {
      // Prepare file paths
      const { outputPath } = this.prepareFilePaths(options);
      
      // Validate device ID (only if specified)
      if (options.deviceId && options.deviceId !== 'booted') {
        const isValid = await this.deviceValidator.isValidDeviceId(options.deviceId);
        if (!isValid) {
          throw new Error(`Invalid device ID: ${options.deviceId}. Please use a valid device ID or 'booted'.`);
        }
      }

      // Capture screenshot from simulator
      const imageBuffer = await this.captureSimulatorScreenshot(options.deviceId);

      // Save the image
      await fs.writeFile(outputPath, imageBuffer);

      // Process the image (resize if needed)
      const finalPath = options.resize !== false
        ? await this.resizeImage(outputPath, options.maxWidth || config.screenshot.defaultMaxWidth)
        : outputPath;

      // Get image metadata
      const metadata = await this.getImageMetadata(finalPath);

      // Get command line arguments
      const outputDir = this.outputManager.isUsingRootDirectoryDirectly() ?
        this.outputManager.getRootDirectory() : undefined;

      return {
        success: true,
        message: 'iOS Simulator screenshot saved successfully',
        filePath: finalPath,
        metadata,
        serverConfig: {
          commandLineArgs: {
            outputDir
          }
        }
      };
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  /**
   * Prepare file paths for screenshot
   */
  private prepareFilePaths(options: ScreenshotOptions): { outputPath: string, outputFileName: string } {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFileName = options.outputFileName || `simulator_${timestamp}.png`;

    // Always reset to default directory name first
    this.outputManager.setSubDirectoryName(config.screenshot.defaultOutputDirName);

    // If subdirectory is specified, override with the specified value
    if (options.outputDirectoryName) {
      this.outputManager.setSubDirectoryName(options.outputDirectoryName);
    }

    // Get output path with filename
    const outputPath = this.outputManager.resolveOutputPath(outputFileName);

    // Get output directory (without filename)
    const outputDirectory = path.dirname(outputPath);

    // Ensure output directory exists
    fs.mkdir(outputDirectory, { recursive: true }).catch(() => {});

    return {
      outputPath,
      outputFileName
    };
  }

  /**
   * Capture screenshot from iOS Simulator
   */
  private async captureSimulatorScreenshot(deviceId?: string): Promise<Buffer> {
    const cmd = config.screenshot.commands.capture(deviceId);
    
    const { stdout } = await this.execPromise(cmd, {
      encoding: 'buffer',
      maxBuffer: config.screenshot.maxBufferSize
    });
    
    return stdout;
  }

  /**
   * Resize an image
   * @param inputPath Input file path
   * @param maxWidth Maximum width
   * @returns Path to the resized file
   */
  private async resizeImage(inputPath: string, maxWidth: number): Promise<string> {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Don't resize if image is already smaller than max width
      if (!metadata.width || metadata.width <= maxWidth) {
        return inputPath;
      }

      // Resize directly to the same file
      await image
        .resize({ width: maxWidth, withoutEnlargement: true })
        .toBuffer()
        .then(data => fs.writeFile(inputPath, data));

      return inputPath;
    } catch (error) {
      // Return original image if resizing fails
      return inputPath;
    }
  }

  /**
   * Get image metadata
   * @param imagePath Image file path
   * @returns Image metadata
   */
  private async getImageMetadata(imagePath: string): Promise<ScreenshotResult['metadata']> {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await fs.stat(imagePath);
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: stats.size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        width: 0,
        height: 0,
        format: 'unknown',
        size: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create error result object
   */
  private createErrorResult(error: unknown): ScreenshotResult {
    const err = error as Error & { code?: string; stderr?: string; cmd?: string };

    // Improved error message
    let message = `Error capturing iOS Simulator screenshot: ${err.message}`;

    // Add help message for device ID related errors
    if (err.message && err.message.includes('Invalid device ID')) {
      message += ' You can use the special value "booted" to target the currently booted simulator, or specify a valid device UUID.';

      // Asynchronously fetch and display available devices (not included in error response)
      this.deviceValidator.getAvailableDeviceIds().then(devices => {
        if (devices.length > 0) {
          console.error('Available devices:');
          devices.forEach(device => {
            console.error(`- ${device.name} (${device.udid}) - ${device.state}`);
          });
        }
      }).catch(() => {});
    }

    return {
      success: false,
      message,
      error: {
        code: err.code || 'UNKNOWN_ERROR',
        command: err.cmd,
        stderr: err.stderr?.toString()
      }
    };
  }
}