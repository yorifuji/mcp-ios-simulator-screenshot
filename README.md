# MCP iOS Simulator Screenshot

Model Context Protocol (MCP)を使用して iOS Simulator のスクリーンショットを取得するサーバーです。

## 概要

このプロジェクトは、MCP プロトコルを実装したサーバーで、iOS Simulator の現在の画面をキャプチャし、指定されたディレクトリに保存する機能を提供します。

## セットアップ

1. **インストール**:

```bash
# グローバルインストール
npm install -g mcp-ios-simulator-screenshot

# または、プロジェクト内にインストール
npm install mcp-ios-simulator-screenshot

# または、リポジトリからクローン
git clone https://github.com/yorifuji/mcp-ios-simulator-screenshot.git
cd mcp-ios-simulator-screenshot
npm install
npm run build
```

2. **MCP クライアントの設定**:

MCP クライアントの設定ファイルに以下のようにサーバー情報を追加します。

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "mcp-ios-simulator-screenshot"
    }
  }
}
```

## 環境変数

このサーバーは環境変数を使用しません。

## コマンドライン引数

このサーバーはコマンドライン引数を使用しません。

## 高度な設定

### インストール方法別の MCP クライアント設定

#### グローバルインストールした場合

```json
{
  "mcpServers": {
    "mcp-ios-simulator-screenshot": {
      "command": "mcp-ios-simulator-screenshot"
    }
  }
}
```

#### ローカルインストールした場合

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

#### リポジトリからクローンした場合

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

#### npx を使用する場合

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

#### Docker を使用する場合

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

## トラブルシューティング

- **スクリーンショットが取得できない場合**:

  - iOS Simulator が起動しているか確認してください
  - Xcode のコマンドラインツールがインストールされているか確認してください
  - `xcrun simctl io booted screenshot`コマンドが直接実行できるか確認してください

- **パーミッションエラーが発生する場合**:
  - 出力ディレクトリに書き込み権限があるか確認してください

## プロジェクト構造

```
./
├── src/
│   ├── index.ts                  # エントリーポイント
│   ├── config.ts                 # 設定
│   ├── types.ts                  # 型定義
│   └── services/
│       └── screenshot-service.ts # スクリーンショットサービス
├── build/                        # ビルド出力
├── .screenshots/                 # デフォルトの出力ディレクトリ
└── package.json                  # プロジェクト設定
```

## ツール

### get_ios_simulator_screenshot

iOS Simulator のスクリーンショットを取得し、指定されたディレクトリに保存します。

#### パラメータ

| パラメータ名     | 型      | 説明                                                 | デフォルト値                    |
| ---------------- | ------- | ---------------------------------------------------- | ------------------------------- |
| output_filename  | string  | 出力ファイル名                                       | simulator\_[タイムスタンプ].png |
| output_directory | string  | 出力ディレクトリ                                     | .screenshots                    |
| resize           | boolean | 画像をリサイズするかどうか                           | true                            |
| max_width        | integer | リサイズ時の最大幅（ピクセル）                       | 640                             |
| device_id        | string  | 特定のシミュレータデバイスを指定（例: `iPhone15,2`） | 起動中のデバイス（`booted`）    |

#### 出力形式

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
  }
}
```

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
