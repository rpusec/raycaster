const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 570,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    frame: false,
  })

  // and load the index.html of the app.
  mainWindow.loadFile('renderer/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
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