export class SbPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async waitUntilLoaded() {
    await this.page.context().addInitScript(() => {
      const storeState = {
        layout: {
          showToolbar: true,
          showNav: true,
          showPanel: true,
        },
      };
      window.sessionStorage.setItem('@storybook/manager/store', JSON.stringify(storeState));
    }, {});
    await Promise.all([
      this.previewIframe().locator('.sb-preparing-docs').waitFor({ state: 'hidden' }),
      this.previewIframe().locator('.sb-preparing-story').waitFor({ state: 'hidden' }),
    ]);
    await Promise.race([
      this.storyParent().waitFor({ state: 'visible' }),
      this.docParent().waitFor({ state: 'visible' }),
    ]);
  }

  previewIframe() {
    return this.page.frameLocator('#storybook-preview-iframe');
  }

  storyParent() {
    return this.previewIframe().locator('#storybook-root > #root-inner');
  }

  docParent() {
    return this.previewIframe().locator('#storybook-docs');
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
