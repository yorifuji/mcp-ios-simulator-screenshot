import * as path from 'path';
import * as process from 'process';
import { IOutputDirectoryManager } from '../core/interfaces/output.js';

/**
 * Output Directory Manager
 * Simple utility to manage screenshot output directory
 */
export class OutputDirectoryManager implements IOutputDirectoryManager {
  /**
   * Root directory where screenshots are stored (absolute path)
   */
  private rootDirectory: string;

  /**
   * Subdirectory name within the root directory
   */
  private subDirectoryName: string;

  /**
   * Whether to use root directory directly (without subdirectory)
   */
  private useRootDirectoryDirectly: boolean = false;

  /**
   * Constructor
   * @param subDirectoryName Subdirectory name for screenshots (default: .screenshots)
   * @param rootDirectory Root directory (default: current working directory)
   */
  constructor(subDirectoryName: string = '.screenshots', rootDirectory?: string) {
    this.rootDirectory = rootDirectory ? path.resolve(rootDirectory) : process.cwd();
    this.subDirectoryName = this.sanitizeDirectoryName(subDirectoryName);
  }

  /**
   * Get full output path
   * @returns Absolute path to the output directory
   */
  public getOutputPath(): string {
    // If using root directory directly, return it
    if (this.useRootDirectoryDirectly) {
      return this.rootDirectory;
    }
    
    // Otherwise, join root directory with subdirectory name
    return path.join(this.rootDirectory, this.subDirectoryName);
  }

  /**
   * Resolve output path with optional filename
   * @param filename Optional filename to append to the path
   * @returns Resolved absolute path
   */
  public resolveOutputPath(filename?: string): string {
    const outputDir = this.getOutputPath();
    
    // If no filename provided, return just the directory
    if (!filename) {
      return outputDir;
    }
    
    // Sanitize filename and join with output directory
    const safeFilename = this.sanitizeFilename(filename);
    return path.join(outputDir, safeFilename);
  }

  /**
   * Set subdirectory name
   * @param name New subdirectory name
   */
  public setSubDirectoryName(name: string): void {
    this.subDirectoryName = this.sanitizeDirectoryName(name);
  }
  
  /**
   * Set root directory
   * @param directory New root directory (absolute path)
   * @param useDirectly Whether to use root directory directly (without subdirectory)
   */
  public setRootDirectory(directory: string, useDirectly: boolean = false): void {
    this.rootDirectory = path.resolve(directory);
    this.useRootDirectoryDirectly = useDirectly;
  }
  
  /**
   * Get root directory
   * @returns Current root directory (absolute path)
   */
  public getRootDirectory(): string {
    return this.rootDirectory;
  }
  
  /**
   * Check if root directory is used directly
   * @returns True if root directory is used directly (without subdirectory)
   */
  public isUsingRootDirectoryDirectly(): boolean {
    return this.useRootDirectoryDirectly;
  }

  /**
   * Sanitize directory name to prevent path traversal
   * @param name Directory name to sanitize
   * @returns Sanitized directory name
   */
  private sanitizeDirectoryName(name: string): string {
    // Replace path separators with hyphens
    let sanitized = name.replace(/[\/\\]/g, '-');
    
    // Prevent directory traversal by replacing '..' with '-'
    // but preserve single leading dot for hidden directories
    sanitized = sanitized.replace(/\.\./g, '-');
    
    return sanitized;
  }

  /**
   * Sanitize filename to prevent path traversal
   * @param filename Filename to sanitize
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    // Normalize and remove any path traversal attempts
    return path.basename(filename);
  }
}