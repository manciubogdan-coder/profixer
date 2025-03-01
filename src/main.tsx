
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload critical fonts immediately
const fontPreload = document.createElement('link');
fontPreload.rel = 'preload';
fontPreload.as = 'font';
fontPreload.type = 'font/woff2';
fontPreload.href = '/fonts/inter-var.woff2';
fontPreload.crossOrigin = 'anonymous';
document.head.appendChild(fontPreload);

// Immediate inline critical CSS focused on LCP
document.head.insertAdjacentHTML('beforeend', `
  <style id="critical-css">
    /* Critical CSS focused on LCP element */
    .text-4xl{font-size:2.25rem;line-height:2.5rem}
    .md\\:text-5xl{font-size:3rem;line-height:1}
    .font-bold{font-weight:700}
    .text-white{color:white}
    .mb-4{margin-bottom:1rem}
    .inline-block{display:inline-block}
    .bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}
    .from-primary{--tw-gradient-from:#9333EA;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,rgb(147 51 234/0))}
    .to-purple-400{--tw-gradient-to:rgb(192 132 252)}
    .text-transparent{color:transparent}
    .bg-clip-text{-webkit-background-clip:text;background-clip:text}
    .bg-secondary{background-color:hsl(217.2 32.6% 17.5%)}
    .relative{position:relative}
    .z-10{z-index:10}
    .px-4{padding-left:1rem;padding-right:1rem}
    .py-8{padding-top:2rem;padding-bottom:2rem}
    .container{width:100%;margin-left:auto;margin-right:auto}
    .mx-auto{margin-left:auto;margin-right:auto}
    .text-center{text-align:center}
    .max-w-4xl{max-width:56rem}
    .overflow-hidden{overflow:hidden}
  </style>
`);

// Preconnect to critical domains
const origins = [window.location.origin, 'https://www.googletagmanager.com'];
origins.forEach(origin => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
});

// Get root and render immediately with minimal payload
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(<App />);

// Defer non-critical operations
setTimeout(() => {
  // Remove the critical CSS once the full CSS is loaded
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const criticalCSS = document.getElementById('critical-css');
      if (criticalCSS && criticalCSS.parentNode) {
        criticalCSS.parentNode.removeChild(criticalCSS);
      }
    }, 1000);
  });

  // Analytics and other non-critical operations
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view');
      }
    }, { timeout: 1000 });
  }
}, 0);
