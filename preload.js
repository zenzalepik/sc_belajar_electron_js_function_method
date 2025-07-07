const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openCmd: () => ipcRenderer.invoke("open-cmd"),
  cekVersiNode: () => ipcRenderer.invoke("cek-versi-node"),

  // Install Package
  runInstall: () => ipcRenderer.send('install-package'),
  onInstallStatus: (callback) => ipcRenderer.on('install-status', callback),

  // Install Package
  runCheckAndInstall: () => ipcRenderer.send('check-and-install'),
  onCheckAndInstallStatus: (callback) => ipcRenderer.on('check-and-install-status', callback),

  openCmddanCheckNode: () => ipcRenderer.invoke("open-cmd-dan-check-node"),
});
