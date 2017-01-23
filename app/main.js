/* eslint global-require: 0 */
require('babel-register');

const electron = require('electron');
const path = require('path');
const glob = require('glob');


const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
    require('electron-debug')({ showDevTools: true });
}

// Load all scripts in ./main-process
function loadMain() {
    const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
    files.forEach((file) => {
        require(file); // eslint-disable-line
    });
}

function makeSingleInstance() {
    if (process.mas) return false;

    return app.makeSingleInstance(() => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

function createWindow() {
    const windowOptions = {
        width: 1920,
        height: 1080,
        title: app.getName()
    };

    // if (process.platform === 'linux') {
    //   windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png');
    // }

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join('file://', __dirname, '/renderer-process/windows/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function init() {
    const shouldQuit = makeSingleInstance();
    if (shouldQuit) return app.quit();

    loadMain();

    app.on('ready', () => {
        createWindow();
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}

// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
    case '--squirrel-install':
    case '--squirrel-updated':
    case '--squirrel-uninstall':
    case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated
        app.quit();
        break;
    default:
        init();
        break;
}
