'use server';

import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface Web3AuthUserInfo {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  iat?: number;
  exp?: number;
  walletAddress?: string;
}

const WEB3AUTH_DOMAIN = 'https://api-auth.web3auth.io';
const CLIENT_ID = 'BDfGekwXLJUrFw-WIxiDBLuqaZ7J9nDFSgZEug-KMBaSYgY4nfX_xTJRSr7_kGEz-MDVBhaa_M_RAJIITVuPlV0';

/**
 * Verify Web3Auth JWT token and extract user information
 */
export async function verifyWeb3AuthToken(token: string): Promise<Web3AuthUserInfo | null> {
  try {
    console.log('Verifying Web3Auth token...');

    // Create JWKS from Web3Auth
    const jwksUrl = `${WEB3AUTH_DOMAIN}/jwks`;
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: WEB3AUTH_DOMAIN,
      audience: CLIENT_ID,
    });

    console.log('Web3Auth token verified successfully');
    return payload as Web3AuthUserInfo;
  } catch (error) {
    console.log('Web3Auth token verification failed (this is OK for fallback):', error);
    return null;
  }
}

/**
 * Extract Web3Auth token from cookies
 */
export async function extractTokenFromCookies(cookieHeader: string | null): Promise<string | null> {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies.web3auth_token || null;
}

/**
 * Validate Web3Auth session from cookies
 */
export async function validateWeb3AuthSession(cookieHeader: string | null): Promise<Web3AuthUserInfo | null> {
  const token = await extractTokenFromCookies(cookieHeader);
  console.log('token', token);
  if (!token) return null;

  return await verifyWeb3AuthToken(token);
}
