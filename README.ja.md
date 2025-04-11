# MCP iOS Simulator Screenshot

Model Context Protocol (MCP)を使用して iOS Simulator のスクリーンショットを取得するサーバーです。

## 概要

このプロジェクトは、MCP プロトコルを実装したサーバーで、iOS Simulator の現在の画面をキャプチャし、指定されたディレクトリに保存する機能を提供します。

## セットアップ

### Cline and Roo Code

Cline と Roo Code の基本的な形式は以下の通りです：

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

リポジトリをクローンした場合は、以下の設定を使用できます：

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

Cursor, Claude Desktop では `--output-dir` と出力先を指定する必要があります；

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

## MCP ツールパラメータ

### get_screenshot

iOS Simulator のスクリーンショットを取得し、指定されたディレクトリに保存します。

| パラメータ名          | 型      | 説明                                     | デフォルト値                 |
| --------------------- | ------- | ---------------------------------------- | ---------------------------- |
| output_filename       | string  | 出力ファイル名                           | timestamp.png                |
| output_directory_name | string  | スクリーンショット用のサブディレクトリ名 | .screenshots                 |
| resize                | boolean | 画像をリサイズするかどうか               | true                         |
| max_width             | integer | リサイズ時の最大幅（ピクセル）           | 640                          |
| device_id             | string  | 特定のシミュレータデバイスを指定         | 起動中のデバイス（`booted`） |

## 出力形式

成功時：

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
      "outputDir": "/Users/username/Desktop" // --output-dir が指定された場合のみ含まれる
    }
  }
}
```

注意：`serverConfig.commandLineArgs.outputDir` フィールドは、サーバー起動時に `--output-dir` パラメータが指定された場合のみレスポンスに含まれます。

エラー時：

```json
{
  "success": false,
  "message": "Error capturing iOS Simulator screenshot: [エラーメッセージ]",
  "error": {
    "code": "ENOENT",
    "command": "xcrun simctl io booted screenshot --type=png -",
    "stderr": "No matching devices found."
  }
}
```

## トラブルシューティング

- **スクリーンショットが取得できない場合**:

  - iOS Simulator が起動しているか確認してください
  - Xcode のコマンドラインツールがインストールされているか確認してください
  - `xcrun simctl io booted screenshot`コマンドが直接実行できるか確認してください

- **パーミッションエラーが発生する場合**:
  - 出力ディレクトリに書き込み権限があるか確認してください

## 必要条件

- Node.js 16.0.0 以上
- macOS（iOS Simulator が必要）
- Xcode Command Line Tools

## 技術スタック

- TypeScript
- Node.js
- MCP SDK (@modelcontextprotocol/sdk)

## ライセンス

MIT

## 他の言語

- [English](README.md)
