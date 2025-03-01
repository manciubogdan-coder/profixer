
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the root element immediately
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create root synchronously
const root = createRoot(rootElement);

// Critical first paint optimization
document.addEventListener('DOMContentLoaded', () => {
  // Add critical CSS inline
  const criticalCSS = document.createElement('style');
  criticalCSS.textContent = `
    .bg-secondary { background-color: hsl(217.2 32.6% 17.5%); }
    .text-white { color: white; }
    .font-bold { font-weight: 700; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .bg-primary { background-color: #9333EA; }
    .text-transparent { color: transparent; }
    .bg-clip-text { -webkit-background-clip: text; background-clip: text; }
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .from-primary { --tw-gradient-from: #9333EA; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(147 51 234 / 0)); }
    .to-purple-400 { --tw-gradient-to: rgb(192 132 252); }
  `;
  document.head.appendChild(criticalCSS);
  
  // Preconnect to critical resources
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = window.location.origin;
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);
  
  // Add resource hints for important images
  const prefetch = document.createElement('link');
  prefetch.rel = 'prefetch';
  prefetch.as = 'image';
  prefetch.href = '/og-image.png';
  document.head.appendChild(prefetch);
});

// Use requestIdleCallback for non-critical operations
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    // Load analytics and other non-critical scripts here
    if (typeof gtag === 'function') {
      gtag('event', 'page_view');
    }
  }, { timeout: 2000 });
}

// Immediate render without any delay
root.render(<App />);
