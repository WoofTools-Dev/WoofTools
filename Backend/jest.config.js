module.exports = { preset: "ts-jest", testEnvironment: "node", roots: ["<rootDir>/__tests__"], testMatch: ["**/*.test.ts"], transform: { "^.+\\.tsx?$": "ts-jest" } };
