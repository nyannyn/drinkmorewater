// Metro 設定：讓 App 能 import 專案根目錄的 ../shared（跨平台共用 core）。
// 預設 metro 只看 mobile/ 內檔案，故把 shared 加進 watchFolders。
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 監看共用資料夾，使 import "../../../shared/*.js" 可被打包。
config.watchFolders = [path.resolve(workspaceRoot, "shared")];

// 確保套件解析仍以 mobile/node_modules 為主。
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = config;
