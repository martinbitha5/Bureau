// Metro pour monorepo pnpm : surveille la racine + résout les node_modules hoistés.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// pnpm : laisser la recherche hiérarchique ACTIVE pour résoudre les dépendances
// transitives via les node_modules imbriqués du store .pnpm (sinon @expo/metro-runtime
// et consorts restent introuvables).

module.exports = config;
