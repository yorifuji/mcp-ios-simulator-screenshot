// @ts-nocheck
import { OutputDirectoryManager } from '../../services/output-directory-manager.js';
import * as path from 'path';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

describe('OutputDirectoryManager', () => {
  let manager: OutputDirectoryManager;
  
  beforeEach(() => {
    manager = new OutputDirectoryManager('.screenshots', '/test/root');
  });
  
  test('getOutputPath should return correct path', () => {
    expect(manager.getOutputPath()).toBe(path.join('/test/root', '.screenshots'));
  });
  
  test('resolveOutputPath should return correct path with filename', () => {
    expect(manager.resolveOutputPath('test.png')).toBe(path.join('/test/root', '.screenshots', 'test.png'));
  });
  
  test('setSubDirectoryName should update subdirectory name', () => {
    manager.setSubDirectoryName('new-dir');
    expect(manager.getOutputPath()).toBe(path.join('/test/root', 'new-dir'));
  });
  
  test('setRootDirectory should update root directory', () => {
    manager.setRootDirectory('/new/root');
    expect(manager.getRootDirectory()).toBe('/new/root');
  });
  
  test('isUsingRootDirectoryDirectly should return correct value', () => {
    expect(manager.isUsingRootDirectoryDirectly()).toBe(false);
    manager.setRootDirectory('/new/root', true);
    expect(manager.isUsingRootDirectoryDirectly()).toBe(true);
  });
  
  test('sanitizeDirectoryName should prevent path traversal', () => {
    manager.setSubDirectoryName('../dangerous');
    expect(manager.getOutputPath()).not.toContain('..');
  });
  
  test('resolveOutputPath should sanitize filename', () => {
    const path = manager.resolveOutputPath('../dangerous.png');
    expect(path).not.toContain('..');
    expect(path).toContain('dangerous.png');
  });
  
  test('resolveOutputPath should return directory path when no filename is provided', () => {
    expect(manager.resolveOutputPath()).toBe(manager.getOutputPath());
  });
});