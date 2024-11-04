// auth.js
const clientId = '7a992ac4eb154acbbd2fc2dda7bb4915'; // Replace with your actual client ID
const redirectUri = 'https://fyfire.github.io/Portfolio1/'; // Replace with your actual GitHub Pages URL
const scope = 'openid,lr_partner_apis';

function getAuthUrl() {
    const state = generateRandomState();
    localStorage.setItem('oauth_state', state);
    
    // Updated authorization URL with correct parameters
    const authUrl = `https://ims-na1.adobelogin.com/ims/authorize/v2`
        + `?client_id=${clientId}`
        + `&redirect_uri=${encodeURIComponent(redirectUri)}`
        + `&scope=${encodeURIComponent(scope)}`
        + `&response_type=token`
        + `&state=${state}`
        + `&response_mode=hash`;
    
    return authUrl;
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function handleAuthRedirect() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const state = params.get('state');

    if (state !== localStorage.getItem('oauth_state')) {
        console.error('Invalid state parameter');
        return null;
    }

    localStorage.removeItem('oauth_state');

    if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        return accessToken;
    }

    return null;
}