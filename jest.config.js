export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  // TypeScriptのソースファイルのテストのみを実行
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  // ビルドされたJavaScriptファイルのテストを除外
  testPathIgnorePatterns: ["<rootDir>/build/"],
};
