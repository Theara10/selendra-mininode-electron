import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import { contextBridge, ipcRenderer } from "electron";
import { domReady } from "./utils";
import { useLoading } from "./loading";

const isDev = process.env.NODE_ENV === "development";
const { appendLoading, removeLoading } = useLoading();
// console.log(useLoading);
(async () => {
  await domReady("complete");
  appendLoading();
})();

// ---------------------------------------------------

contextBridge.exposeInMainWorld("bridge", {
  __dirname,
  __filename,
  fs,
  path,
  os,
  spawn,
  ipcRenderer: withPrototype(ipcRenderer),
  removeLoading,
  log: (args) => ipcRenderer.send("log", args),
  sendNodeName: (args) => ipcRenderer.send("node", args),
  sendPassword: (args) => ipcRenderer.send("password", args),
  checkPassword: (callback) => ipcRenderer.on("checkPassword", callback),
  status: (args) => ipcRenderer.on("status", args),
  stopNode: (args) => ipcRenderer.send("stop", args),
  restartNode: (args) => ipcRenderer.send("restart", args),
  getSessionKey: (args) => ipcRenderer.send("session-key", args),
  sendSessionKey: (args) => ipcRenderer.on("session-key", args),
  autoStartContainer: (args) => ipcRenderer.send("autostart", args),
  deleteNode: (args) => ipcRenderer.send("deleteNode", args),
  checkNodeActiveStatus: (args) => ipcRenderer.send("nodeActiveStatus", args),
  getNodeActiveStatus: (args) => ipcRenderer.on("active", args),
  checkIfNodeExist: () => ipcRenderer.send("exist"),
  getNodeExistStatus: (args) => ipcRenderer.on("exist", args),
});

// `exposeInMainWorld` can not detect `prototype` attribute and methods, manually patch it.
function withPrototype(obj) {
  const protos = Object.getPrototypeOf(obj);

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue;

    if (typeof value === "function") {
      // Some native API not work in Renderer-process, like `NodeJS.EventEmitter['on']`. Wrap a function patch it.
      obj[key] = function (...args) {
        return value.call(obj, ...args);
      };
    } else {
      obj[key] = value;
    }
  }
  return obj;
}
