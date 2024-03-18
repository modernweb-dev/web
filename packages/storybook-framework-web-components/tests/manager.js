export class Manager {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * @param {string} title
   */
  toolbarItemByTitle(title) {
    return this.page.locator(`[title="${title}"]`);
  }

  /**
   * @param {string} text
   */
  panelButtonByText(text) {
    return this.page
      .locator('[role="tablist"] button')
      .filter({ hasText: new RegExp(`^${text}$`) });
  }
}
