const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process"); // gunakan exec, bukan spawn
const { spawn } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => (mainWindow = null));
}

// 🛠️ Tambahan: Handler open-cmd
ipcMain.handle("open-cmd", () => {
  console.log("📥 IPC: open-cmd");

  // Menjalankan CMD dan langsung keluar dari handler, tanpa promise
  return new Promise((resolve) => {
    exec("start cmd.exe", { windowsHide: false }, (error) => {
      if (error) {
        console.error("❌ Gagal buka CMD:", error);
        resolve("❌ Gagal membuka CMD: " + error.message);
      } else {
        console.log("✅ CMD berhasil dibuka");
        resolve("✅ CMD berhasil dibuka");
      }
    });
  });
});

// 🛠️ Tambahan: Handler cek-versi-node
ipcMain.handle("cek-versi-node", () => {
  console.log("📥 IPC: cek-versi-node");
  return new Promise((resolve, reject) => {
    exec("node -v", { windowsHide: true }, (error, stdout) => {
      if (error) {
        console.error("❌ Gagal ambil versi node:", error);
        reject("Gagal ambil versi");
      } else {
        const versi = stdout.trim();
        console.log("✅ Versi Node:", versi);
        resolve(versi);
      }
    });
  });
});

// 🛠️ Tambahan: Handler install-package
ipcMain.on("install-package", (event) => {
  const webContents = event.sender;
  webContents.send("install-status", "Sedang Menginstal...");

  exec(
    "npm install",
    { cwd: path.resolve(__dirname) },
    (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return webContents.send("install-status", "Gagal menginstal paket.");
      }
      console.log("✅" + stdout);
      webContents.send("install-status", "✅ Berhasil menginstal paket.");
    }
  );
});

// 🛠️ Tambahan: Handler check-and-install
ipcMain.on("check-and-install", (event) => {
  const webContents = event.sender;
  webContents.send(
    "check-and-install-status",
    "Sedang mengececk versi Node.js..."
  );

  exec("node -v", { cwd: path.resolve(__dirname) }, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return webContents.send(
        "check-and-install-status",
        "Gagal mengececk versi Node.js"
      );
    }
    console.log("✅" + stdout);
    webContents.send(
      "check-and-install-status",
      "✅ Berhasil mengececk versi Node.js"
    );

    setTimeout(() => {
      exec(
        "npm install",
        { cwd: path.resolve(__dirname) },
        (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            return webContents.send(
              "check-and-install-status",
              "Gagal menginstall paket."
            );
          }
          console.log("✅" + stdout);
          webContents.send(
            "check-and-install-status",
            "✅ Berhasil mengececk dan menginstall paket."
          );
        }
      );
    }, 1000);
  });
});

// 🛠️ Tambahan: Handler open-cmd-dan-check-node
ipcMain.handle("open-cmd-dan-check-node", () => {
  console.log("📥 IPC: open-cmd-dan-check-node");
  return;
});

// Tambahkan ini hanya saat development
try {
  require("electron-reload")(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`),
  });
} catch (_) {}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
