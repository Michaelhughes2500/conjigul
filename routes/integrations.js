'use strict';

const express = require('express');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function readGoogleCreds() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const missing = [
      !clientId && 'GOOGLE_OAUTH_CLIENT_ID',
      !clientSecret && 'GOOGLE_OAUTH_CLIENT_SECRET',
    ]
      .filter(Boolean)
      .join(', ');
    const err = new Error(`Google OAuth not configured (missing ${missing}).`);
    err.status = 500;
    throw err;
  }
  return { clientId, clientSecret };
}

function shapeTokens(data) {
  const expiresInSeconds = Number(data.expires_in) || 0;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : 0,
    scope: data.scope,
    tokenType: data.token_type,
  };
}

const router = express.Router();

router.get('/config', (_req, res) => {
  res.json({ clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '' });
});

router.post('/oauth/exchange', async (req, res, next) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body || {};
    if (!code || !codeVerifier || !redirectUri) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const { clientId, clientSecret } = readGoogleCreds();
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json();
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: data.error_description || data.error || 'Token exchange failed.' });
    }
    return res.json(shapeTokens(data));
  } catch (err) {
    return next(err);
  }
});

router.post('/oauth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: 'Missing refreshToken.' });
    }
    const { clientId, clientSecret } = readGoogleCreds();
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json();
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: data.error_description || data.error || 'Token refresh failed.' });
    }
    return res.json(shapeTokens(data));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
