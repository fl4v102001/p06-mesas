export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

let wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080';

// Automatically upgrade to secure WebSocket if the page is loaded over HTTPS
// This prevents "Mixed Content" errors in production environments like Render.
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && wsUrl.startsWith('ws://')) {
    wsUrl = wsUrl.replace('ws://', 'wss://');
}

export const WEBSOCKET_URL = wsUrl;
