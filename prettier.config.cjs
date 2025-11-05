/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100, // Keep lines readable but not too long
  tabWidth: 2, // Standard 2-space indentation
  useTabs: false, // Use spaces, not tabs
  semi: true, // Always end statements with semicolons
  singleQuote: true, // Prefer single quotes
  trailingComma: "es5", // Trailing commas where valid in ES5 (objects, arrays, etc.)
  bracketSpacing: true, // Add spaces inside object literals
  bracketSameLine: false, // Keep closing brackets on their own line
  arrowParens: "always", // Always include parentheses in arrow functions
  proseWrap: "preserve", // Don't wrap markdown text
  endOfLine: "lf", // Use LF for consistency (especially in Docker/Linux)
  embeddedLanguageFormatting: "auto", // Format embedded code blocks when possible
};
