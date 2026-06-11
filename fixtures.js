const { test: base, expect } = require('@playwright/test');

exports.test = base.test.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: undefined
    });
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  }
});

exports.expect = expect;