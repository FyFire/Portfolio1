// auth.js
const clientId = '7a992ac4eb154acbbd2fc2dda7bb4915'; // Your Adobe API client ID
const redirectUri = 'https://fyfire.github.io/Portfolio1/'; // Your GitHub Pages URL
const scope = 'openid,lr_partner_apis';

function getAuthUrl() {
    const state = generateRandomState();
    localStorage.setItem('oauth_state', state);
    
    const authUrl = `https://ims-na1.adobelogin.com/ims/authorize/v2`
        + `?client_id=${clientId}`
        + `&redirect_uri=${encodeURIComponent(redirectUri)}`
        + `&scope=${encodeURIComponent(scope)}`
        + `&response_type=token`
        + `&state=${state}`
        + `&response_mode=fragment`; // Added this line
    
    return authUrl;
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15);
}

function handleAuthRedirect() {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const state = params.get('state');
        
        // Verify state
        const savedState = localStorage.getItem('oauth_state');
        if (state !== savedState) {
            console.error('State mismatch');
            return null;
        }
        
        if (accessToken) {
            localStorage.setItem('access_token', accessToken);
            return accessToken;
        }
    }
    return null;
}