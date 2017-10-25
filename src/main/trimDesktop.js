import { screen, ipcMain, BrowserWindow } from "electron";
import fs from 'fs';

function trimDesktop() {
  const displays = screen.getAllDisplays();
  return new Promise((resolve, reject) => {
    const windows = displays.map((display, i) => {
      const { x, y, width, height } = display.bounds;
      display.name = "Screen " + (i + 1);
      const win = new BrowserWindow({
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        x, y, width, height,
      });
      win.loadURL(`file://${__dirname}/../index.html`);
      return { win, display };
    });

    ipcMain.once("SEND_BOUNDS", (e, { trimmedBounds, screen }) => {
      const sourceDisplay = windows.find(w => w.win.webContents.id === e.sender.id).display;
      const profile = { sourceDisplay, trimmedBounds };
      windows.forEach(w => w.win.close());
      console.log(screen);
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = screen.match(regex);
      const ext = matches[1];
      const data = matches[2];
      const buffer = new Buffer(data, 'base64');
      fs.writeFileSync('data.' + ext, buffer);
      resolve(profile);
    });
  });
}

export default trimDesktop;
