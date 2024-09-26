import { expect, test } from '@playwright/test';
import { SbPage } from './sb-page.js';

test.describe('all in one', () => {
  test.describe('stories', () => {
    /** @type import('./sb-page.js').SbPage */
    let sbPage;

    test.beforeEach(async ({ page }) => {
      await page.goto('/?path=/story/components-mycomponent--default-story');
      sbPage = new SbPage(page);
      await sbPage.waitUntilLoaded();
    });

    test('renders story', async ({ page }) => {
      await expect(page).toHaveTitle(/^Components \/ MyComponent - Default Story/);
      expect(await sbPage.storyParent().innerHTML()).toContain('<div>My component works</div>');
    });
  });

  test.describe('addons', () => {
    /** @type import('./sb-page.js').SbPage */
    let sbPage;

    test.beforeEach(async ({ page }) => {
      await page.goto('/?path=/story/components-mycomponent--default-story');
      sbPage = new SbPage(page);
      await sbPage.waitUntilLoaded();
    });

    test('renders core manager toolbar', async () => {
      await expect(sbPage.toolbarItemByTitle('Remount component')).toBeVisible();
      await expect(sbPage.toolbarItemByTitle('Zoom in')).toBeVisible();
      await expect(sbPage.toolbarItemByTitle('Zoom out')).toBeVisible();
      await expect(sbPage.toolbarItemByTitle('Reset zoom')).toBeVisible();
    });

    test('renders @storybook/addon-backgrounds toolbar', async () => {
      await expect(sbPage.toolbarItemByTitle('Change the background of the preview')).toBeVisible();
      await expect(sbPage.toolbarItemByTitle('Apply a grid to the preview')).toBeVisible();
    });

    test('renders @storybook/addon-viewport toolbar', async () => {
      await expect(sbPage.toolbarItemByTitle('Change the size of the preview')).toBeVisible();
    });

    test('renders @storybook/addon-measure toolbar', async () => {
      await expect(sbPage.toolbarItemByTitle('Enable measure')).toBeVisible();
    });

    test('renders @storybook/addon-outline toolbar', async () => {
      await expect(sbPage.toolbarItemByTitle('Apply outlines to the preview')).toBeVisible();
    });

    test('renders @storybook/addon-a11y toolbar', async () => {
      await expect(sbPage.toolbarItemByTitle('Vision simulator')).toBeVisible();
    });

    test('renders @storybook/addon-controls panel', async () => {
      const panelButton = sbPage.panelButtonByText('Controls');
      await panelButton.click();
      await expect(panelButton).toHaveClass(/tabbutton-active/);
    });

    test('renders @storybook/addon-actions panel', async () => {
      const panelButton = sbPage.panelButtonByText('Actions');
      await panelButton.click();
      await expect(panelButton).toHaveClass(/tabbutton-active/);
    });

    test('renders @storybook/addon-interactions panel', async () => {
      const panelButton = sbPage.panelButtonByText('Interactions');
      await panelButton.click();
      await expect(panelButton).toHaveClass(/tabbutton-active/);
    });

    test('renders @storybook/addon-a11y panel', async () => {
      const panelButton = sbPage.panelButtonByText('Accessibility');
      await panelButton.click();
      await expect(panelButton).toHaveClass(/tabbutton-active/);
    });
  });

  test.describe('docs', () => {
    test('renders MDX page', async ({ page }) => {
      await page.goto('/?path=/docs/my-page--docs');
      const sbPage = new SbPage(page);
      await sbPage.waitUntilLoaded();

      await expect(page).toHaveTitle(/^My page - Docs/);
      await expect(sbPage.docParent().locator('h1').nth(0)).toContainText('My page header');
      await expect(
        sbPage.docParent().getByText('This is an MDX-based documentation page.'),
      ).toBeAttached();
      await expect(sbPage.docParent().locator('h2').nth(0)).toContainText('Story inside my page');
      await expect(
        sbPage.docParent().getByText('Below is a story rendered in MDX.'),
      ).toBeAttached();
      expect(await sbPage.docParent().locator('#root-inner').innerHTML()).toContain(
        '<div>My component works</div>',
      );
      await expect(sbPage.docParent().locator('h2').nth(1)).toContainText('MDXFileLoader');
      await expect(
        sbPage.docParent().getByText('Below is a content loaded from a separate Markdown file.'),
      ).toBeAttached();
      await expect(sbPage.docParent().locator('h1').nth(1)).toContainText('My readme');
      await expect(sbPage.docParent().getByText('My readme works.')).toBeAttached();
    });

    test('renders autodocs page', async ({ page }) => {
      await page.goto('/?path=/docs/components-mycomponent--docs');
      const sbPage = new SbPage(page);
      await sbPage.waitUntilLoaded();

      await expect(page).toHaveTitle(/^Components \/ MyComponent - Docs/);
      await expect(sbPage.docParent().locator('h1')).toContainText('MyComponent');
      expect(await sbPage.docParent().locator('#root-inner').innerHTML()).toContain(
        '<div>My component works</div>',
      );
    });
  });
});
