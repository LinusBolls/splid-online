import { test, expect } from "vitest";
import puppeteer from "puppeteer";

test("Home page loads correctly and joins a group", async () => {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto("http://localhost:3000");

  const pageTitle = await page.title();
  expect(pageTitle).toBe("Splid");

  await page.waitForFunction(
    () => window.location.pathname === "/groups/join",
    { timeout: 5000 }
  );
  expect(page.url()).toContain("/groups/join");

  const code = "GBE91HJ3B";

  await page.waitForSelector("input");

  page.focus("input");

  await page.type("input", code);

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  await page.waitForFunction(
    () => document.body.innerText.includes("🧪 Test Group"),
    { timeout: 5000 }
  );

  await browser.close();
});
