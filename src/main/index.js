import { app } from 'electron';
import trimDesktop from './trimDesktop';
import createCaptureWindow from './createCaptureWindow';

app.on("ready", () => {
  trimDesktop().then(({ sourceDisplay, trimmedBounds }) => {
    console.log(sourceDisplay, trimmedBounds);
  });
  // createCaptureWindow();
});
