export class Preview {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  previewIframe() {
    return this.page.frameLocator('#storybook-preview-iframe');
  }

  storyParent() {
    return this.previewIframe().locator('#storybook-root > #root-inner');
  }
}
