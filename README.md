# MCP iOS Simulator Screenshot

A server that captures screenshots from iOS Simulator using the Model Context Protocol (MCP).

## Overview

This project implements an MCP protocol server that captures the current screen of the iOS Simulator and saves it to a specified directory.

## Setup

1. **Installation**:

```bash
# Global installation
npm install -g mcp-ios-simulator-screenshot

# Or, install in your project
npm install mcp-ios-simulator-screenshot

# Or, clone from repository
git clone https://github.com/yorifuji/mcp-ios-simulator-screenshot.git
cd mcp-ios-simulator-screenshot
npm install
npm run build
```

2. **MCP Client Configuration**:

Add the server information to your MCP client configuration file as follows:

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "mcp-ios-simulator-screenshot"
    }
  }
}
```

## Environment Variables

This server does not use environment variables.

## Command Line Arguments

This server does not use command line arguments.

## Advanced Configuration

### MCP Client Configuration by Installation Method

#### When Installed Globally

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "mcp-ios-simulator-screenshot"
    }
  }
}
```

#### When Installed Locally

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "node",
      "args": [
        "/path/to/node_modules/mcp-ios-simulator-screenshot/build/index.js"
      ]
    }
  }
}
```

#### When Cloned from Repository

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

#### When Using npx

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "npx",
      "args": ["mcp-ios-simulator-screenshot"]
    }
  }
}
```

#### When Using Docker

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "docker",
      "args": ["run", "-i", "mcp-ios-simulator-screenshot"]
    }
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

## Project Structure

```
./
├── src/
│   ├── index.ts                  # Entry point
│   ├── config.ts                 # Configuration
│   ├── types.ts                  # Type definitions
│   └── services/
│       └── screenshot-service.ts # Screenshot service
├── build/                        # Build output
├── .screenshots/                 # Default output directory
└── package.json                  # Project configuration
```

## Tools

### get_ios_simulator_screenshot

Captures a screenshot from the iOS Simulator and saves it to the specified directory.

#### Parameters

| Parameter Name   | Type    | Description                                     | Default Value              |
| ---------------- | ------- | ----------------------------------------------- | -------------------------- |
| output_filename  | string  | Output filename                                 | simulator\_[timestamp].png |
| output_directory | string  | Output directory                                | .screenshots               |
| resize           | boolean | Whether to resize the image                     | true                       |
| max_width        | integer | Maximum width for resizing (pixels)             | 640                        |
| device_id        | string  | Specify a simulator device (e.g., `iPhone15,2`) | Booted device (`booted`)   |

#### Output Format

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
  }
}
```

On error:

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
