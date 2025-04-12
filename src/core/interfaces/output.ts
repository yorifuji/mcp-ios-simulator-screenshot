/**
 * Output Directory Manager Interface
 * Defines the contract for output directory manager implementations
 */
export interface IOutputDirectoryManager {
  /**
   * Set subdirectory name
   * @param name New subdirectory name
   */
  setSubDirectoryName(name: string): void;
  
  /**
   * Set root directory
   * @param directory New root directory (absolute path)
   * @param useDirectly Whether to use root directory directly (without subdirectory)
   */
  setRootDirectory(directory: string, useDirectly?: boolean): void;
  
  /**
   * Resolve output path with optional filename
   * @param filename Optional filename to append to the path
   * @returns Resolved absolute path
   */
  resolveOutputPath(filename?: string): string;
  
  /**
   * Get full output path
   * @returns Absolute path to the output directory
   */
  getOutputPath(): string;
  
  /**
   * Get root directory
   * @returns Current root directory (absolute path)
   */
  getRootDirectory(): string;
  
  /**
   * Check if root directory is used directly
   * @returns True if root directory is used directly (without subdirectory)
   */
  isUsingRootDirectoryDirectly(): boolean;
}