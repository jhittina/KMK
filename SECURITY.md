# Security Enhancements Documentation

This document outlines the enterprise-level security features implemented in the Karalaya authentication system.

## 🔒 Security Features

### 1. **Token-Based Authentication with JWT**

- **Secure Token Generation**: Tokens include issuer, audience, and timestamp
- **Token Expiration**: Default 7 days (configurable via `JWT_EXPIRE` env variable)
- **Enhanced Token Verification**: Multi-layer validation including expiration, blacklist, and password change checks

### 2. **Token Blacklisting (Logout Security)**

- All logged-out tokens are added to a blacklist
- Blacklisted tokens are automatically rejected
- TTL (Time To Live) indexing - tokens auto-delete from blacklist after expiration
- Supports multiple logout scenarios:
  - Single device logout (`POST /api/auth/logout`)
  - All devices logout (`POST /api/auth/logout-all`)

### 3. **Brute Force Protection**

- **Rate Limiting by Email**: Max 5 failed attempts per email in 15 minutes
- **Rate Limiting by IP**: Max 10 failed attempts per IP in 15 minutes
- **Account Locking**: Account locked for 15 minutes after 5 failed attempts
- **Login Attempt Tracking**: All attempts logged with IP, user agent, and reason
- **Automatic Cleanup**: Failed attempts auto-expire after 15 minutes

### 4. **Advanced Rate Limiting**

- **Global API Rate Limit**: 1000 requests per 15 minutes per IP
- **Endpoint-Specific Limits**: Stricter limits on auth endpoints
- **DDoS Protection**: Automatic IP blocking on suspicious activity

### 5. **Input Sanitization**

- **MongoDB Injection Prevention**: Strips `$` operators from all inputs
- **XSS Protection**: Sanitizes user inputs
- **Applied Globally**: All request bodies, queries, and params sanitized

### 6. **Security Headers**

- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-XSS-Protection**: Enabled
- **Content-Security-Policy**: Restricts content sources
- **Referrer-Policy**: Strict origin policy
- **X-Powered-By**: Removed (hides Express.js)

### 7. **Password Security**

- **Strong Hashing**: bcrypt with salt rounds of 12
- **Password Change Tracking**: `lastPasswordChange` field invalidates old tokens
- **Minimum Requirements**: 6 characters (configurable)
- **Password Verification**: Constant-time comparison

### 8. **Session Management**

- **Last Login Tracking**: Records last login time and IP
- **Account Status Monitoring**: Active/inactive account checks
- **Token Invalidation on Password Change**: All existing tokens become invalid

### 9. **Enhanced Token Verification**

- **Multi-Layer Checks**:
  1. Token exists
  2. Token not blacklisted
  3. Token signature valid
  4. Token not expired
  5. User exists
  6. User is active
  7. Password not changed after token issued
- **Detailed Error Messages**: Clear feedback on authentication failures

### 10. **Frontend Security**

- **Auto-Logout on Token Issues**: Automatic redirect to login on 401 errors
- **Secure Token Storage**: localStorage with automatic cleanup
- **Request Interceptors**: Automatic token injection
- **Response Interceptors**: Handles auth errors globally

## 📊 Database Models

### TokenBlacklist

```javascript
{
  token: String (indexed),
  userId: ObjectId,
  reason: "logout" | "security" | "expired" | "compromised",
  expiresAt: Date (TTL index),
  ip: String,
  userAgent: String
}
```

### LoginAttempt

```javascript
{
  email: String (indexed),
  ip: String (indexed),
  success: Boolean,
  userAgent: String,
  reason: String,
  expiresAt: Date (TTL index)
}
```

### User (Enhanced)

```javascript
{
  // ... existing fields ...
  lastPasswordChange: Date,
  lastLogin: Date,
  lastLoginIp: String,
  failedLoginAttempts: Number,
  accountLockedUntil: Date
}
```

## 🛡️ API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (sanitized, rate-limited)
- `POST /api/auth/login` - Login (brute force protected, rate-limited)
- `POST /api/auth/logout` - Logout current session (blacklists token)
- `POST /api/auth/logout-all` - Logout all sessions (invalidates all tokens)
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/change-password` - Change password (protected, sanitized)

## 🔧 Configuration

### Environment Variables

```env
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
```

### Rate Limit Configuration

Located in `/backend/src/middleware/security.middleware.js`:

```javascript
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS_PER_EMAIL: 5,
  MAX_ATTEMPTS_PER_IP: 10,
  LOCKOUT_DURATION_MINUTES: 15,
  ATTEMPT_WINDOW_MINUTES: 15,
};
```

## 🚨 Security Best Practices

1. **Never commit `.env` files** - Keep secrets secret
2. **Use strong JWT secrets** - Minimum 32 characters, random
3. **Enable HTTPS in production** - Always use TLS/SSL
4. **Regular security audits** - Review logs and attempt patterns
5. **Monitor blacklist size** - Ensure TTL indexes are working
6. **Update dependencies** - Keep packages up to date
7. **Use environment-specific configs** - Different settings for dev/prod

## 📈 Performance Considerations

- **MongoDB Indexes**: All security collections have proper indexes
- **TTL Indexes**: Auto-cleanup of expired data reduces DB size
- **In-Memory Rate Limiting**: Fast lookups without DB queries
- **Efficient Token Verification**: Early exits on common failures

## 🔍 Monitoring & Logging

All security events are logged:

- Failed login attempts
- Account lockouts
- Token blacklisting
- Suspicious activity patterns
- Rate limit triggers

Check server logs regularly for security insights.

## 🛠️ Troubleshooting

### Account Locked

- Wait 15 minutes or contact admin to unlock
- Check `accountLockedUntil` field in User model

### Token Issues

- Clear localStorage and login again
- Check if token is blacklisted in TokenBlacklist collection
- Verify `lastPasswordChange` hasn't invalidated token

### Rate Limiting

- Wait for the time window to expire (15 minutes)
- Check IP-based and email-based limits separately
- Review LoginAttempt collection for patterns

## 🔐 Security Incident Response

If you suspect a security breach:

1. Run `POST /api/auth/logout-all` to invalidate all tokens
2. Force password reset for affected users
3. Review LoginAttempt logs for suspicious patterns
4. Check TokenBlacklist for unusual activity
5. Update JWT_SECRET and redeploy (invalidates all tokens)

## 📝 Additional Notes

- All tokens are invalidated when user changes password
- Blacklisted tokens are automatically removed after expiration
- Login attempts are tracked even for non-existent users (prevents enumeration)
- Failed login attempts reset on successful login
- Account locks expire automatically after 15 minutes

## 🎯 Future Enhancements

Consider implementing:

- Two-Factor Authentication (2FA)
- Email notifications for suspicious activity
- Geolocation-based login alerts
- Session management dashboard
- Advanced anomaly detection
- CAPTCHA for repeated failed attempts
