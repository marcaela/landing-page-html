# marcaela/landing-page-html

A simple, responsive landing page template with:
- Hero section with CTA
- Features grid layout
- Smooth scrolling
- Dark mode support
- Social media meta tags

## Features
- Responsive design (mobile-friendly)
- Dark theme toggle via `prefers-color-scheme`
- Form data persists across refreshes via localStorage
- Accessibility: keyboard focus styles, `prefers-reduced-motion` support
- Optimized for social sharing

## How to Use
1. Clone repository
2. Open `index.html` in browser
3. Customize content in HTML/JS sections

## Local Development
To test locally with a simple static server:
```bash
# Python 3
python3 -m http.server 8000
# Or use npx serve
npx serve .
```
Open `http://localhost:8000` in your browser.

## Dark Mode
Activated automatically based on `prefers-color-scheme` media query.