# Setup

## Install dependencies

```bash
npm init playwright@latest
npm install dotenv
```


Run all tests using:

```bash
npx playwright tests
```

Run a specific test using:

```bash
npx playwright test tests/lcms-qual/[testfilename]
```

Example:

```bash
npx playwright test tests/wasims-qual/register.spec.ts
```

Run tests with a browser:

```bash
npx playwright test --headed
```

You can specify which browser with `--project=[browsername]`.

Example:

```bash
npx playwright test tests/lcms-qual/register.spec.ts --headed --project=chromium
```
