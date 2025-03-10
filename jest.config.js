module.exports = {
    roots: ["<rootDir>/__test__"], // Ensure Jest looks in __test__ folder
    testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(test).js"],
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  };
  