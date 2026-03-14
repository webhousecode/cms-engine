import { test, expect } from "@playwright/test";
import { SignJWT } from "jose";

const JWT_SECRET = "b6ff0b5caa2ee4308470dfb3668b3835ef164174f87c176a41b8ea5e5b450dcd";

test.beforeEach(async ({ context }) => {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ sub: "test", email: "test@test.com", name: "Test" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
  await context.addCookies([{ name: "cms-session", value: token, domain: "localhost", path: "/" }]);
});

test("screenshot agent detail page", async ({ page }) => {
  await page.goto("/admin/agents");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/screenshots/agents-list.png", fullPage: true });

  const agentLink = page.locator("a[href*='/admin/agents/']").first();
  await expect(agentLink).toBeVisible({ timeout: 10_000 });
  await agentLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/agent-detail.png", fullPage: true });

  // Log the page content for debugging
  const bodyText = await page.locator("body").innerText();
  console.log("PAGE TEXT:", bodyText.substring(0, 2000));
});
