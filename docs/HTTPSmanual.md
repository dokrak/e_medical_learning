# HTTPS Setup Manual for chomthonghosp.com/elearning

**Med-KM (Medical Knowledge Management)**  
**Chomthong Hospital — E-Learning Platform**  
**Date:** March 22, 2026  

---

## Current State Summary

| Item | Status |
|------|--------|
| OS | AlmaLinux 9.7 |
| Web Server | Apache 2.4.62 |
| PHP | 8.2 (PHP-FPM) |
| mod_ssl | **NOT installed** |
| certbot (Let's Encrypt) | **NOT installed** |
| SELinux | Enabled (Enforcing) |
| Public IP | 61.19.146.5 → NAT → 10.0.0.7 |
| Domain | chomthonghosp.com / www.chomthonghosp.com |
| Application URL | http://www.chomthonghosp.com/elearning |
| API URL | http://www.chomthonghosp.com/api |
| Port 80 | Open (HTTP) |
| Port 443 | **Not configured** |

### Files That Will Be Modified

| File | Purpose |
|------|---------|
| `/etc/httpd/conf.d/e_medical_learning.conf` | Apache VirtualHost config |
| `/etc/httpd/conf/httpd.conf` | Apache main config |
| `/var/www/e_medical_learning/backend/laravel-real/public/.htaccess` | Laravel rewrite rules |
| `/var/www/e_medical_learning/frontend/.env` | Frontend API base URL |
| `/var/www/e_medical_learning/backend/laravel-real/.env` | Laravel application URL |

---

## Prerequisites

Before starting, ensure:

1. **DNS is configured**: `chomthonghosp.com` and `www.chomthonghosp.com` must resolve to the public IP `61.19.146.5` from the internet (not just from the internal network). Let's Encrypt validates the domain via HTTP from the internet.
2. **Port 443 is forwarded**: The network gateway/router that NATs `61.19.146.5` → `10.0.0.7` must also forward port 443 (not just port 80).
3. **sudo/root access** is required for Steps 2–5 and Step 8.

---

## Step 1 — Backup Current Configuration

Create backup copies of all config files so you can roll back instantly if anything breaks.

```bash
# Create backup directory with timestamp
BACKUP_DIR="/var/www/e_medical_learning/config-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup Apache configs
sudo cp /etc/httpd/conf.d/e_medical_learning.conf "$BACKUP_DIR/e_medical_learning.conf.bak"
sudo cp /etc/httpd/conf/httpd.conf "$BACKUP_DIR/httpd.conf.bak"

# Backup application configs
cp /var/www/e_medical_learning/backend/laravel-real/public/.htaccess "$BACKUP_DIR/.htaccess.bak"
cp /var/www/e_medical_learning/frontend/.env "$BACKUP_DIR/frontend.env.bak"
cp /var/www/e_medical_learning/backend/laravel-real/.env "$BACKUP_DIR/laravel.env.bak"

# Also keep copies right next to originals for quick rollback
sudo cp /etc/httpd/conf.d/e_medical_learning.conf /etc/httpd/conf.d/e_medical_learning.conf.bak
sudo cp /etc/httpd/conf/httpd.conf /etc/httpd/conf/httpd.conf.bak
cp /var/www/e_medical_learning/backend/laravel-real/public/.htaccess /var/www/e_medical_learning/backend/laravel-real/public/.htaccess.bak
cp /var/www/e_medical_learning/frontend/.env /var/www/e_medical_learning/frontend/.env.bak
cp /var/www/e_medical_learning/backend/laravel-real/.env /var/www/e_medical_learning/backend/laravel-real/.env.bak

echo "✅ Backup completed at: $BACKUP_DIR"
ls -la "$BACKUP_DIR"
```

**Verify:** Confirm all `.bak` files exist before proceeding.

---

## Step 2 — Install mod_ssl and certbot

Install the Apache SSL module and the Let's Encrypt certificate tool.

```bash
sudo dnf install -y mod_ssl certbot python3-certbot-apache
```

**Verify installation:**

```bash
rpm -q mod_ssl certbot python3-certbot-apache
```

Expected output: all three packages listed with version numbers (no "not installed" messages).

**Check that mod_ssl created ssl.conf:**

```bash
ls -la /etc/httpd/conf.d/ssl.conf
```

> **Note:** Installing mod_ssl will create `/etc/httpd/conf.d/ssl.conf` which enables `Listen 443` automatically.

---

## Step 3 — Open Firewall Port 443

Allow HTTPS traffic through the server firewall.

```bash
# Add HTTPS service permanently
sudo firewall-cmd --permanent --add-service=https

# Reload firewall to apply
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-services
```

**Expected output** should include both `http` and `https` in the services list.

> **IMPORTANT:** Also ensure your **network router/gateway** forwards port 443 from `61.19.146.5` to internal `10.0.0.7`. This is typically configured on the router admin interface, not on the Linux server. Contact your network administrator if needed.

---

## Step 4 — Obtain SSL Certificate (Let's Encrypt)

Use certbot with the Apache plugin to automatically obtain and configure the certificate.

```bash
sudo certbot --apache -d chomthonghosp.com -d www.chomthonghosp.com
```

**During the interactive prompt:**

1. Enter your email address (for renewal notifications)
2. Agree to the Terms of Service
3. Choose whether to share your email with EFF (optional)
4. Certbot will automatically:
   - Verify domain ownership via HTTP challenge
   - Download the certificate
   - Create an HTTPS VirtualHost in Apache
   - Configure SSL certificate paths

**Verify certificate was obtained:**

```bash
sudo certbot certificates
```

Expected output shows certificate for `chomthonghosp.com` with paths like:
- Certificate: `/etc/letsencrypt/live/chomthonghosp.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/chomthonghosp.com/privkey.pem`

> **If certbot fails** with a domain validation error, it means Let's Encrypt cannot reach your server on port 80 from the internet. Check DNS resolution and port forwarding.

---

## Step 5 — Update Apache Config for HTTP → HTTPS Redirect

After certbot runs, it may create a separate file (e.g., `e_medical_learning-le-ssl.conf`) or modify the existing config. You need to ensure:

1. **Port 80** redirects all traffic to HTTPS
2. **Port 443** serves the actual site

Edit `/etc/httpd/conf.d/e_medical_learning.conf`:

```bash
sudo nano /etc/httpd/conf.d/e_medical_learning.conf
```

Replace the entire contents with:

```apache
# HTTP → HTTPS redirect
<VirtualHost *:80>
    ServerName chomthonghosp.com
    ServerAlias www.chomthonghosp.com 10.0.0.7
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteCond %{HTTP_HOST} !^10\. [NC]
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]

    # Keep HTTP working for internal 10.0.0.7 access (optional — remove if not needed)
    DocumentRoot /var/www/e_medical_learning/backend/laravel-real/public

    Alias /elearning /var/www/e_medical_learning/frontend/dist
    Alias /app /var/www/e_medical_learning/frontend/dist
    <Directory /var/www/e_medical_learning/frontend/dist>
        Require all granted
        Options -Indexes
        RewriteEngine On
        RewriteBase /elearning/
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /elearning/index.html [L]
    </Directory>

    <Directory /var/www/e_medical_learning/backend/laravel-real/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/e_medical_learning_error.log
    CustomLog /var/log/httpd/e_medical_learning_access.log combined
</VirtualHost>

# HTTPS (main site)
<VirtualHost *:443>
    ServerName chomthonghosp.com
    ServerAlias www.chomthonghosp.com
    DocumentRoot /var/www/e_medical_learning/backend/laravel-real/public

    # SSL Configuration (paths from certbot — verify these match your actual paths)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/chomthonghosp.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/chomthonghosp.com/privkey.pem

    # Frontend SPA
    Alias /elearning /var/www/e_medical_learning/frontend/dist
    Alias /app /var/www/e_medical_learning/frontend/dist
    <Directory /var/www/e_medical_learning/frontend/dist>
        Require all granted
        Options -Indexes
        RewriteEngine On
        RewriteBase /elearning/
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /elearning/index.html [L]
    </Directory>

    # Laravel backend
    <Directory /var/www/e_medical_learning/backend/laravel-real/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    ErrorLog /var/log/httpd/e_medical_learning_ssl_error.log
    CustomLog /var/log/httpd/e_medical_learning_ssl_access.log combined
</VirtualHost>
```

**Check Apache syntax before restarting:**

```bash
sudo httpd -t
```

Must output: `Syntax OK`

> **Note:** If certbot created a separate `e_medical_learning-le-ssl.conf`, you may remove it and use the unified config above instead, or keep certbot's file and only modify the port 80 block for redirect.

---

## Step 6 — Update Application URLs (http → https)

### 6a. Frontend `.env`

```bash
nano /var/www/e_medical_learning/frontend/.env
```

Change:
```
VITE_API_BASE_URL=https://www.chomthonghosp.com/api
```

(was: `http://www.chomthonghosp.com/api`)

### 6b. Laravel `.env`

```bash
nano /var/www/e_medical_learning/backend/laravel-real/.env
```

Change:
```
APP_URL=https://www.chomthonghosp.com
```

(was: `http://www.chomthonghosp.com`)

### 6c. Laravel CORS / Sanctum (if applicable)

Check if `SANCTUM_STATEFUL_DOMAINS` or `SESSION_DOMAIN` is set in Laravel `.env` and ensure it uses the correct domain without a scheme:

```bash
grep -i "sanctum\|session_domain\|cors" /var/www/e_medical_learning/backend/laravel-real/.env
```

---

## Step 7 — Rebuild and Deploy Frontend

The frontend must be rebuilt because `VITE_API_BASE_URL` is embedded at build time.

```bash
cd /var/www/e_medical_learning/frontend

# Rebuild
npm run build

# Deploy to Laravel public
cp -r dist/* ../backend/laravel-real/public/build/

echo "✅ Frontend rebuilt and deployed with HTTPS API URL"
```

**Verify the new build uses HTTPS:**

```bash
grep -o "https://www.chomthonghosp.com" /var/www/e_medical_learning/frontend/dist/assets/index-*.js | head -1
```

Should show `https://www.chomthonghosp.com`.

---

## Step 8 — Test and Enable Auto-Renewal

### 8a. Restart Apache

```bash
sudo systemctl restart httpd
```

### 8b. Test HTTPS

```bash
# Test HTTPS is working
curl -I https://www.chomthonghosp.com/elearning/

# Test HTTP redirects to HTTPS
curl -I http://www.chomthonghosp.com/elearning/

# Test API endpoint over HTTPS
curl -s https://www.chomthonghosp.com/api/specialties | head -5
```

**Expected results:**
- HTTPS request → `200 OK`
- HTTP request → `301 Moved Permanently` with `Location: https://...`
- API returns JSON data

### 8c. Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Should output: `Congratulations, all simulated renewals succeeded`

### 8d. Verify Renewal Timer

```bash
sudo systemctl status certbot-renew.timer
```

The timer should be active and run approximately twice daily.

### 8e. Browser Test

Open in browser:
- `https://www.chomthonghosp.com/elearning` — should show the Med-KM app with a padlock icon
- `http://www.chomthonghosp.com/elearning` — should redirect to HTTPS automatically

---

## Rollback Procedure

If anything goes wrong, restore all configs and restart Apache:

```bash
# Restore Apache configs
sudo cp /etc/httpd/conf.d/e_medical_learning.conf.bak /etc/httpd/conf.d/e_medical_learning.conf

# Restore application configs
cp /var/www/e_medical_learning/frontend/.env.bak /var/www/e_medical_learning/frontend/.env
cp /var/www/e_medical_learning/backend/laravel-real/.env.bak /var/www/e_medical_learning/backend/laravel-real/.env

# Rebuild frontend with original HTTP URL
cd /var/www/e_medical_learning/frontend && npm run build
cp -r dist/* ../backend/laravel-real/public/build/

# Restart Apache
sudo systemctl restart httpd

echo "✅ Rolled back to HTTP configuration"
```

**Full rollback from timestamped backup:**

```bash
# Find backup directory
ls -d /var/www/e_medical_learning/config-backup-*

# Restore (replace YYYYMMDD-HHMMSS with actual timestamp)
BACKUP_DIR="/var/www/e_medical_learning/config-backup-YYYYMMDD-HHMMSS"
sudo cp "$BACKUP_DIR/e_medical_learning.conf.bak" /etc/httpd/conf.d/e_medical_learning.conf
sudo cp "$BACKUP_DIR/httpd.conf.bak" /etc/httpd/conf/httpd.conf
cp "$BACKUP_DIR/.htaccess.bak" /var/www/e_medical_learning/backend/laravel-real/public/.htaccess
cp "$BACKUP_DIR/frontend.env.bak" /var/www/e_medical_learning/frontend/.env
cp "$BACKUP_DIR/laravel.env.bak" /var/www/e_medical_learning/backend/laravel-real/.env

cd /var/www/e_medical_learning/frontend && npm run build
cp -r dist/* ../backend/laravel-real/public/build/

sudo systemctl restart httpd
```

---

## Certificate Renewal Notes

- Let's Encrypt certificates are valid for **90 days**
- Certbot auto-renews via systemd timer (runs twice daily, renews when < 30 days remain)
- No manual action needed after initial setup
- To manually renew: `sudo certbot renew`
- To check expiry: `sudo certbot certificates`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| certbot domain validation fails | Check DNS resolves to public IP; verify port 80 is open from internet |
| `ERR_CONNECTION_REFUSED` on port 443 | Check `firewall-cmd --list-services` includes https; check router port forward |
| Mixed content warnings in browser | Check all URLs use `https://` in `.env` files; rebuild frontend |
| API calls fail after HTTPS | Verify `VITE_API_BASE_URL` uses `https://`; rebuild frontend |
| Apache won't start after config change | Run `sudo httpd -t` to check syntax; restore from backup |
| SELinux blocks HTTPS | Run `sudo setsebool -P httpd_can_network_connect 1` |
| Certificate expired | Run `sudo certbot renew --force-renewal` |

---

*Manual prepared for Med-KM system, Chomthong Hospital*  
*Author: System Administrator*  
*Last updated: March 22, 2026*
