/**
 * MockupShot Comprehensive Test Suite
 * Tests all features of the device mockup generator at http://localhost:8004
 *
 * Usage: node test-mockupshot.mjs
 * Exit code: 0 = all pass, 1 = any fail
 */

import { chromium } from '/home/wu/.hermes/hermes-agent/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:8004';
const SCREENSHOT_DIR = '/home/wu/projects/mockupshot/test-screenshots';
const TEST_IMAGE = '/home/wu/projects/mockupshot/test-screenshot.png';

// Test results tracking
let passed = 0;
let failed = 0;
const failures = [];

function pass(name) {
  passed++;
  console.log(`  PASS: ${name}`);
}

function fail(name, detail = '') {
  failed++;
  failures.push({ name, detail });
  console.log(`  FAIL: ${name}${detail ? ' -- ' + detail : ''}`);
}

function assert(condition, name, detail = '') {
  if (condition) {
    pass(name);
  } else {
    fail(name, detail);
  }
}

async function screenshot(page, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function waitForCanvasRender(page, timeout = 5000) {
  try {
    await page.waitForFunction(() => {
      const canvas = document.getElementById('previewCanvas');
      if (!canvas) return false;
      return canvas.width > 0 && canvas.height > 0;
    }, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('  MockupShot - Comprehensive Test Suite');
  console.log('  ' + new Date().toISOString());
  console.log('='.repeat(70) + '\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  try {
    // ====================================================================
    // TEST 1: Page loads correctly
    // ====================================================================
    console.log('--- Test 1: Page Load & Basic Structure ---');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await screenshot(page, '01-page-load');

    const title = await page.title();
    assert(title.includes('MockupShot'), 'Page title contains MockupShot', `Got: "${title}"`);

    const headerText = await page.textContent('h1');
    assert(headerText.includes('MockupShot'), 'Header shows MockupShot', `Got: "${headerText}"`);

    const navLinks = await page.$$eval('.nav-link', els => els.map(e => e.textContent.trim()));
    assert(navLinks.includes('Features'), 'Nav has Features link', `Got: ${JSON.stringify(navLinks)}`);
    assert(navLinks.includes('How It Works'), 'Nav has How It Works link', `Got: ${JSON.stringify(navLinks)}`);
    assert(navLinks.includes('FAQ'), 'Nav has FAQ link', `Got: ${JSON.stringify(navLinks)}`);

    const heroTitle = await page.textContent('.hero-title');
    assert(heroTitle.length > 0, 'Hero section title is present', `Got: "${heroTitle}"`);

    const uploadArea = await page.$('#uploadArea');
    assert(!!uploadArea, 'Upload area exists');

    const canvas = await page.$('#previewCanvas');
    assert(!!canvas, 'Preview canvas exists');

    const downloadBtn = await page.$('#downloadBtn');
    assert(!!downloadBtn, 'Download button exists');
    const isDisabled = await page.$eval('#downloadBtn', el => el.disabled);
    assert(isDisabled, 'Download button is initially disabled');

    await screenshot(page, '01-page-structure');

    // ====================================================================
    // TEST 2: Device category tabs
    // ====================================================================
    console.log('\n--- Test 2: Device Category Tabs ---');

    const tabs = await page.$$eval('.device-tab', els => els.map(e => ({
      text: e.textContent.trim(),
      category: e.dataset.category
    })));

    const expectedTabs = ['Browsers', 'Phones', 'Tablets', 'Laptops', 'Desktop'];
    for (const expected of expectedTabs) {
      const found = tabs.some(t => t.text === expected);
      assert(found, `Tab "${expected}" exists`, `Got: ${JSON.stringify(tabs)}`);
    }

    // Verify switching between all tabs
    for (const tab of ['phones', 'tablets', 'laptops', 'desktop', 'browsers']) {
      await page.click(`.device-tab[data-category="${tab}"]`);
      await page.waitForTimeout(300);

      const activeTab = await page.$eval(`.device-tab[data-category="${tab}"]`, el => el.classList.contains('active'));
      assert(activeTab, `Switched to "${tab}" tab`);

      const categoryVisible = await page.$eval(`.device-category[data-category="${tab}"]`, el => el.classList.contains('active'));
      assert(categoryVisible, `"${tab}" category panel is visible`);
    }

    await screenshot(page, '02-tab-switching');

    // ====================================================================
    // TEST 3: Upload test screenshot
    // ====================================================================
    console.log('\n--- Test 3: Upload Screenshot ---');

    await page.click('.device-tab[data-category="browsers"]');
    await page.waitForTimeout(300);

    const fileInput = await page.$('#imageInput');
    await fileInput.setInputFiles(TEST_IMAGE);
    await page.waitForTimeout(1500);

    const previewRendered = await waitForCanvasRender(page, 5000);
    assert(previewRendered, 'Canvas renders with non-zero dimensions after upload');

    const canvasDims = await page.$eval('#previewCanvas', c => ({ w: c.width, h: c.height }));
    assert(canvasDims.w > 0 && canvasDims.h > 0, `Canvas dimensions: ${canvasDims.w}x${canvasDims.h}`);

    const placeholderHidden = await page.$eval('.preview-placeholder', el => el.style.display === 'none');
    assert(placeholderHidden, 'Preview placeholder is hidden after upload');

    await screenshot(page, '03-after-upload');

    // ====================================================================
    // TEST 4: Browser frames (Chrome, Safari, Firefox, Edge)
    // ====================================================================
    console.log('\n--- Test 4: Browser Frames ---');

    const browsers = [
      { name: 'Chrome', selector: '.browser-btn[data-device="chrome"]' },
      { name: 'Safari', selector: '.browser-btn[data-device="safari"]' },
      { name: 'Firefox', selector: '.browser-btn[data-device="firefox"]' },
      { name: 'Edge', selector: '.browser-btn[data-device="edge"]' }
    ];

    for (const browserItem of browsers) {
      await page.click(browserItem.selector);
      await page.waitForTimeout(1000);

      const rendered = await waitForCanvasRender(page, 3000);
      assert(rendered, `Switch to "${browserItem.name}" frame -- canvas renders`);

      const isActive = await page.$eval(browserItem.selector, el => el.classList.contains('active'));
      assert(isActive, `"${browserItem.name}" button is active`);

      await screenshot(page, `04-browser-${browserItem.name.toLowerCase()}`);
    }

    // ====================================================================
    // TEST 5: Phone frames (iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max)
    // ====================================================================
    console.log('\n--- Test 5: Phone Frames ---');

    await page.click('.device-tab[data-category="phones"]');
    await page.waitForTimeout(500);

    const phones = [
      { name: 'iPhone 17', selector: '.phone-btn[data-device="iphone-17"]' },
      { name: 'iPhone 17 Pro', selector: '.phone-btn[data-device="iphone-17-pro"]' },
      { name: 'iPhone 17 Pro Max', selector: '.phone-btn[data-device="iphone-17-pro-max"]' }
    ];

    for (const phone of phones) {
      await page.click(phone.selector);
      await page.waitForTimeout(1000);

      const rendered = await waitForCanvasRender(page, 5000);
      assert(rendered, `Switch to "${phone.name}" -- canvas renders`);

      const isActive = await page.$eval(phone.selector, el => el.classList.contains('active'));
      assert(isActive, `"${phone.name}" button is active`);

      await screenshot(page, `05-phone-${phone.name.toLowerCase().replace(/\s+/g, '-')}`);
    }

    // ====================================================================
    // TEST 6: Tablets (iPad Silver)
    // ====================================================================
    console.log('\n--- Test 6: Tablets ---');

    await page.click('.device-tab[data-category="tablets"]');
    await page.waitForTimeout(500);

    const tabletBtn = '.tablet-btn[data-device="ipad-silver"]';
    await page.click(tabletBtn);
    await page.waitForTimeout(1000);

    const tabletRendered = await waitForCanvasRender(page, 5000);
    assert(tabletRendered, 'Switch to "iPad Silver" -- canvas renders');

    const tabletActive = await page.$eval(tabletBtn, el => el.classList.contains('active'));
    assert(tabletActive, '"iPad Silver" button is active');

    await screenshot(page, '06-tablet-ipad-silver');

    // ====================================================================
    // TEST 7: Laptops (MacBook Pro 16")
    // ====================================================================
    console.log('\n--- Test 7: Laptops ---');

    await page.click('.device-tab[data-category="laptops"]');
    await page.waitForTimeout(500);

    const laptopBtn = '.laptop-btn[data-device="macbook-pro-16"]';
    await page.click(laptopBtn);
    await page.waitForTimeout(1000);

    const laptopRendered = await waitForCanvasRender(page, 5000);
    assert(laptopRendered, 'Switch to "MacBook Pro 16"" -- canvas renders');

    const laptopActive = await page.$eval(laptopBtn, el => el.classList.contains('active'));
    assert(laptopActive, '"MacBook Pro 16"" button is active');

    await screenshot(page, '07-laptop-macbook-pro-16');

    // ====================================================================
    // TEST 8: Desktop (iMac 24")
    // ====================================================================
    console.log('\n--- Test 8: Desktop ---');

    await page.click('.device-tab[data-category="desktop"]');
    await page.waitForTimeout(500);

    const desktopBtn = '.desktop-btn[data-device="imac-24"]';
    await page.click(desktopBtn);
    await page.waitForTimeout(1000);

    const desktopRendered = await waitForCanvasRender(page, 5000);
    assert(desktopRendered, 'Switch to "iMac 24"" -- canvas renders');

    const desktopActive = await page.$eval(desktopBtn, el => el.classList.contains('active'));
    assert(desktopActive, '"iMac 24"" button is active');

    await screenshot(page, '08-desktop-imac-24');

    // ====================================================================
    // TEST 9: Background styles (all 5)
    // ====================================================================
    console.log('\n--- Test 9: Background Styles ---');

    const backgrounds = [
      { name: 'Transparent', selector: '.bg-btn[data-bg="transparent"]' },
      { name: 'Gradient Purple', selector: '.bg-btn[data-bg="gradient"]' },
      { name: 'Gradient Blue', selector: '.bg-btn[data-bg="blue"]' },
      { name: 'Gradient Green', selector: '.bg-btn[data-bg="green"]' },
      { name: 'Solid Gray', selector: '.bg-btn[data-bg="solid"]' }
    ];

    for (const bg of backgrounds) {
      await page.click(bg.selector);
      await page.waitForTimeout(600);

      const rendered = await waitForCanvasRender(page, 3000);
      assert(rendered, `Background "${bg.name}" -- canvas renders`);

      const isActive = await page.$eval(bg.selector, el => el.classList.contains('active'));
      assert(isActive, `Background "${bg.name}" button is active`);

      await screenshot(page, `09-bg-${bg.name.toLowerCase().replace(/\s+/g, '-')}`);
    }

    // ====================================================================
    // TEST 10: Show shadow checkbox toggle
    // ====================================================================
    console.log('\n--- Test 10: Show Shadow Toggle ---');

    // Switch to desktop for shadow test
    await page.click('.device-tab[data-category="desktop"]');
    await page.waitForTimeout(500);
    await page.click('.desktop-btn[data-device="imac-24"]');
    await page.waitForTimeout(1000);
    await waitForCanvasRender(page, 5000);

    const shadowChecked = await page.$eval('#showShadow', el => el.checked);
    assert(shadowChecked, 'Show shadow checkbox is checked by default');

    await page.click('#showShadow');
    await page.waitForTimeout(800);
    const shadowUnchecked = await page.$eval('#showShadow', el => !el.checked);
    assert(shadowUnchecked, 'Show shadow unchecked after toggle');
    await screenshot(page, '10-shadow-off');

    await page.click('#showShadow');
    await page.waitForTimeout(800);
    const shadowRechecked = await page.$eval('#showShadow', el => el.checked);
    assert(shadowRechecked, 'Show shadow re-checked after second toggle');

    // ====================================================================
    // TEST 11: Show frame checkbox toggle
    // ====================================================================
    console.log('\n--- Test 11: Show Frame Toggle ---');

    const frameContainerVisible = await page.$eval('#showFrameContainer', el => el.style.display !== 'none');
    assert(frameContainerVisible, 'Show frame container is visible for desktop');

    const frameChecked = await page.$eval('#showFrame', el => el.checked);
    assert(frameChecked, 'Show frame checkbox is checked by default');

    await page.click('#showFrame');
    await page.waitForTimeout(1000);
    const frameUnchecked = await page.$eval('#showFrame', el => !el.checked);
    assert(frameUnchecked, 'Show frame unchecked after toggle');
    await screenshot(page, '11-frame-off');

    await page.click('#showFrame');
    await page.waitForTimeout(1000);
    const frameRechecked = await page.$eval('#showFrame', el => el.checked);
    assert(frameRechecked, 'Show frame re-checked after second toggle');

    // ====================================================================
    // TEST 12: Scale selector
    // ====================================================================
    console.log('\n--- Test 12: Scale Selector ---');

    await page.selectOption('#scaleSelect', '1');
    await page.waitForTimeout(800);
    const scale1Rendered = await waitForCanvasRender(page, 3000);
    assert(scale1Rendered, 'Scale 1x -- canvas renders');
    await screenshot(page, '12-scale-1x');

    await page.selectOption('#scaleSelect', '2');
    await page.waitForTimeout(800);
    const scale2Rendered = await waitForCanvasRender(page, 3000);
    assert(scale2Rendered, 'Scale 2x -- canvas renders');
    await screenshot(page, '12-scale-2x');

    await page.selectOption('#scaleSelect', '3');
    await page.waitForTimeout(800);
    const scale3Rendered = await waitForCanvasRender(page, 3000);
    assert(scale3Rendered, 'Scale 3x -- canvas renders');
    await screenshot(page, '12-scale-3x');

    // Reset to 2x
    await page.selectOption('#scaleSelect', '2');
    await page.waitForTimeout(800);
    await waitForCanvasRender(page, 3000);

    // ====================================================================
    // TEST 13: Download button enables after upload
    // ====================================================================
    console.log('\n--- Test 13: Download Button ---');

    const downloadEnabled = await page.$eval('#downloadBtn', el => !el.disabled);
    assert(downloadEnabled, 'Download button is enabled after upload');

    // ====================================================================
    // TEST 14: Canvas renders with non-zero dimensions
    // ====================================================================
    console.log('\n--- Test 14: Canvas Dimensions ---');

    const finalDims = await page.$eval('#previewCanvas', c => ({ w: c.width, h: c.height }));
    assert(finalDims.w > 0 && finalDims.h > 0, `Canvas has non-zero dimensions: ${finalDims.w}x${finalDims.h}`);

    const canvasVisible = await page.$eval('#previewCanvas', c => c.style.display !== 'none');
    assert(canvasVisible, 'Canvas is visible');

    // ====================================================================
    // TEST 15: Sub-pages load correctly
    // ====================================================================
    console.log('\n--- Test 15: Sub-pages ---');

    const subPages = [
      { slug: '/chrome-browser-frame/', title: 'Chrome Browser Frame' },
      { slug: '/safari-browser-frame/', title: 'Safari Browser Frame' },
      { slug: '/firefox-browser-frame/', title: 'Firefox Browser Frame' },
      { slug: '/edge-browser-frame/', title: 'Edge Browser Frame' },
      { slug: '/macbook-screenshot-frame/', title: 'MacBook Screenshot Frame' }
    ];

    for (const sub of subPages) {
      try {
        const response = await page.goto(`${BASE_URL}${sub.slug}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        assert(response.ok(), `Sub-page ${sub.slug} loads (status ${response.status()})`);

        const pageTitle = await page.title();
        assert(
          pageTitle.toLowerCase().includes(sub.title.toLowerCase()) ||
          pageTitle.toLowerCase().includes('mockupshot'),
          `Sub-page ${sub.slug} has correct title`,
          `Got: "${pageTitle}"`
        );

        const subName = sub.slug.replace(/\//g, '-').replace(/^-|-$/g, '');
        await screenshot(page, `15-${subName}`);

        const bodyText = await page.textContent('body');
        assert(bodyText.length > 200, `Sub-page ${sub.slug} has substantial content (${bodyText.length} chars)`);

      } catch (err) {
        fail(`Sub-page ${sub.slug}`, err.message);
      }
    }

    // ====================================================================
    // TEST 16: Footer links
    // ====================================================================
    console.log('\n--- Test 16: Footer Links ---');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });

    const footerLinks = await page.$$eval('.footer-links a', els => els.map(e => ({
      text: e.textContent.trim(),
      href: e.getAttribute('href')
    })));

    const expectedFooterLinks = [
      { text: 'Chrome Frame', href: 'chrome-browser-frame/' },
      { text: 'Safari Frame', href: 'safari-browser-frame/' },
      { text: 'Firefox Frame', href: 'firefox-browser-frame/' },
      { text: 'Edge Frame', href: 'edge-browser-frame/' },
      { text: 'MacBook Frame', href: 'macbook-screenshot-frame/' },
      { text: 'Contact Us', href: 'mailto:contact@mockupshot.com' }
    ];

    for (const expected of expectedFooterLinks) {
      const found = footerLinks.some(f => f.text === expected.text);
      assert(found, `Footer link "${expected.text}" exists`, `Got: ${JSON.stringify(footerLinks)}`);
    }

    await screenshot(page, '16-footer-links');

  } catch (err) {
    console.error(`\n  UNEXPECTED ERROR: ${err.message}`);
    console.error(err.stack);
    fail('Test suite runtime error', err.message);
  } finally {
    await browser.close();

    const total = passed + failed;
    console.log('\n' + '='.repeat(70));
    console.log('  TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`  Total:  ${total}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);

    if (failures.length > 0) {
      console.log('\n  FAILURES:');
      failures.forEach((f, i) => {
        console.log(`    ${i + 1}. ${f.name}${f.detail ? ': ' + f.detail : ''}`);
      });
    }

    console.log('\n  Screenshots saved to:', SCREENSHOT_DIR);
    console.log('='.repeat(70) + '\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
