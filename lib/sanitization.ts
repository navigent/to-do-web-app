import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import validator from 'validator'

// Create DOMPurify instance with JSDOM for server-side usage
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

// Configure DOMPurify to be more restrictive
purify.setConfig({
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
})

export interface SanitizationOptions {
  maxLength?: number
  trim?: boolean
  toLowerCase?: boolean
  toUpperCase?: boolean
  removeSpecialChars?: boolean
  allowedSpecialChars?: string
}

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string, options: SanitizationOptions = {}): string {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Remove any HTML/script tags
  sanitized = purify.sanitize(sanitized)

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim()
  }

  // Apply length limit
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }

  // Remove special characters if requested
  if (options.removeSpecialChars) {
    const allowedChars = options.allowedSpecialChars || ''
    const regex = new RegExp(`[^a-zA-Z0-9\\s${allowedChars}]`, 'g')
    sanitized = sanitized.replace(regex, '')
  }

  // Case transformation
  if (options.toLowerCase) {
    sanitized = sanitized.toLowerCase()
  } else if (options.toUpperCase) {
    sanitized = sanitized.toUpperCase()
  }

  // Additional security: escape any remaining HTML entities
  sanitized = validator.escape(sanitized)

  return sanitized
}

/**
 * Sanitize and validate email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }

  const sanitized = email.trim().toLowerCase()
  
  if (!validator.isEmail(sanitized)) {
    throw new Error('Invalid email format')
  }

  return validator.normalizeEmail(sanitized) || sanitized
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }

  const sanitized = url.trim()
  
  if (!validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })) {
    throw new Error('Invalid URL format')
  }

  return sanitized
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any, options: { min?: number; max?: number; isInt?: boolean } = {}): number {
  const num = Number(input)
  
  if (isNaN(num)) {
    throw new Error('Invalid number')
  }

  if (options.isInt && !Number.isInteger(num)) {
    throw new Error('Must be an integer')
  }

  if (options.min !== undefined && num < options.min) {
    throw new Error(`Number must be at least ${options.min}`)
  }

  if (options.max !== undefined && num > options.max) {
    throw new Error(`Number must be at most ${options.max}`)
  }

  return num
}

/**
 * Sanitize array input
 */
export function sanitizeArray<T>(
  input: any,
  itemSanitizer: (item: any) => T,
  options: { maxLength?: number; unique?: boolean } = {}
): T[] {
  if (!Array.isArray(input)) {
    return []
  }

  let sanitized = input.map(itemSanitizer)

  if (options.unique) {
    sanitized = [...new Set(sanitized)]
  }

  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength)
  }

  return sanitized
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObject<T extends Record<string, any>>(
  input: any,
  allowedKeys: string[]
): Partial<T> {
  if (typeof input !== 'object' || input === null) {
    return {}
  }

  const sanitized: Partial<T> = {}
  
  for (const key of allowedKeys) {
    if (key in input && !key.includes('__proto__') && !key.includes('constructor') && !key.includes('prototype')) {
      sanitized[key as keyof T] = input[key]
    }
  }

  return sanitized
}

/**
 * Remove null bytes and other dangerous characters
 */
export function removeNullBytes(input: string): string {
  return input.replace(/\0/g, '')
}

/**
 * Validate and sanitize MongoDB ObjectId
 */
export function sanitizeId(id: string): string {
  if (typeof id !== 'string') {
    throw new Error('ID must be a string')
  }

  const sanitized = id.trim()
  
  // Validate CUID format (Prisma default)
  if (!/^c[a-z0-9]{24}$/.test(sanitized)) {
    throw new Error('Invalid ID format')
  }

  return sanitized
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return ''
  }

  let sanitized = sanitizeString(query, {
    maxLength: 100,
    trim: true,
  })

  // Remove SQL wildcards that could be abused
  sanitized = sanitized.replace(/[%_]/g, '')

  // Escape special regex characters
  sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return sanitized
}

/**
 * Sanitize sort field to prevent injection
 */
export function sanitizeSortField(field: string, allowedFields: string[]): string {
  if (typeof field !== 'string') {
    throw new Error('Sort field must be a string')
  }

  const sanitized = field.trim()
  
  if (!allowedFields.includes(sanitized)) {
    throw new Error(`Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`)
  }

  return sanitized
}

/**
 * Sanitize sort order
 */
export function sanitizeSortOrder(order: string): 'asc' | 'desc' {
  if (typeof order !== 'string') {
    return 'desc'
  }

  const sanitized = order.trim().toLowerCase()
  
  if (sanitized !== 'asc' && sanitized !== 'desc') {
    return 'desc'
  }

  return sanitized as 'asc' | 'desc'
}