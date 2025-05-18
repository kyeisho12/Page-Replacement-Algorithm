const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	// Set CSP headers
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
                ]
            }
        });
    });

	ipcMain.handle('create-file', (req, data) => {
		if (!data || !data.title || !data.content) return false;

		const filePath = path.join(__dirname, '[new-folder-name]', `${data.title}.txt`);
		fs.writeFileSync(filePath, data.content);

		return { success: true, filePath };
	})

	// Add error handling for window loading
    win.loadFile(path.join(__dirname, 'src/index.html'))
        .catch(err => {
            console.error('Failed to load index.html:', err);
        });

    // Comment out DevTools for production
    // win.webContents.openDevTools();

    // Handle window loading errors
    win.webContents.on('did-fail-load', () => {
        console.error('Failed to load window content');
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
})