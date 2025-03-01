
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
  // Add critical resources hint
  const criticalSelectors = document.createElement('style');
  criticalSelectors.textContent = `
    .bg-secondary { background-color: hsl(217.2 32.6% 17.5%); }
    .text-white { color: white; }
    .font-bold { font-weight: 700; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    @media (min-width: 768px) { .text-5xl { font-size: 3rem; line-height: 1; } }
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .from-primary { --tw-gradient-from: #9333EA var(--tw-gradient-from-position); --tw-gradient-to: rgb(147 51 234 / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
    .to-purple-400 { --tw-gradient-to: rgb(192 132 252 / 1) var(--tw-gradient-to-position); }
    .bg-clip-text { -webkit-background-clip: text; background-clip: text; }
    .text-transparent { color: transparent; }
  `;
  document.head.appendChild(criticalSelectors);
  
  // Add resource hints
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.gstatic.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);
  
  // Preload the main hero image if you have one
  const linkRelPreload = document.createElement('link');
  linkRelPreload.rel = 'preload';
  linkRelPreload.as = 'image';
  linkRelPreload.href = '/og-image.png';
  document.head.appendChild(linkRelPreload);
});

// Immediate render without any delay
root.render(<App />);
