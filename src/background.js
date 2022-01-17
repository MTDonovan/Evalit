"use strict";
import { ipcMain } from "electron";
// import { app, protocol, BrowserWindow, dialog, Tray, nativeImage } from "electron";
import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
import * as path from "path";
import * as fs from "fs";
const exec = require("child_process").exec;

/**
 * If the user defined data and user defined functions do not exist, create the files in
 * the appdata.
 */
let userDefinedDataPath = path.join(
  app.getPath("userData"),
  "user.defined.data.js"
);
if (!fs.existsSync(userDefinedDataPath)) {
  fs.writeFileSync(userDefinedDataPath, "// Write your data in this file.");
}
let userDefinedFunctionsPath = path.join(
  app.getPath("userData"),
  "user.defined.functions.js"
);
if (!fs.existsSync(userDefinedFunctionsPath)) {
  fs.writeFileSync(
    userDefinedFunctionsPath,
    "// Write your functions in this file."
  );
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    minWidth: 900,
    width: 1020,
    height: 720,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  });

  win.setMenu(null);

  ipcMain.on("get-data-text", (event, arg) => {
    let userDefinedDataPath = path.join(
      app.getPath("userData"),
      "user.defined.data.js"
    );
    let dataText = fs.readFileSync(userDefinedDataPath, {
      encoding: "utf8",
      flag: "r"
    });
    event.returnValue = dataText;
    return;
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar to stay active until the
  // user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it"s common to re-create a window in the app when the dock icon is clicked
  // and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished initialization and is ready to
// create browser windows. Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

ipcMain.on("get-file-path", (event, arg) => {
  switch (arg) {
    case "appdata":
      event.returnValue = app.getPath("userData").replace(/\\/g, "/");
      break;
    case "data":
      event.returnValue = path
        .join(app.getPath("userData"), "user.defined.data.js")
        .replace(/\\/g, "/");
      break;
    case "functions":
      event.returnValue = path
        .join(app.getPath("userData"), "user.defined.functions.js")
        .replace(/\\/g, "/");
      break;
  }
  return;
});

ipcMain.on("relaunch-app", (event, arg) => {
  app.relaunch();
  app.exit();
  return;
});
