
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use a more immediate approach to rendering
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create root synchronously
const root = createRoot(rootElement);

// Add event listener for when content is loaded
document.addEventListener('DOMContentLoaded', () => {
  // This helps browsers prioritize the LCP elements
  const linkRelPreload = document.createElement('link');
  linkRelPreload.rel = 'preload';
  linkRelPreload.as = 'image';
  linkRelPreload.href = '/og-image.png'; // Preload main image if you have one
  document.head.appendChild(linkRelPreload);
});

// Immediate render without any delay
root.render(<App />);
