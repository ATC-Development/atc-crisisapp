# ATC Crisis Management App

The **ATC Crisis Management App** is a mission-critical, offline-capable **Progressive Web App (PWA)** built for mobile use during crisis events across ATC properties.

**Production URL:** https://atc-development.github.io/atc-crisisapp/

---

## 📱 Features

- 🔒 **No application database** — self-contained frontend hosted on GitHub Pages
- 📦 **Offline-first** — works without connectivity and syncs when online
- 🔄 **Automatic update detection** — refreshes cached assets when a new version is deployed
- ✅ **Mobile-optimized crisis checklists**
- 📞 **Click-to-call** emergency contacts (e.g., Call 911)
- 📝 **Incident & witness reporting** with photo support
- 📤 Submissions are processed via **Power Automate** and stored in **SharePoint**
- 💬 **Leadership notifications** delivered through **Microsoft Teams**

### Crisis Categories

- Fire / Evacuation
- Security / Intruder / Active Threat
- Cyber Attack
- Severe Weather / Natural Disaster
- Medical / Health Emergency
- Other / General Incident

---

## 🧰 Tech Stack

**Frontend**

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- PWA (service worker / Workbox)

**Platform Services**

- Microsoft Entra ID (Azure AD)
- Microsoft Power Automate
- Microsoft Graph
- SharePoint Online
- Microsoft Teams

**Hosting**

- [GitHub Pages](https://pages.github.com/)

---

## 🚀 Setup (Local Development)

```bash
npm install
npm run dev
```

---

## 🔄 Versioning & Cache Busting (Critical)

This app uses a browser-based version check (`__APP_VERSION__`) to detect new deployments and force a reload of cached assets.

> ⚠️ **Important:** You must manually update the `version` field in `package.json` before each deploy to ensure clients receive the latest version.

Recommended deploy flow:

```bash
npm version patch
npm run build
git add .
git commit -m "Bump version"
git push
npm run deploy
```

This ensures users receive the latest version without needing to clear their browser cache.

---

## 🔐 Security (High-Level)

- Authentication via **Microsoft Entra ID**
- Submissions include a bearer token
- Backend verifies the user account is **active** before processing
- Fail-closed behavior: if validation can’t be completed, processing stops

---

## 🧩 System Summary

1. User signs in via Entra ID
2. User completes checklist and/or submits a report
3. App sends report payload + token to Power Automate
4. Power Automate validates identity, stores data in SharePoint, and sends Teams notifications

---

## ⚠️ Change Control Notice

This is a **mission-critical safety system**.

- Do not change authentication/authorization/notification logic casually
- Do not deploy during live incidents or severe weather events
- Test changes in a controlled environment

If you are unsure whether a change is safe, **do not deploy it**.

---

## 📄 Documentation

Additional documentation lives alongside this repository (or in your internal doc set):

- Operational Runbook
- Security Model Summary
- Common Failure Scenarios
- Change Control Expectations
- Architecture Diagram
