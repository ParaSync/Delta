import { test, expect } from "@playwright/test";

test("logged out user is redirected to homepage", async ({ page }) => {
  await page.goto("http://localhost:4173/dashboard");

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

test("incorrect password should not be logged in", async ({ page }) => {
  await page.goto("http://localhost:4173");

  const email = page.getByRole("textbox", { name: "Email address" });
  await email.waitFor({ state: "visible" });
  await email.fill("neuron_delta_user@gmail.com");

  const password = page.getByPlaceholder("Enter your password");
  await password.waitFor({ state: "visible" });
  await password.fill("whyisarchcraftsohard");

  const signInButton = page.getByRole("button", { name: "Sign in" });
  await signInButton.waitFor({ state: "visible" });
  await signInButton.click();

  const failedError = page.getByText("Invalid email or password").nth(0);
  await expect(failedError).toBeVisible();
});

test("shows toast error when fields are empty", async ({ page }) => {
  await page.goto("http://localhost:4173/login");

  await page.getByRole("button", { name: /sign in/i }).click();

  const toastMessage = page.locator(
    'div:text("Please fill in both email and password")',
  );
  await expect(toastMessage).toBeVisible({ timeout: 5000 });
});

test("redirect to dashboard on successful login", async ({ page }) => {
  await page.goto("http://localhost:4173/login");

  const email = page.getByRole("textbox", { name: "Email address" });
  await email.waitFor({ state: "visible" });
  await email.fill("neuron_delta_user@gmail.com");

  const password = page.getByPlaceholder("Enter your password");
  await password.waitFor({ state: "visible" });
  await password.fill("testdummy");

  const signInButton = page.getByRole("button", { name: "Sign in" });
  await signInButton.waitFor({ state: "visible" });
  await signInButton.click();

  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
});
