import { ScreenshotOptions, ScreenshotResult } from '../../types.js';

/**
 * Screenshot Service Interface
 * Defines the contract for screenshot service implementations
 */
export interface IScreenshotService {
  /**
   * Capture a screenshot from iOS Simulator
   * @param options Screenshot options
   * @returns Promise resolving to screenshot result
   */
  captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult>;
}