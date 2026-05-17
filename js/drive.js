/**
 * Google Drive Integration Module
 */

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize GAPI
 */
export const initGapi = () => {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    // Note: API key is not strictly required for Drive.file scope if using GIS
                    // but sometimes helpful for other discovery services.
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                if (gisInited) resolve();
            } catch (err) {
                console.error('Error initializing GAPI', err);
                reject(err);
            }
        });
    });
};

/**
 * Initialize GIS
 */
export const initGis = (clientId) => {
    return new Promise((resolve) => {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
        if (gapiInited) resolve();
    });
};

/**
 * Request Access Token
 */
const getAccessToken = () => {
    return new Promise((resolve, reject) => {
        try {
            tokenClient.callback = (resp) => {
                if (resp.error !== undefined) {
                    reject(resp);
                }
                resolve(resp);
            };

            if (gapi.client.getToken() === null) {
                // Prompt the user to select a Google Account and ask for consent to share their data
                // when establishing a new session.
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                // Skip display of account chooser and consent dialog for an existing session.
                tokenClient.requestAccessToken({ prompt: '' });
            }
        } catch (err) {
            console.error('GIS Error', err);
            reject(err);
        }
    });
};

/**
 * Upload CSV to Google Drive
 */
export const uploadToDrive = async (csvContent, fileName) => {
    if (!navigator.onLine) {
        throw new Error('No internet connection. Please connect to the internet to save to Drive.');
    }

    if (!gapiInited || !gisInited) {
        throw new Error('Google Drive API not initialized.');
    }

    try {
        const tokenResp = await getAccessToken();
        const accessToken = tokenResp.access_token;

        const metadata = {
            name: fileName,
            mimeType: 'text/csv',
        };

        const boundary = 'foo_bar_baz';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: text/csv\r\n\r\n' +
            csvContent +
            close_delim;

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: multipartRequestBody,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || 'Failed to upload to Google Drive');
        }

        const result = await response.json();
        return result.id;
    } catch (err) {
        console.error('Failed to upload to Drive', err);
        throw err;
    }
};
