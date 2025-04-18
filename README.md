# MCP iOS Simulator Screenshot

A server that captures screenshots from iOS Simulator using the Model Context Protocol (MCP).

## Overview

This project implements an MCP protocol server that captures the current screen of the iOS Simulator and saves it to a specified directory.

## Setup

### Cline and Roo Code

For Cline and Roo Code, the basic format is:

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "npx",
      "args": ["-y", "mcp-ios-simulator-screenshot"]
    }
  }
}
```

If you clone the repository, you can use the following configuration:

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "node",
      "args": ["/path/to/mcp-ios-simulator-screenshot/build/index.js"]
    }
  }
}
```

### Cursor, Claude Desktop

For Cursor and Claude Desktop, you need to specify the `--output-dir` and the output directory:

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "npx",
      "args": [
        "mcp-ios-simulator-screenshot",
        "--output-dir",
        "/path/to/your/output/directory"
      ]
    }
  }
}
```

## MCP Tool Parameters

### get_screenshot

Captures a screenshot from iOS Simulator and saves it to the specified directory.

| Parameter             | Type    | Description                                           | Default Value |
| --------------------- | ------- | ----------------------------------------------------- | ------------- |
| output_filename       | string  | Output filename                                       | timestamp.png |
| output_directory_name | string  | Subdirectory name for screenshots                     | .screenshots  |
| resize                | boolean | Whether to resize the image to approximately VGA size | true          |
| max_width             | integer | Maximum width for resizing (pixels)                   | 640           |
| device_id             | string  | Specify a simulator device                            | booted device |

## Output Format

On success:

```json
{
  "success": true,
  "message": "iOS Simulator screenshot saved successfully",
  "filePath": ".screenshots/simulator_2025-04-10T16-51-16-755Z.png",
  "metadata": {
    "width": 1170,
    "height": 2532,
    "format": "png",
    "size": 382946,
    "timestamp": "2025-04-10T16:51:16.755Z"
  },
  "serverConfig": {
    "commandLineArgs": {
      "outputDir": "/Users/username/Desktop" // Only included when --output-dir is specified
    }
  }
}
```

Note: The `serverConfig.commandLineArgs.outputDir` field is only included in the response when the `--output-dir` parameter is specified when starting the server.

```json
{
  "success": false,
  "message": "Error capturing iOS Simulator screenshot: [error message]",
  "error": {
    "code": "ENOENT",
    "command": "xcrun simctl io booted screenshot --type=png -",
    "stderr": "No matching devices found."
  }
}
```

## Troubleshooting

- **If you cannot capture screenshots**:

  - Check if iOS Simulator is running
  - Check if Xcode Command Line Tools are installed
  - Check if the `xcrun simctl io booted screenshot` command can be executed directly

- **If permission errors occur**:
  - Check if you have write permissions for the output directory

## Requirements

- Node.js 16.0.0 or higher
- macOS (iOS Simulator required)
- Xcode Command Line Tools

## Technology Stack

- TypeScript
- Node.js
- MCP SDK (@modelcontextprotocol/sdk)

## License

MIT

## Other Languages

- [日本語](README.ja.md)
