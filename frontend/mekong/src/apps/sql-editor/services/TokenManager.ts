/**
 * Token Manager Service
 * 
 * Handles JWT token storage, validation, and refresh logic
 */

import type { JWTToken } from '../types/auth'

const TOKEN_STORAGE_KEY = 'sql_editor_auth_token'
const REFRESH_TOKEN_STORAGE_KEY = 'sql_editor_refresh_token'
const TOKEN_EXPIRY_BUFFER = 60000 // 1 minute buffer before token expires

export class TokenManager {
  private refreshPromise: Promise<JWTToken | null> | null = null

  /**
   * Store tokens securely
   */
  storeTokens(token: JWTToken): void {
    try {
      // Store in localStorage for now - in production, consider httpOnly cookies
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
        access_token: token.access_token,
        expires_in: token.expires_in,
        token_type: token.token_type,
        created_at: Date.now()
      }))
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token.refresh_token)
    } catch (error) {
      console.error('Failed to store tokens:', error)
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    try {
      const tokenData = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!tokenData) return null

      const token = JSON.parse(tokenData)
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        return null
      }

      return token.access_token
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to get refresh token:', error)
      return null
    }
  }

  /**
   * Get stored token data
   */
  getStoredToken(): JWTToken | null {
    try {
      const tokenData = localStorage.getItem(TOKEN_STORAGE_KEY)
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
      
      if (!tokenData || !refreshToken) return null

      const token = JSON.parse(tokenData)
      
      return {
        access_token: token.access_token,
        refresh_token: refreshToken,
        expires_in: token.expires_in,
        token_type: token.token_type
      }
    } catch (error) {
      console.error('Failed to get stored token:', error)
      return null
    }
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(token?: any): boolean {
    try {
      const tokenData = token || JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || '{}')
      
      if (!tokenData.created_at || !tokenData.expires_in) return true

      const expiryTime = tokenData.created_at + (tokenData.expires_in * 1000) - TOKEN_EXPIRY_BUFFER
      return Date.now() >= expiryTime
    } catch (error) {
      console.error('Failed to check token expiry:', error)
      return true
    }
  }

  /**
   * Check if token needs refresh (within buffer time)
   */
  needsRefresh(): boolean {
    try {
      const tokenData = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!tokenData) return false

      const token = JSON.parse(tokenData)
      if (!token.created_at || !token.expires_in) return false

      const expiryTime = token.created_at + (token.expires_in * 1000)
      const bufferTime = TOKEN_EXPIRY_BUFFER * 2 // 2 minute buffer for refresh
      
      return Date.now() >= (expiryTime - bufferTime)
    } catch (error) {
      console.error('Failed to check if token needs refresh:', error)
      return false
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
      this.refreshPromise = null
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  /**
   * Refresh token with deduplication
   * Ensures only one refresh request is made at a time
   */
  async refreshToken(): Promise<JWTToken | null> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Start new refresh request
    this.refreshPromise = this.performRefresh()
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<JWTToken | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Mock API call - replace with actual API endpoint
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const newToken: JWTToken = await response.json()
      this.storeTokens(newToken)
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear tokens on refresh failure
      this.clearTokens()
      return null
    }
  }

  /**
   * Get authorization header for API requests
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken()
    return token ? `Bearer ${token}` : null
  }

  /**
   * Decode JWT token payload (without verification)
   * Note: This is for client-side information only, never trust for authorization
   */
  decodeTokenPayload(token?: string): any | null {
    try {
      const accessToken = token || this.getAccessToken()
      if (!accessToken) return null

      const [, payload] = accessToken.split('.')
      if (!payload) return null

      return JSON.parse(atob(payload))
    } catch (error) {
      console.error('Failed to decode token payload:', error)
      return null
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiryTime(): Date | null {
    try {
      const tokenData = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!tokenData) return null

      const token = JSON.parse(tokenData)
      if (!token.created_at || !token.expires_in) return null

      return new Date(token.created_at + (token.expires_in * 1000))
    } catch (error) {
      console.error('Failed to get token expiry time:', error)
      return null
    }
  }
}

// Create singleton instance
export const tokenManager = new TokenManager()