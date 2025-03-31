module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    coverageProvider: "v8",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  };
  