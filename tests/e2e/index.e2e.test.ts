import { test, expect } from "vitest";
import puppeteer, { Page } from "puppeteer";

async function setShadcnSelectValue(selector: string, value: string) {
  return `document.querySelector('${selector}').value = '${value}';`;
}
async function setShadcnDatePickerValue(selector: string, value: string) {}

async function createNewExpense(page: Page, title: string, amount: number) {
  await page.click('[data-testid="new-expense"]');

  await page.waitForSelector('[data-testid="create-new-expense"]');

  expect(await page.$$('[role="alert"]')).toHaveLength(0);

  await page.click('[data-testid="create-new-expense"]');

  expect(await page.$$('[role="alert"]')).toHaveLength(3);

  await page.type("#new-expense__title", title);

  await page.type("#new-expense__amount", amount.toString());

  await page.click("[role=dialog] [data-testid='new-expense__by--trigger']");

  const byOptions = await page.$$(
    "[data-testid^='expense-payer-select-option--']"
  );
  await byOptions[0].click();

  const profiteerOptions = await page.$$(
    "[role=dialog] [data-testid^='expense-for-select-option--']"
  );
  // add three profiteers
  (await profiteerOptions[0].$("button[role='checkbox']"))!.click();
  (await profiteerOptions[1].$("button[role='checkbox']"))!.click();
  (await profiteerOptions[2].$("button[role='checkbox']"))!.click();

  // set amount of first profiteer to 0.40€
  (await profiteerOptions[0].$("#entry-profiteer--amount"))!.type("40");

  // remove third profiteer again
  (await profiteerOptions[2].$("button[role='checkbox']"))!.click();

  await page.click('[data-testid="create-new-expense"]');

  await page.waitForFunction(
    () => document.querySelector("[role='dialog']") == null,
    { timeout: 5000 }
  );
}

test("Home page loads correctly and joins a group", async () => {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto("http://localhost:3000");

  expect(await page.title()).toBe("Splid");

  await page.waitForFunction(
    () => window.location.pathname === "/groups/join",
    { timeout: 5000 }
  );
  expect(page.url()).toContain("/groups/join");

  const code = "GBE91HJ3B";

  await page.waitForSelector('[data-testid="join-group-input"]');

  await page.type('[data-testid="join-group-input"]', code);

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  await page.waitForFunction(
    () => document.body.innerText.includes("🧪 Test Group"),
    { timeout: 5000 }
  );

  await createNewExpense(page, "🤖 Test Expense", 42069);

  await createNewExpense(page, "🤖 Test Expense", 42069);

  await createNewExpense(page, "🤖 Test Expense", 42069);

  const [_, row1, row2, row3] = await page.$$("tr");

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  // (await row1.$('[data-testid="open-entry-actions"]'))!.click();

  // await new Promise((resolve) => setTimeout(resolve, 5000));

  // await page.click('[data-testid="delete-entry"]');

  await page.click('[data-testid="select-all-rows"]');

  await page.waitForSelector('[data-testid="delete-selected-entries"]');

  await page.click('[data-testid="delete-selected-entries"]');

  // todo: validate sharing

  // expect(row.title).toBe("🤖 Test Expense");
  // expect(row.by).toBe("dick");
  // expect(row.amount).toBe("42.69€");
  // expect(row.category).toBe("None");

  // todo: create expense with custom category
  // todo: create expense with default category
  // todo: create expense with date

  // todo: single delete one expense, bulk delete the other

  await browser.close();
});
