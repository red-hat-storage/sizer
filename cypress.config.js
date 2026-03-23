const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:9005",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
