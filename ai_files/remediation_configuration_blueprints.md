# Pentera-Style Remediation Configuration Blueprints

## 1. Network Protocol Hardening (LLMNR / NetBIOS / mDNS)
### PowerShell Command (Local Machine)
```powershell
# Disable LLMNR via Windows Registry
New-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Force
New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Name EnableMulticast -Value 0 -PropertyType DWord -Force

# Disable NetBIOS on all active network adapters
$adapters = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled=TRUE"
foreach ($nic in $adapters) {
    $nic.SetTcpipNetbios(2) # 2 = Disable NetBIOS
}
```

### Group Policy Object (GPO) for Enterprise Domain
1. Open `gpmc.msc` (Group Policy Management Console).
2. Edit Default Domain Policy or create a dedicated Hardening GPO.
3. Navigate to: `Computer Configuration -> Administrative Templates -> Network -> DNS Client`.
4. Locate `Turn Off Multicast Name Resolution` and set to **Enabled**.
5. Navigate to: `Network -> Lanman Workstation` -> Enable SMB signing.
6. Run `gpupdate /force` on domain members to enforce.

---

## 2. Web Application Security Headers (Nginx & Web Servers)
### Nginx Hardening Configuration (`/etc/nginx/conf.d/security.conf`)
```nginx
# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Prevent Clickjacking
add_header X-Frame-Options "DENY" always;

# Strict Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self';" always;

# Enforce Strict Transport Security (HSTS) - 1 year with subdomains & preload
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Referrer Policy & Permissions Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Remove version disclosure
server_tokens off;
```

---

## 3. Application Hardening (Node.js / Express)
### Express Security Middleware Blueprint
```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 1. Comprehensive Helmet headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// 2. Strict CORS policy
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://app.domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Rate limiting for brute-force prevention
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
```

---

## 4. Verification & Validation Commands
- **Check Headers**: `curl -i -s -k https://target.domain/api/health | head -n 25`
- **Verify CSP**: `curl -i -s -k https://target.domain/ | grep -i "content-security-policy"`
- **Verify LLMNR Disabled**: Run in PowerShell: `Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Name EnableMulticast` (Expected: 0)
