const { app, BrowserWindow } = require("electron");
const path = require("path");

const RAILWAY_URL = "https://ar-client-portal-channel-production.up.railway.app";
const RETRY_MS = 5000;

let mainWindow = null;

function loadApp() {
  mainWindow.loadURL(RAILWAY_URL).catch(() => {
    mainWindow.loadFile(path.join(__dirname, "offline.html"));
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 840,
    title: "AR Corp Channel",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      contextIsolation: true,
    },
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode) => {
    if (errorCode === -3) return; // ERR_ABORTED (e.g. a redirect) — not a real failure
    mainWindow.loadFile(path.join(__dirname, "offline.html"));
    setTimeout(loadApp, RETRY_MS);
  });

  loadApp();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
