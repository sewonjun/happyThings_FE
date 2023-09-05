module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "^.+\\.svg$": "jest-transform-stub",
  },
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["./jest.setup.cjs"],
  transformIgnorePatterns: ["/node_modules/"],
};
