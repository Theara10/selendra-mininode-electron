import os from "os";
import { join } from "path";
// import "./samples/electron-store";
// import { app, BrowserWindow, ipcMain } from "electron";
const { fork, execSync, exec } = require("child_process");
const { app, BrowserWindow, ipcMain, webContents } = require("electron");
const path = require("path");

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win = null;
let nodename = null;
let password = null;

async function createWindow() {
  process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = false;
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    title: "Main window",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
    icon: join(__dirname, "../renderer/public/images/bitriel-logo.ico"),
    show: false,
    unsafeEval: false,
  });

  win.webContents.send("active", JSON.stringify("main"));
  win.setMenu(null);
  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    const pkg = await import("../../package.json");
    const url = `http://${pkg.env.HOST || "127.0.0.1"}:${pkg.env.PORT}`;

    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win.show();
    win.webContents.send("main-process-message", new Date().toLocaleString());
  });
}

app.whenReady().then(createWindow);

//recieve node's name from input
ipcMain.on("node", async (event, args) => {
  nodename = args;
});

ipcMain.on("password", async (event, args) => {
  password = args;
  const path_module = join(__dirname, "./child.js");
  const child = await fork(path_module, [password, nodename]);
  child.on("error", (err) => {
    console.log(err);
  });
  child.on("message", function (message) {
    const res = JSON.parse(message);
    const status1 = { status: "UPDATE", message: "Updating System" };
    const status2 = { status: "RUNNING", message: "Running Node" };
    const status3 = { status: "Nothing", message: "Not doing anything" };
    const status4 = { status: "INVALID", message: "Incorrect Password" };

    if (res.status == "UPDATE") {
      win.webContents.send("status", JSON.stringify(status1));
    } else if (res.status == "RUNNING") {
      win.webContents.send("status", JSON.stringify(status2));
    } else if (res.status == "INVALID") {
      win.webContents.send("checkPassword", JSON.stringify(status4));
    } else {
      win.webContents.send("status", JSON.stringify(status3));
    }
  });
});

ipcMain.on("stop", (event, args) => {
  execSync("docker stop sel-container");
});

ipcMain.on("restart", (event, args) => {
  execSync("docker start sel-container");
});

ipcMain.on("session-key", (event, args) => {
  console.log(args);
  exec(
    `curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' http://localhost:9934`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      const data = JSON.parse(stdout);
      console.log(data.result);
      console.log(`Number of files ${stdout}`);
      win.webContents.send("session-key", stdout);
    }
  );
});

ipcMain.on("autostart", (event, args) => {
  console.log("autostart docker");
  exec("docker update --restart always sel-container");
});

ipcMain.on("deleteNode", (event, args) => {
  const CONTAINER_NAME = "sel-container";
  exec(`docker container rm -f sel-container`);
  console.log("deletenode");
});

ipcMain.on("nodeActiveStatus", (event, args) => {
  exec(
    `docker inspect --format '{{json .State.Running}}' sel-container`,
    (err, stdout, stderr) => {
      console.log(`error: ${err}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      if (stdout.includes("true")) {
        win.webContents.send("active", stdout);
      }
      if (stdout.includes("false")) {
        win.webContents.send("active", stdout);
      }
    }
  );
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    app.quit();
    app.exit();
  }
});

app.on("second-instance", () => {
  if (win) {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
