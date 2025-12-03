# Security Policy

## Supported Versions

Only the latest version of YouTube Monitor receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

### Application Security
- **Helmet Security Headers**: XSS protection, CSP, HSTS, clickjacking prevention
- **Rate Limiting**: 100 requests per 15 minutes per IP, 10 registrations per hour
- **Input Validation**: All API inputs validated and sanitized using express-validator
- **SQL Injection Prevention**: Parameterized queries with sql.js
- **XSS Prevention**: Input sanitization and Content Security Policy
- **CORS Restrictions**: Only localhost origins allowed
- **API Key Authentication**: UUID format validation and device ownership verification

### Electron Security
- **Context Isolation**: Enabled by default
- **Remote Module**: Disabled
- **External Navigation**: Blocked
- **New Windows**: Creation disabled
- **WebView**: Attachments disabled
- **Web Security**: Enabled

### Data Security
- **Password Hashing**: bcryptjs with salt rounds
- **Local Storage**: All data stored locally in SQLite
- **No External APIs**: No data transmitted to third parties
- **API Key Generation**: Cryptographically secure UUIDs

## Known Limitations

### Transitive Dependency Warnings

You may see deprecation warnings during `npm install` for packages like:
- `inflight`, `glob`, `rimraf`, `npmlog`, `gauge`, `are-we-there-yet`, `boolean`

These are **transitive dependencies** (dependencies of electron-builder) and do NOT affect the security or functionality of the application. They will be resolved when electron-builder updates its dependencies.

**Why these warnings exist:**
- These packages are used by electron-builder for building installers
- They are NOT used at runtime
- They do NOT have access to user data
- They do NOT affect the running application

**What we've done:**
- Added `overrides` in package.json to force newer versions where possible
- Monitored npm audit for actual runtime vulnerabilities
- Used only well-maintained, secure packages for runtime dependencies

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly (check repository for contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Time
- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix release: Within 30 days for critical issues

## Security Updates

Security updates are released as patch versions (1.0.x) and announced via:
- GitHub Releases
- Repository README
- Security advisories

## Best Practices for Users

1. **Keep Updated**: Always run the latest version
2. **Strong Passwords**: Use passwords with 12+ characters
3. **Local Network**: API server only accessible from localhost
4. **Firewall**: Ensure Windows Firewall is enabled
5. **Admin Rights**: Run with standard user privileges (not admin)
6. **Backup**: Regularly backup your database file

## Audit Trail

| Date       | Action                        | Version |
|------------|-------------------------------|----------|
| 2025-12-03 | Initial security implementation | 1.0.0    |
| 2025-12-03 | Added dependency overrides     | 1.0.0    |
| 2025-12-03 | Security documentation added   | 1.0.0    |

## Dependencies Audit

Runtime dependencies (used when app is running):
- express: ^4.19.2 - Well maintained, no known vulnerabilities
- cors: ^2.8.5 - Stable, no known vulnerabilities
- sql.js: ^1.11.0 - Active development, no known vulnerabilities
- uuid: ^10.0.0 - Well maintained, no known vulnerabilities
- bcryptjs: ^2.4.3 - Stable, widely used, no known vulnerabilities
- helmet: ^7.1.0 - Security-focused, actively maintained
- express-rate-limit: ^7.1.5 - Security-focused, actively maintained
- express-validator: ^7.0.1 - Security-focused, actively maintained

Development dependencies (only used for building):
- electron: ^28.3.1 - Latest stable, regular security updates
- electron-builder: ^25.0.5 - Latest version, transitive dep warnings are cosmetic

## Security Checklist

- [x] Helmet security headers enabled
- [x] Rate limiting configured
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS prevention
- [x] CORS restrictions
- [x] API key authentication
- [x] Password hashing
- [x] Electron security hardening
- [x] No external data transmission
- [x] Local-only API server
- [x] Dependency overrides for known issues
- [x] Security documentation

---

**Last Updated**: December 3, 2025  
**Security Level**: Production-Ready  
**Audit Status**: Passed
