# Server-Side GTM on an Ubuntu VPS (Docker + Nginx + HTTPS)

A step-by-step guide to self-hosting a Google Tag Manager **server container**, the same thing Stape.io hosts for you. Written for a VPS where **Nginx already serves your store** on ports 80/443.

Domain used in this guide: `tweestfashion.com`. Replace it with your own if different.

---

## What you are building

```
Browser / Store
      |
      v
https://metrics.tweestfashion.com   --> Nginx (80/443, HTTPS via certbot)
https://preview.tweestfashion.com        |
                                          +--> sGTM tagging1  (127.0.0.1:8084)
                                          +--> sGTM tagging2  (127.0.0.1:8085)
                                          +--> sGTM preview   (127.0.0.1:8083)
```

- Google's official image `gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable` is the tracking engine.
- Docker runs 2 production instances plus 1 preview instance.
- Nginx handles HTTPS and load-balances between the two instances.

---

## Step 1. Create the server container in GTM

1. Open [tagmanager.google.com](https://tagmanager.google.com) and create a **Server** container.
2. Choose **Manually provision tagging server**.
3. Go to **Admin → Container Settings** and copy the **Container Config** string (long base64 text).

Keep this string private. It identifies your container.

---

## Step 2. Prepare the VPS

```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
```

Recommended hardening:

```bash
adduser deploy
usermod -aG sudo deploy

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

sudo apt install fail2ban unattended-upgrades -y
```

Minimum size: **2 GB RAM, 2 vCPU**. Three sGTM containers plus your MERN app need the memory.

---

## Step 3. Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
docker --version
docker compose version
```

---

## Step 4. Add DNS records

At your DNS provider, add two **A records** pointing to the VPS IP:

| Name | Type | Value |
|---|---|---|
| `metrics` | A | YOUR_SERVER_IP |
| `preview` | A | YOUR_SERVER_IP |

If you use Cloudflare, set them to **DNS only** (grey cloud) at first.

Verify:

```bash
curl -4 ifconfig.me                      # your VPS IP
dig +short metrics.tweestfashion.com
dig +short preview.tweestfashion.com
```

Both `dig` results must print the VPS IP before continuing.

---

## Step 5. Create the sGTM project folder

Use a separate folder so it doesn't mix with your store's code and `.env`.

```bash
mkdir -p ~/sgtm && cd ~/sgtm
```

**.env**

```bash
nano .env
```

```
CONTAINER_CONFIG=your_real_config_string
```

No quotes, no spaces around the value.

```bash
chmod 600 .env
```

**docker-compose.yml**

```bash
nano docker-compose.yml
```

```yaml
services:
  preview:
    image: gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable
    restart: always
    environment:
      CONTAINER_CONFIG: ${CONTAINER_CONFIG}
      RUN_AS_PREVIEW_SERVER: "true"
    ports:
      - "127.0.0.1:8083:8080"

  tagging1:
    image: gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable
    restart: always
    environment:
      CONTAINER_CONFIG: ${CONTAINER_CONFIG}
      PREVIEW_SERVER_URL: "https://preview.tweestfashion.com"
    ports:
      - "127.0.0.1:8084:8080"

  tagging2:
    image: gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable
    restart: always
    environment:
      CONTAINER_CONFIG: ${CONTAINER_CONFIG}
      PREVIEW_SERVER_URL: "https://preview.tweestfashion.com"
    ports:
      - "127.0.0.1:8085:8080"
```

Notes:

- `PREVIEW_SERVER_URL` **must** be a valid `https://` URL, or the container crashes with "Invalid preview server URL".
- Ports are bound to `127.0.0.1` so they are not exposed to the internet. Only Nginx is public.
- Use `platform: linux/amd64` only on Apple Silicon Macs. Not needed on an x86 VPS.
- Indentation matters. Use spaces, never tabs.

---

## Step 6. Start the containers

```bash
docker compose up -d
sleep 20
docker compose ps
```

Wait until all three show `(healthy)`. Then test:

```bash
curl http://127.0.0.1:8084/healthz
curl http://127.0.0.1:8085/healthz
curl http://127.0.0.1:8083/healthz
```

Each returns `ok`. The containers need 10 to 30 seconds after starting, so an immediate curl may show "Connection reset".

---

## Step 7. Configure Nginx

Nginx already owns ports 80/443 (your store), so reuse it instead of running another web server.

```bash
export DOMAIN=tweestfashion.com

sudo tee /etc/nginx/sites-available/sgtm > /dev/null <<EOF
upstream sgtm_tagging {
    server 127.0.0.1:8084;
    server 127.0.0.1:8085;
}

server {
    listen 80;
    server_name metrics.$DOMAIN;

    location / {
        proxy_pass http://sgtm_tagging;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 80;
    server_name preview.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8083;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
```

The backslashes before `$host` etc. are intentional.

Enable it and **test before reloading**:

```bash
sudo ln -s /etc/nginx/sites-available/sgtm /etc/nginx/sites-enabled/
sudo nginx -t
```

Only if it says "syntax is ok":

```bash
sudo systemctl reload nginx
```

If `nginx -t` fails, do not reload. Fix the error first so your store stays up.

---

## Step 8. Get HTTPS certificates

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d metrics.$DOMAIN -d preview.$DOMAIN
```

Choose the redirect-to-HTTPS option. Then verify:

```bash
curl https://metrics.$DOMAIN/healthz
curl https://preview.$DOMAIN/healthz
```

Both return `ok`.

Check that auto-renewal works:

```bash
sudo certbot renew --dry-run
```

---

## Step 9. Connect GTM

1. Server container → **Admin → Container Settings → Server container URL** → `https://metrics.tweestfashion.com`
2. Click **Preview**. Tag Assistant connects through `preview.tweestfashion.com`.
3. Send a test hit:

```bash
curl "https://metrics.tweestfashion.com/g/collect?v=2&tid=G-XXXXXXX&cid=123.456&en=page_view&dl=https%3A%2F%2Fexample.com%2F"
```

Use your real GA4 Measurement ID. A `page_view` should appear in Preview.

---

## Step 10. Point your store at the server

In the Google tag config (code):

```js
gtag('config', 'G-XXXXXXX', {
  server_container_url: 'https://metrics.tweestfashion.com'
});
```

Or in the web GTM container, add `server_container_url` under the Google tag's configuration settings.

---

## Step 11. Add tags in the server container

Hits do nothing until a tag handles them:

- **GA4 tag**, triggered by the GA4 client
- **Meta Conversions API** for `purchase`, `add_to_cart`, `initiate_checkout`
- Optional: TikTok Events API, Google Ads conversions

When Preview shows everything working, click **Submit → Publish** on the server container.

---

## Step 12. Optional: same-origin path (`yourstore.com/metrics`)

Better first-party cookie lifetime, especially on Safari. Add this inside your store's existing Nginx `server { }` block:

```nginx
location /metrics/ {
    proxy_pass http://sgtm_tagging/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The trailing slash after `sgtm_tagging/` strips `/metrics`. The `upstream sgtm_tagging` block from Step 7 must exist at the `http` level.

Then set **Server container URL** to `https://yourstore.com/metrics`, and in code:

```js
server_container_url: 'https://yourstore.com/metrics'
```

Tips:

- Don't cache `/metrics/*` in any CDN or page cache.
- Pick a path ad-block lists won't target (avoid `/analytics`, `/gtm`, `/track`).
- If your store's domain differs from `tweestfashion.com`, `metrics.tweestfashion.com` is third-party for it, so this step matters more.

---

## Maintenance

```bash
cd ~/sgtm

docker compose ps                       # status
docker compose logs -f tagging1         # logs
docker compose pull && docker compose up -d    # update images
docker compose restart                  # restart all
```

Also:

- Add an uptime monitor (UptimeRobot) on `https://metrics.tweestfashion.com/healthz`.
- Back up `docker-compose.yml` and `.env`.
- Never commit `.env` to Git.
- Disable SSH password login once key login works.

---

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Failed to decode the container config` | `CONTAINER_CONFIG` is a placeholder, wrong string, or the `.env` is in a different folder |
| `Invalid preview server URL` | `PREVIEW_SERVER_URL` is not a valid `https://` URL |
| `additional properties 'tagging' not allowed` | YAML indentation error. Services must be indented 2 spaces under `services:` |
| `address already in use` on port 80 | Nginx/Apache already owns it. Don't add Caddy, use Nginx as in Step 7 |
| `Connection refused` on 8080/8081/8082 | Containers not running, wrong folder, or crashed. Run `docker ps -a` and read `docker compose logs` |
| `Connection reset by peer` right after start | Containers still starting. Wait 20 to 30 seconds |
| `SSL: no alternative certificate subject name` | You curled a placeholder domain, or certbot hasn't issued a cert for that name yet |
| Certbot fails | DNS not pointing to the VPS yet, or ports 80/443 blocked by `ufw` or the provider's firewall |
| Preview won't connect in GTM | `PREVIEW_SERVER_URL` doesn't match `https://preview.tweestfashion.com`. Fix it, then `docker compose up -d --force-recreate tagging1 tagging2` |
| Hits arrive but no tag fires | The server container needs a tag with a trigger on the GA4 client events |
| Out of memory | Check `free -h`. Remove `tagging2` or upgrade the VPS |

---

## Local testing (optional, on your Mac)

1. Install Docker Desktop or `brew install colima docker docker-compose && colima start`.
2. Use the same compose file with `platform: linux/amd64` on each service and no `PREVIEW_SERVER_URL` at first.
3. `docker compose up`, then `curl http://localhost:8084/healthz`.
4. For GTM Preview, run `cloudflared tunnel --url http://localhost:8081`, then set that `https://` URL as `PREVIEW_SERVER_URL` and recreate the tagging container.
5. Run `cloudflared tunnel --url http://localhost:8080` and use that URL as the **Server container URL**.

Quick tunnel URLs change every time `cloudflared` restarts, so update both values each session.

---

## Production checklist

- [ ] Server container created, config string copied
- [ ] DNS A records for `metrics` and `preview` resolve to the VPS
- [ ] Firewall allows 80/443
- [ ] Containers `healthy`, all three `/healthz` checks return `ok`
- [ ] Nginx config tested (`nginx -t`) and reloaded
- [ ] HTTPS issued for both subdomains, auto-renew dry run passes
- [ ] `PREVIEW_SERVER_URL` is the real `https://preview.tweestfashion.com`
- [ ] Server container URL set in GTM, Preview works
- [ ] GA4 / Meta CAPI tags added and tested
- [ ] Server container published
- [ ] Uptime monitor and backups in place
- [ ] Consent handling (GDPR and similar) still applied. Server-side doesn't remove that requirement