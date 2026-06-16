import path from "path";
import { fileURLToPath } from "url";

// Set CWD to this app's directory so Tailwind resolves content paths correctly
// when Vite is launched from the monorepo root.
process.chdir(path.dirname(fileURLToPath(import.meta.url)));

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
