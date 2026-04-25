// FE-CLIENT-INTERCEPTOR-001 to FE-CLIENT-INTERCEPTOR-012
import { describe, it, expect } from 'vitest'
import { isAuthPublicPath } from '../../../src/api/client'

describe('FE-CLIENT-INTERCEPTOR: 401 AUTH_REQUIRED redirect allowlist', () => {
  describe('exact-match public paths — no redirect', () => {
    it('FE-CLIENT-INTERCEPTOR-001: /login', () => {
      expect(isAuthPublicPath('/login')).toBe(true)
    })

    it('FE-CLIENT-INTERCEPTOR-002: /friend/login', () => {
      expect(isAuthPublicPath('/friend/login')).toBe(true)
    })

    it('FE-CLIENT-INTERCEPTOR-003: /admin/login', () => {
      expect(isAuthPublicPath('/admin/login')).toBe(true)
    })

    it('FE-CLIENT-INTERCEPTOR-004: /register', () => {
      expect(isAuthPublicPath('/register')).toBe(true)
    })

    it('FE-CLIENT-INTERCEPTOR-005: /forgot-password', () => {
      expect(isAuthPublicPath('/forgot-password')).toBe(true)
    })

    it('FE-CLIENT-INTERCEPTOR-006: /reset-password', () => {
      expect(isAuthPublicPath('/reset-password')).toBe(true)
    })
  })

  describe('prefix-match public paths — no redirect', () => {
    it('FE-CLIENT-INTERCEPTOR-007: /shared/:token', () => {
      expect(isAuthPublicPath('/shared/abc123token')).toBe(true)
    })

    it('FE-CLIENT-INTERCEPTOR-008: /public/journey/:token', () => {
      expect(isAuthPublicPath('/public/journey/xyz789')).toBe(true)
    })
  })

  describe('paths that matched via includes() before fix — must redirect', () => {
    it('FE-CLIENT-INTERCEPTOR-009: /admin/register', () => {
      expect(isAuthPublicPath('/admin/register')).toBe(false)
    })

    it('FE-CLIENT-INTERCEPTOR-010: /some-login-page', () => {
      expect(isAuthPublicPath('/some-login-page')).toBe(false)
    })
  })

  describe('paths that matched via loose startsWith before fix — must redirect', () => {
    it('FE-CLIENT-INTERCEPTOR-011: /reset-password-extra', () => {
      expect(isAuthPublicPath('/reset-password-extra')).toBe(false)
    })

    it('FE-CLIENT-INTERCEPTOR-012: /forgot-password-extra', () => {
      expect(isAuthPublicPath('/forgot-password-extra')).toBe(false)
    })
  })

  describe('private app paths — must redirect', () => {
    it('FE-CLIENT-INTERCEPTOR-013: /dashboard', () => {
      expect(isAuthPublicPath('/dashboard')).toBe(false)
    })

    it('FE-CLIENT-INTERCEPTOR-014: /trips/123', () => {
      expect(isAuthPublicPath('/trips/123')).toBe(false)
    })

    it('FE-CLIENT-INTERCEPTOR-015: / (root)', () => {
      expect(isAuthPublicPath('/')).toBe(false)
    })
  })
})
