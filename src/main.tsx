
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Optimizare încărcare prioritară
if ('onload' in document) {
  document.onload = () => {
    // Preload critical resources
    const linkRelPreload = document.createElement('link');
    linkRelPreload.rel = 'preload';
    linkRelPreload.as = 'image';
    linkRelPreload.href = '/og-image.png'; 
    document.head.appendChild(linkRelPreload);
  };
}

// Use a more immediate approach to rendering
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Optimizare - immediately start hydration
const root = createRoot(rootElement);
root.render(<App />);

// Optimizare - eliminare task-uri neesențiale din main thread
requestIdleCallback(() => {
  // Preload critical resources that aren't needed immediately
  const resources = [
    '/lovable-uploads/8fe99ebc-6d24-4c85-b4fb-c876baacad95.png',
    '/lovable-uploads/fe8d1cfc-5531-441a-888e-cf9babdd7069.png'
  ];
  
  resources.forEach(resource => {
    const img = new Image();
    img.src = resource;
  });
});
