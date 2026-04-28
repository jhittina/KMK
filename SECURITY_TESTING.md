# Security Testing Guide

This guide provides instructions for testing the security features of the Karalaya application.

## Prerequisites

- Backend server running on `http://localhost:5001`
- MongoDB running
- Valid test user account

## Test Scenarios

### 1. Basic Authentication Flow

#### Test Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@karalaya.com",
    "password": "admin123"
  }'
```

**Expected**: Success with token and user data

---

### 2. Token Validation

#### Test Protected Endpoint without Token

```bash
curl -X GET http://localhost:5001/api/auth/me
```

**Expected**: 401 Unauthorized

#### Test Protected Endpoint with Token

```bash
TOKEN="your_token_here"
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 200 OK with user data

---

### 3. Logout and Token Blacklisting

#### Test Logout

```bash
TOKEN="your_token_here"
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 200 OK with success message

#### Try Using Blacklisted Token

```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 401 Unauthorized - "Token has been revoked"

---

### 4. Brute Force Protection

#### Test Multiple Failed Login Attempts

```bash
# Attempt 1-5 (wrong password)
for i in {1..5}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }'
  echo -e "\n"
done

# Attempt 6 (should be blocked)
echo "Attempt 6 (should be blocked):"
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "correctpassword"
  }'
```

**Expected**:

- Attempts 1-4: 401 with attempts remaining
- Attempt 5: 423 Account locked
- Attempt 6: 423 Account locked even with correct password

---

### 5. Rate Limiting (IP-based)

#### Test IP Rate Limit

```bash
# Make 11 failed attempts from same IP
for i in {1..11}; do
  echo "IP Attempt $i:"
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"user$i@example.com\",
      \"password\": \"wrongpassword\"
    }"
  echo -e "\n"
done
```

**Expected**: After 10 attempts, 429 Too Many Requests

---

### 6. MongoDB Injection Prevention

#### Test Injection Attack

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": {"$ne": null}
  }'
```

**Expected**: 401 Unauthorized (injection prevented by sanitization)

---

### 7. Token Expiration

#### Generate Token and Wait

```bash
# Set JWT_EXPIRE=1s in .env for testing
TOKEN="expired_token_here"
sleep 2
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 401 Unauthorized - "Token has expired"

---

### 8. Password Change Invalidates Tokens

#### Login and Get Token

```bash
LOGIN_RESPONSE=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "oldpassword"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
```

#### Change Password

```bash
curl -X PUT http://localhost:5001/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }'
```

#### Try Using Old Token

```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 401 Unauthorized - "Password was recently changed"

---

### 9. Logout from All Devices

#### Login from Multiple "Devices"

```bash
# Device 1
TOKEN1=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

# Device 2
TOKEN2=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.data.token')
```

#### Logout from All Devices

```bash
curl -X POST http://localhost:5001/api/auth/logout-all \
  -H "Authorization: Bearer $TOKEN1"
```

#### Try Using Both Tokens

```bash
# Token 1
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN1"

# Token 2
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN2"
```

**Expected**: Both return 401 Unauthorized

---

### 10. Security Headers Test

#### Check Response Headers

```bash
curl -I http://localhost:5001/health
```

**Expected Headers**:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; frame-ancestors 'none'`
- No `X-Powered-By` header

---

### 11. Forged Token Test

#### Create Fake Token

```bash
FAKE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $FAKE_TOKEN"
```

**Expected**: 401 Unauthorized - "Invalid token"

---

### 12. Account Status Test

#### Deactivate Account (Admin Only)

```bash
ADMIN_TOKEN="admin_token_here"
USER_ID="user_id_to_deactivate"

curl -X PUT http://localhost:5001/api/auth/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

#### Try Logging in with Deactivated Account

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deactivated@example.com",
    "password": "correctpassword"
  }'
```

**Expected**: 403 Forbidden - "Account has been deactivated"

---

## Automated Testing Script

Create `test-security.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5001/api"
TEST_EMAIL="security-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123"

echo "🔒 Starting Security Tests..."
echo "================================"

# Test 1: Register
echo -e "\n✅ Test 1: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Security Test\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"phone\": \"1234567890\"
  }")
echo $REGISTER_RESPONSE | jq .

# Test 2: Login
echo -e "\n✅ Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token obtained: ${TOKEN:0:20}..."

# Test 3: Access Protected Route
echo -e "\n✅ Test 3: Access Protected Route"
curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 4: Logout
echo -e "\n✅ Test 4: Logout"
curl -s -X POST $API_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 5: Try Using Blacklisted Token
echo -e "\n✅ Test 5: Try Blacklisted Token"
curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 6: Brute Force Protection
echo -e "\n✅ Test 6: Brute Force Protection"
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"wrongpassword\"
    }" | jq -c '{success, message, attemptsRemaining}'
done

echo -e "\n================================"
echo "✅ Security Tests Completed!"
```

Make executable and run:

```bash
chmod +x test-security.sh
./test-security.sh
```

---

## Database Verification

### Check Blacklisted Tokens

```javascript
// In MongoDB shell
use karalaya
db.tokenblacklists.find().pretty()
```

### Check Login Attempts

```javascript
db.loginattempts.find().sort({ createdAt: -1 }).limit(10).pretty();
```

### Check User Security Fields

```javascript
db.users
  .find(
    {},
    {
      email: 1,
      lastLogin: 1,
      lastLoginIp: 1,
      failedLoginAttempts: 1,
      accountLockedUntil: 1,
      lastPasswordChange: 1,
    },
  )
  .pretty();
```

---

## Security Monitoring

### View Recent Login Attempts

```javascript
db.loginattempts.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 3600000) } } },
  {
    $group: {
      _id: { email: "$email", success: "$success" },
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1 } },
]);
```

### View Blacklisted Tokens

```javascript
db.tokenblacklists.aggregate([
  {
    $group: {
      _id: "$reason",
      count: { $sum: 1 },
    },
  },
]);
```

---

## Performance Testing

### Test Rate Limit Performance

```bash
# Install apache bench: brew install httpd (macOS)
ab -n 2000 -c 50 -p login.json -T application/json \
  http://localhost:5001/api/auth/login
```

Where `login.json`:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## Expected Security Behavior

✅ **Login**: Should work with correct credentials
✅ **Failed Attempts**: Track and limit (5 per email, 10 per IP)
✅ **Account Locking**: Auto-lock after 5 failed attempts for 15 minutes
✅ **Token Validation**: Multi-layer checks including blacklist
✅ **Logout**: Token added to blacklist, immediately invalid
✅ **Password Change**: Invalidates all existing tokens
✅ **Rate Limiting**: Global API limit + auth-specific limits
✅ **Input Sanitization**: Prevents injection attacks
✅ **Security Headers**: All protective headers present
✅ **Forged Tokens**: Rejected with detailed error messages

---

## Troubleshooting

### Tokens Not Expiring

- Check MongoDB TTL index: `db.tokenblacklists.getIndexes()`
- Ensure MongoDB version supports TTL indexes (2.2+)

### Rate Limiting Not Working

- Verify `trust proxy` setting in server.js
- Check IP extraction in middleware

### Account Stays Locked

- Wait for `accountLockedUntil` to pass
- Or manually unlock in DB: `db.users.updateOne({email: "..."}, {$set: {accountLockedUntil: null, failedLoginAttempts: 0}})`

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Token blacklisting works
- [ ] Brute force protection active
- [ ] Rate limiting functional
- [ ] Input sanitization prevents injection
- [ ] Security headers present
- [ ] HTTPS enabled (production)
- [ ] Logs monitored regularly
- [ ] Failed attempts tracked
- [ ] Account locking works
- [ ] Password change invalidates tokens
- [ ] Logout from all devices works
