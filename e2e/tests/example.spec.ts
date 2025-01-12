import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ByteStash/);
});

test("shows login page if there is no session", async ({ page }) => {
  await page.goto("/");

  const username = "test-1";

  await page.getByPlaceholder("Username").click();
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Username").press("Tab");
  await page.getByPlaceholder("Password").fill("12345678");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page.getByRole("button", { name: username })).toBeVisible();

  await page.goto("http://localhost:5000/s/b3a45723fb1cc1e7b94981ab28155d9c");

  await expect(page.getByText("public note sample 1")).toBeVisible();
});

test.describe("given logged in user", async () => {
  const username = "test-1";

  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Username").click();
    await page.getByPlaceholder("Username").fill(username);
    await page.getByPlaceholder("Username").press("Tab");
    await page.getByPlaceholder("Password").fill("12345678");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page.getByRole("button", { name: username })).toBeVisible();
  });

  test("they should be able to create and delete a new note", async ({
    page,
  }) => {
    await page.getByLabel("New Snippet").click();

    await page.getByPlaceholder("Enter the title of the").click();
    await page.getByPlaceholder("Enter the title of the").fill("sample title");
    await page.getByPlaceholder("Enter the title of the").press("Tab");

    await page.getByPlaceholder("Write a short description of").click();
    await page
      .getByPlaceholder("Write a short description of")
      .fill("sample description");
    await page.getByPlaceholder("Write a short description of").press("Tab");

    await page.getByPlaceholder("Type a category and press").click();
    await page.getByPlaceholder("Type a category and press").fill("test-cat");
    await page.getByPlaceholder("Type a category and press").press("Enter");

    await page.locator(".view-line").click();
    await page.getByLabel("Editor content;Press Alt+F1").fill("hey hey ");

    await page.getByRole("button", { name: "Add Snippet" }).click();

    await page
      .getByText("sample titleplaintextsample")
      .filter({ has: page.getByRole("heading", { name: "sample title" }) })
      .getByLabel("Delete snippet")
      .click();

    await page
      .getByText(
        'Confirm DeletionAre you sure you want to delete "sample title"? This action'
      )
      .filter({ has: page.getByText("Confirm Deletion") })
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(
      page.getByText(
        'Confirm DeletionAre you sure you want to delete "sample title"? This action'
      )
    ).not.toBeVisible();
  });

  test.describe("when they open a note", () => {
    test("they should be able to view the note and see the other fragment previews", async ({
      page,
    }) => {
      await expect(page.getByText("fragment2")).not.toBeVisible();
      await page.getByRole("heading", { name: "plz no delete me" }).click();
      await expect(page.getByText("fragment2")).toBeVisible();
    });
  });
});
