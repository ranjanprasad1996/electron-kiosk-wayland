// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');

const RETRY_DELAY = 2000; // 2 seconds delay

async function loadPage(win, url) {
  let attempt = 1;
  let success = false;

  while (!success) {
    console.log(`Attempting to load ${url} - Attempt #${attempt}`);

    try {
      await win.loadURL(url);
      // If the page loads successfully
      win.webContents.once('did-finish-load', () => {
        console.log('Page loaded successfully');
        success = true; // Mark as success and break the loop
      });
    } catch (error) {
      // If it fails to load, log the error
      console.error(`Failed to load the page - Attempt #${attempt}:`, error);
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);

      // Wait for the retry delay before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }

    attempt++; // Increment attempt after each retry
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the page with retry logic
  loadPage(mainWindow, process.env["SNAP_URL"]);

  mainWindow.setFullScreen(true)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
