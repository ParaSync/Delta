import { test, expect } from "@playwright/test";

test("logged out user is redirected to homepage", async ({ page }) => {
  await page.goto("http://localhost:4173/dashboard");

  // `/` is the login page
  await page.waitForURL("**/login");
  await expect(page).toHaveURL(/\/login$/);
});

test("nonexistent email should not log in", async ({ page }) => {
  await page.goto("http://localhost:4173");

  // Enter in user details
  const email = page.getByPlaceholder("Enter your email");
  await email.waitFor({ state: "visible" });
  await email.fill("neuron_never_register_this_email@example.com");

  await page.getByPlaceholder("Enter your password").fill("testdummy");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByText("Login failed").nth(0)).toBeVisible();
});
