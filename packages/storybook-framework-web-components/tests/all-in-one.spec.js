import { expect, test } from '@playwright/test';
import { Manager } from './manager.js';
import { Preview } from './preview.js';

/** @type import('./manager.js').Manager */
let manager;
/** @type import('./preview.js').Preview */
let preview;

test.describe('all in one', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    manager = new Manager(page);
    preview = new Preview(page);
  });

  test('renders test story', async ({ page }) => {
    await expect(page).toHaveTitle(/^Test \/ Stories - Test Story/);
    expect(await preview.storyParent().innerHTML()).toContain('<div>Test Story works</div>');
  });

  test('renders core manager toolbar', async () => {
    await expect(manager.toolbarItemByTitle('Remount component')).toBeVisible();
    await expect(manager.toolbarItemByTitle('Zoom in')).toBeVisible();
    await expect(manager.toolbarItemByTitle('Zoom out')).toBeVisible();
    await expect(manager.toolbarItemByTitle('Reset zoom')).toBeVisible();
  });

  test('renders @storybook/addon-backgrounds toolbar', async () => {
    await expect(manager.toolbarItemByTitle('Change the background of the preview')).toBeVisible();
    await expect(manager.toolbarItemByTitle('Apply a grid to the preview')).toBeVisible();
  });

  test('renders @storybook/addon-viewport toolbar', async () => {
    await expect(manager.toolbarItemByTitle('Change the size of the preview')).toBeVisible();
  });

  test('renders @storybook/addon-measure toolbar', async () => {
    await expect(manager.toolbarItemByTitle('Enable measure')).toBeVisible();
  });

  test('renders @storybook/addon-outline toolbar', async () => {
    await expect(manager.toolbarItemByTitle('Apply outlines to the preview')).toBeVisible();
  });

  test('renders @storybook/addon-controls panel', async () => {
    const panelButton = manager.panelButtonByText('Controls');
    await panelButton.click();
    await expect(panelButton).toHaveClass(/tabbutton-active/);
  });

  test('renders @storybook/addon-actions panel', async () => {
    const panelButton = manager.panelButtonByText('Actions');
    await panelButton.click();
    await expect(panelButton).toHaveClass(/tabbutton-active/);
  });

  test('renders @storybook/addon-interactions panel', async () => {
    const panelButton = manager.panelButtonByText('Interactions');
    await panelButton.click();
    await expect(panelButton).toHaveClass(/tabbutton-active/);
  });
});
