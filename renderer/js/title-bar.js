const { ipcRenderer } = require("electron");

export default {
    init(){
        document.querySelector('#title-bar .btn.minimize').addEventListener('click', () => ipcRenderer.send('minimize-app'));
        document.querySelector('#title-bar .btn.exit').addEventListener('click', () => ipcRenderer.send('exit-app'));
    }
}