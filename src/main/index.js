import os from "os";
import { join } from "path";
const { fork, execSync, exec } = require("child_process");
const {
  app,
  BrowserWindow,
  ipcMain,
  webContents,
  nativeImage,
} = require("electron");
const path = require("path");
// const icon = require("../renderer/public/images/bitriel-logo.ico");
import icon from "../renderer/public/images/logo.jpg";
const storage = require("node-persist");

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
    icon: nativeImage.createFromDataURL(icon),
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
  await storage.init();
  await storage.setItem("node", args);
});

ipcMain.on("password", async (event, args) => {
  await storage.init();
  await storage.setItem("pass", args);
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
    } else if (res.status === "CONTAINER") {
      // async function abc() {
      //   await storage.init(/* options ... */);
      //   await storage.setItem("name", res.container);
      //   console.log("Main: ", await storage.getItem("name")); // yourname
      // }
      // abc();
    } else {
      win.webContents.send("status", JSON.stringify(status3));
    }
  });
});

ipcMain.on("exist", async () => {
  exec(`echo 234 | sudo -S ./nodemgr list`, (err, stdout, stderr) => {
    console.log(`error1: ${err}`);
    console.log(`stdout1: ${stdout.length}`);
    console.log(`stderr1: ${stderr}`);

    if (stdout.length <= 1 || stdout.length >= 49) {
      win.webContents.send("exist", "false");
      console.log("no exist");
    } else {
      win.webContents.send("exist", "true");
      console.log("exist");
    }
  });
});

// systemctl is-active --quiet selendra.theara_node && echo Service is running
// docker inspect --format '{{json .State.Running}}' sel-containervlejt
ipcMain.on("nodeActiveStatus", async (event, args) => {
  await storage.init();
  const node = await storage.getItem("node");
  exec(
    `systemctl is-active --quiet ${
      "selendra." + node
    } && echo true || echo false`,
    (err, stdout, stderr) => {
      console.log(`error1: ${err}`);
      console.log(`stdout1: ${stdout}`);
      console.log(`stderr1: ${stderr}`);

      if (stdout.includes("true")) {
        win.webContents.send("active", stdout);
      }
      if (stdout.includes("false")) {
        win.webContents.send("active", stdout);
      }
    }
  );
});

ipcMain.on("stop", async (event, args) => {
  exec(
    `echo ${args}| sudo -S -k true &>/dev/null && echo true || echo false`,
    async (err, stdout, stderr) => {
      console.log(`error1: ${err}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      if (stdout.includes("false")) {
        const invalid = { status: "INVALID" };
        win.webContents.send("checkPassword", JSON.stringify(invalid));
      }

      if (stdout.includes("true")) {
        execSync(`echo ${args} | sudo -S ./nodemgr stop`);
      }
    }
  );
});

ipcMain.on("restart", async (event, args) => {
  exec(
    `echo ${args}| sudo -S -k true &>/dev/null && echo true || echo false`,
    async (err, stdout, stderr) => {
      console.log(`error1: ${err}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      if (stdout.includes("false")) {
        const invalid = { status: "INVALID" };
        win.webContents.send("checkPassword", JSON.stringify(invalid));
      }

      if (stdout.includes("true")) {
        execSync(`echo ${args} | sudo -S ./nodemgr start`);
      }
    }
  );
});

// ipcMain.on("stop", async (event, args) => {
//   const CONTAINER_NAME = await storage.getItem("name");
//   execSync(`docker stop ${CONTAINER_NAME}`);
// });

// ipcMain.on("restart", async (event, args) => {
//   const CONTAINER_NAME = await storage.getItem("name");
//   execSync(`docker start ${CONTAINER_NAME}`);
// });

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

// ipcMain.on("autostart", async (event, args) => {
//   const CONTAINER_NAME = await storage.getItem("name");
//   console.log("autostart docker");
//   exec(`docker update --restart always ${CONTAINER_NAME}`);
// });

ipcMain.on("deleteNode", async (event, args) => {
  exec(
    `echo ${args}| sudo -S -k true &>/dev/null && echo true || echo false`,
    async (err, stdout, stderr) => {
      console.log(`error1: ${err}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      if (stdout.includes("false")) {
        const invalid = { status: "INVALID" };
        win.webContents.send("checkPassword", JSON.stringify(invalid));
      }

      if (stdout.includes("true")) {
        await storage.init();
        const node = await storage.getItem("node");
        console.log("node:", node);
        exec(`echo ${args} | sudo -S ./nodemgr remove --name=${node}`);
        console.log("deletenode");
      }
    }
  );
});

//delete node docker
// ipcMain.on("deleteNode", async (event, args) => {
//   const CONTAINER_NAME = await storage.getItem("name");
//   exec(`docker container rm -f ${CONTAINER_NAME}`);
//   console.log("deletenode");
// });

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
