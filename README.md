# ATC Crisis Management App

This is a self-contained, offline-capable React + Vite Progressive Web App (PWA) built for mobile use during crisis events across ATC properties.

## 📱 Features

- 🔒 No database – fully self-contained and hosted
- 🔄 Checks for updates when online
- 📦 Falls back to offline version when needed
- ✅ Mobile-optimized checklists for crisis categories:
  - Fire
  - Security
  - Cyber Attack
  - Severe Weather
  - Medical Emergency
  - Other
- 📞 Click-to-call for emergency contacts
- 📝 Form completion and PDF generation for HR distribution
- 📤 Form data is:
  - Sent via Microsoft 365 authenticated email to HR
  - Stored in SharePoint via Power Automate

## 🧰 Tech Stack

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/)
- [GitHub Pages (for deployment)](https://pages.github.com/)

## 🚀 Setup

```bash
npm install
npm run dev
```

## 🔄 Versioning and Cache Busting

This app uses a browser-based version check (`__APP_VERSION__`) to detect new deployments and force a reload of cached assets.

> ⚠️ **Important:** You must manually update the `version` field in `package.json` before each deploy to ensure clients receive the latest version.

```bash
npm version patch
```

This ensures users always receive the latest version without needing to clear their browser cache.
