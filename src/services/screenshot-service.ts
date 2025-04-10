import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import { config } from '../config.js';
import { ScreenshotOptions, ScreenshotResult } from '../types.js';

/**
 * Screenshot Service
 * Provides functionality to capture screenshots from iOS Simulator
 */
export class ScreenshotService {
  /**
   * Promise version of exec
   */
  private execPromise = promisify(exec);

  /**
   * Capture a screenshot
   * @param options Screenshot options
   * @returns Screenshot result
   */
  public async captureScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
    try {
      // Parse options
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFileName = options.outputFileName || `simulator_${timestamp}.png`;
      const outputDirectory = options.outputDirectory || config.screenshot.defaultOutputDir;
      const resize = options.resize !== false; // Default is true
      const maxWidth = options.maxWidth || config.screenshot.defaultMaxWidth;
      const deviceId = options.deviceId;

      // Normalize and validate paths
      const safeOutputDir = this.normalizePath(outputDirectory);
      const safeOutputFileName = this.normalizePath(outputFileName);
      
      // Create output directory
      const outputDirPath = path.resolve(process.cwd(), safeOutputDir);
      await fs.mkdir(outputDirPath, { recursive: true });
      
      // Create output path
      const outputPath = path.resolve(outputDirPath, safeOutputFileName);
      
      // Ensure output path is within current directory
      const basePath = process.cwd();
      if (!outputPath.startsWith(basePath)) {
        throw new Error('Invalid output path: Path traversal detected');
      }
      
      // Create screenshot capture command
      const cmd = config.screenshot.commands.capture(deviceId);
      
      // Capture screenshot
      const { stdout } = await this.execPromise(cmd, {
        encoding: 'buffer',
        maxBuffer: config.screenshot.maxBufferSize
      });
      
      // Save screenshot
      await fs.writeFile(outputPath, stdout);
      
      // Resize if needed
      let finalPath = outputPath;
      if (resize) {
        finalPath = await this.resizeImage(outputPath, maxWidth);
      }
      
      // Get image metadata
      const metadata = await this.getImageMetadata(finalPath);
      
      // Convert to relative path
      const relativePath = path.relative(process.cwd(), finalPath);
      
      // Return result
      return {
        success: true,
        message: 'iOS Simulator screenshot saved successfully',
        filePath: relativePath,
        metadata
      };
    } catch (error) {
      // Return error information
      const err = error as Error & { code?: string; stderr?: string; cmd?: string };
      return {
        success: false,
        message: `Error capturing iOS Simulator screenshot: ${err.message}`,
        error: {
          code: err.code || 'UNKNOWN_ERROR',
          command: err.cmd,
          stderr: err.stderr?.toString()
        }
      };
    }
  }

  /**
   * Resize an image
   * @param inputPath Input file path
   * @param maxWidth Maximum width
   * @returns Path to the resized file
   */
  private async resizeImage(inputPath: string, maxWidth: number): Promise<string> {
    try {
      const outputPath = inputPath;
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Don't resize if image is already smaller than max width
      if (metadata.width && metadata.width <= maxWidth) {
        return inputPath;
      }
      
      // Resize and save to temporary file
      await image
        .resize({ width: maxWidth, withoutEnlargement: true })
        .toFile(outputPath + '.resized');
      
      // Move temporary file to original file
      await fs.rename(outputPath + '.resized', outputPath);
      
      return outputPath;
    } catch (error) {
      console.error(`Error resizing image: ${(error as Error).message}`);
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
      console.error(`Error getting image metadata: ${(error as Error).message}`);
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
   * Normalize a path
   * @param inputPath Input path
   * @returns Normalized path
   */
  private normalizePath(inputPath: string): string {
    // Normalize path
    const normalized = path.normalize(inputPath);
    // Prevent directory traversal attacks
    return normalized.replace(/^(\.\.[\/\\])+/, '');
  }
}