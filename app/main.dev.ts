/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';

import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const defaultWidth = 1024;
  const defaultHeight = 768;

  mainWindow = new BrowserWindow({
    show: false,
    width: defaultWidth,
    height: defaultHeight,
    center: true,
    minWidth: defaultWidth,
    minHeight: defaultHeight,
    backgroundColor: '#252525',
    fullscreenable: false,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js')
          }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  ipcMain.on('chime-enable-screen-share-mode', event => {
    if (!mainWindow) {
      // eslint-disable-next-line
      console.error('"mainWindow" is not defined');
      return;
    }

    const windowWidth = 150;
    const windowHeight = defaultHeight;
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setMinimumSize(windowWidth, windowHeight);
    mainWindow.setSize(windowWidth, windowHeight);
    mainWindow.setPosition(32, 64);
    mainWindow.resizable = false;
    mainWindow.minimizable = false;
    mainWindow.maximizable = false;
    if (typeof mainWindow.setWindowButtonVisibility === 'function') {
      mainWindow.setWindowButtonVisibility(false);
    }
    // In macOS Electron, long titles may be truncated.
    mainWindow.setTitle('MyClassroom');

    event.reply('chime-enable-screen-share-mode-ack');
  });

  ipcMain.on('chime-disable-screen-share-mode', event => {
    if (!mainWindow) {
      // eslint-disable-next-line
      console.error('"mainWindow" is not defined');
      return;
    }

    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMinimumSize(defaultWidth, defaultHeight);
    mainWindow.setSize(defaultWidth, defaultHeight);
    mainWindow.center();
    mainWindow.resizable = true;
    mainWindow.minimizable = true;
    mainWindow.maximizable = true;
    if (typeof mainWindow.setWindowButtonVisibility === 'function') {
      mainWindow.setWindowButtonVisibility(true);
    }
    mainWindow.setTitle('MyClassroom');

    event.reply('chime-disable-screen-share-mode-ack');
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
