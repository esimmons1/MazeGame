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

