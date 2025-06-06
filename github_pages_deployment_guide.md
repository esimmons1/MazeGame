# GitHub Pages Deployment Guide for Maze Game

## Introduction

This guide provides comprehensive instructions for deploying the Maze Game to GitHub Pages. It includes details about the changes made to fix deployment issues and step-by-step instructions for deploying the application.

## Changes Made to Fix Deployment Issues

### 1. GitHub Workflow File

We created a GitHub workflow file (`.github/workflows/deploy.yml`) to automate the build and deployment process. This workflow file:

- Runs on pushes to the main branch or manual triggers
- Sets up Node.js 20 and pnpm
- Configures caching for faster builds
- Builds the application using pnpm
- Deploys the built files to GitHub Pages

```yaml
name: Deploy to GitHub Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
          run_install: false
      
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Vite Configuration

We updated the Vite configuration (`vite.config.ts`) to support GitHub Pages deployment by:

- Adding a `getBase()` function to determine the correct base path
- Using the repository name from environment variables or defaulting to 'maze_game'
- Setting the base path to '/{repo}/' in production and '/' in development

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Get the repository name from package.json or environment variable
// This is needed for GitHub Pages deployment
const getBase = () => {
  // For GitHub Pages, use the repository name as the base
  // You can also set this via environment variable
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'maze_game'
  return process.env.NODE_ENV === 'production' ? `/${repo}/` : '/'
}

export default defineConfig({
  plugins: [react()],
  base: getBase(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 3. HTML File Updates

We updated the `index.html` file to use relative paths for assets and scripts:

- Changed asset references from absolute paths (`/vite.svg`) to relative paths (`./vite.svg`)
- Changed script references from absolute paths (`/src/main.tsx`) to relative paths (`./src/main.tsx`)
- Updated the page title to "Maze Game"

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maze Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

## Step-by-Step Deployment Instructions

### 1. Configure GitHub Repository

1. Ensure your repository is public or you have GitHub Pages enabled for private repositories
2. Go to your repository settings
3. Navigate to the "Pages" section
4. Under "Build and deployment", select "GitHub Actions" as the source

### 2. Push the Updated Code

1. Commit the changes we made to your repository:
   ```bash
   git add .github/workflows/deploy.yml
   git add vite.config.ts
   git add index.html
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

### 3. Monitor the Deployment

1. Go to the "Actions" tab in your GitHub repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for the workflow to complete (this may take a few minutes)
4. Once completed, you'll see a green checkmark if successful

### 4. Access Your Deployed Application

1. Go to the "Pages" section in your repository settings
2. You'll see a message saying "Your site is live at https://username.github.io/repo-name/"
3. Click on the URL to access your deployed Maze Game

## Troubleshooting

### Build Failures

If the build fails, check the following:

1. **Node.js Version**: Ensure the workflow is using a compatible Node.js version (we're using Node.js 20)
2. **Dependencies**: Make sure all dependencies are correctly listed in `package.json`
3. **Build Script**: Verify that the build script in `package.json` is correct (`"build": "tsc -b && vite build"`)
4. **TypeScript Errors**: Fix any TypeScript errors that might be causing the build to fail

### Deployment Failures

If deployment fails, check the following:

1. **Permissions**: Ensure the workflow has the correct permissions (we've set `contents: read`, `pages: write`, and `id-token: write`)
2. **GitHub Pages Settings**: Verify that GitHub Pages is enabled for your repository
3. **Branch Settings**: Make sure you're deploying from the correct branch (we're using `main`)

### Asset Loading Issues

If assets aren't loading correctly in the deployed application:

1. **Base Path**: Verify that the base path in `vite.config.ts` is correctly set
2. **Asset References**: Ensure all asset references in your code use relative paths or import statements
3. **Public Directory**: Make sure assets in the public directory are referenced correctly

## Conclusion

By following this guide, you should now have successfully deployed your Maze Game to GitHub Pages. The changes we made ensure that the application builds correctly and assets are properly referenced in the deployed version.

If you encounter any issues not covered in the troubleshooting section, please check the GitHub Actions logs for more detailed error messages or consult the GitHub Pages documentation.

