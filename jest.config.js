module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: "test/.*\\.(ts|tsx)$",
  testPathIgnorePatterns: ["/lib/", "/node_modules/"],
};