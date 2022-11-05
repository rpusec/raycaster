const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 570,
    webPreferences: {
      nodeIntegration: true,
			contextIsolation: false,
    },
    resizable: false,
    frame: false,
  })

  // and load the index.html of the app.
  mainWindow.loadFile('renderer/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  ipcMain.on('minimize-app', () => mainWindow.minimize());
  ipcMain.on('exit-app', () => mainWindow.close());
}
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})