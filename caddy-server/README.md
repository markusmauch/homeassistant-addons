# Caddy Server Add-on for Home Assistant

[![Caddy](https://caddyserver.com/resources/images/caddy-circle-lock.svg)](https://caddyserver.com)

## 📝 About
This is a **Home Assistant add-on** that runs [Caddy](https://caddyserver.com), a powerful and easy-to-use **reverse proxy and web server** with automatic **Let's Encrypt SSL**.

With this add-on, you can:
- **Expose Home Assistant securely** over the internet.
- **Use automatic HTTPS** (via Let's Encrypt).
- **Redirect HTTP to HTTPS** automatically.
- **Set up custom reverse proxy rules**.

---

## 📦 Installation

### **1️⃣ Add the Repository**
1. Open **Home Assistant**.
2. Go to **Settings** → **Add-ons** → **Add-on Store**.
3. Click **⋮ (top-right menu)** → **Repositories**.
4. Enter:
5. Click **Add** and wait for the repository to load.

### **2️⃣ Install the Add-on**
1. Search for **Caddy Server** in the **Add-on Store**.
2. Click **Install**.
3. Once installed, go to the **Configuration** tab.

### **3️⃣ Configure Caddy**
1. Add your custom **Caddyfile** in Home Assistant’s `/config/caddy/Caddyfile`.
2. Example Caddyfile:
```caddyfile
{
  email your-email@example.com
}

http:// {
  redir https://{host}{uri}
}

https:// {
  reverse_proxy localhost:8123
}
