/**
 * Encryption Service for Database Connection Management
 * 
 * This service provides secure encryption and decryption of sensitive data,
 * particularly passwords for database connections. It uses the Web Crypto API
 * for strong encryption with AES-GCM algorithm.
 */

/**
 * Encryption configuration
 */
interface EncryptionConfig {
  /** Algorithm to use for encryption */
  algorithm: 'AES-GCM'
  /** Key length in bits */
  keyLength: 256
  /** IV length in bytes */
  ivLength: 12
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Base64 encoded encrypted data */
  data: string
  /** Base64 encoded initialization vector */
  iv: string
  /** Timestamp when encrypted */
  timestamp: number
}

/**
 * Service for encrypting and decrypting sensitive connection data
 */
export class EncryptionService {
  private static instance: EncryptionService
  private config: EncryptionConfig
  private masterKey: CryptoKey | null = null

  private constructor() {
    this.config = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12
    }
  }

  /**
   * Get singleton instance of EncryptionService
   */
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService()
    }
    return EncryptionService.instance
  }

  /**
   * Initialize the encryption service with a master key
   * This should be called once when the application starts
   */
  public async initialize(userKey?: string): Promise<void> {
    try {
      // Generate or derive master key
      if (userKey) {
        // Derive key from user-provided string
        this.masterKey = await this.deriveKeyFromString(userKey)
      } else {
        // Generate a new key and store it securely
        this.masterKey = await this.generateMasterKey()
      }
    } catch (error) {
      console.error('Failed to initialize encryption service:', error)
      throw new Error('Encryption service initialization failed')
    }
  }

  /**
   * Encrypt a plaintext string
   */
  public async encrypt(plaintext: string): Promise<EncryptedData> {
    if (!this.masterKey) {
      throw new Error('Encryption service not initialized')
    }

    try {
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength))
      
      // Convert plaintext to bytes
      const encoder = new TextEncoder()
      const plaintextBytes = encoder.encode(plaintext)

      // Encrypt the data
      const encryptedBytes = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv
        },
        this.masterKey,
        plaintextBytes
      )

      // Convert to base64 for storage
      const encryptedData = this.arrayBufferToBase64(encryptedBytes)
      const ivBase64 = this.arrayBufferToBase64(iv.buffer)

      return {
        data: encryptedData,
        iv: ivBase64,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt encrypted data back to plaintext
   */
  public async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Encryption service not initialized')
    }

    try {
      // Convert base64 back to bytes
      const dataBytes = this.base64ToArrayBuffer(encryptedData.data)
      const ivBytes = this.base64ToArrayBuffer(encryptedData.iv)

      // Decrypt the data
      const decryptedBytes = await crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: new Uint8Array(ivBytes)
        },
        this.masterKey,
        dataBytes
      )

      // Convert back to string
      const decoder = new TextDecoder()
      return decoder.decode(decryptedBytes)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Check if the service is initialized
   */
  public isInitialized(): boolean {
    return this.masterKey !== null
  }

  /**
   * Generate a new master key
   */
  private async generateMasterKey(): Promise<CryptoKey> {
    const key = await crypto.subtle.generateKey(
      {
        name: this.config.algorithm,
        length: this.config.keyLength
      },
      true, // extractable
      ['encrypt', 'decrypt']
    )

    // Store the key in a secure way (in a real app, you'd want to use a more secure method)
    await this.storeMasterKey(key)
    
    return key
  }

  /**
   * Derive a key from a user-provided string
   */
  private async deriveKeyFromString(userKey: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userKey),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )

    // Generate a salt (in a real app, this should be stored and reused)
    const salt = crypto.getRandomValues(new Uint8Array(16))
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.config.algorithm,
        length: this.config.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    )

    return key
  }

  /**
   * Store master key securely (simplified implementation)
   * In a production app, you'd want to use a more secure storage method
   */
  private async storeMasterKey(key: CryptoKey): Promise<void> {
    try {
      const exportedKey = await crypto.subtle.exportKey('jwk', key)
      const keyString = JSON.stringify(exportedKey)
      
      // Store in localStorage (not ideal for production)
      localStorage.setItem('sql-editor-master-key', keyString)
    } catch (error) {
      console.error('Failed to store master key:', error)
    }
  }

  /**
   * Load master key from storage
   */
  private async loadMasterKey(): Promise<CryptoKey | null> {
    try {
      const keyString = localStorage.getItem('sql-editor-master-key')
      if (!keyString) return null

      const keyData = JSON.parse(keyString)
      const key = await crypto.subtle.importKey(
        'jwk',
        keyData,
        {
          name: this.config.algorithm,
          length: this.config.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      )

      return key
    } catch (error) {
      console.error('Failed to load master key:', error)
      return null
    }
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Clear the master key from memory (for security)
   */
  public clearMasterKey(): void {
    this.masterKey = null
  }

  /**
   * Test encryption/decryption with sample data
   */
  public async test(): Promise<boolean> {
    try {
      const testData = 'test-password-123'
      const encrypted = await this.encrypt(testData)
      const decrypted = await this.decrypt(encrypted)
      return decrypted === testData
    } catch (error) {
      console.error('Encryption test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance()
