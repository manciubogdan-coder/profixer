
// Simple script to generate sitemap.xml
const fs = require('fs');

// Define website URL - change this to your actual domain
const WEBSITE_URL = 'https://mesterilocali.ro';
const OUTPUT_PATH = './public/sitemap.xml';

// Define the paths to include in the sitemap
const paths = [
  '', // Homepage
  '/about',
  '/contact',
  '/search',
  '/auth',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/gdpr',
  '/legal/anpc',
  '/jobs/listings'
];

// Generate the sitemap XML content
let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

paths.forEach(path => {
  xmlContent += '  <url>\n';
  xmlContent += `    <loc>${WEBSITE_URL}${path}</loc>\n`;
  xmlContent += '    <changefreq>weekly</changefreq>\n';
  xmlContent += '    <priority>0.8</priority>\n';
  xmlContent += '  </url>\n';
});

xmlContent += '</urlset>';

// Create public directory if it doesn't exist
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Write the sitemap to a file
fs.writeFileSync(OUTPUT_PATH, xmlContent);

console.log(`Sitemap generated at: ${OUTPUT_PATH}`);
console.log(`You can access it at: ${WEBSITE_URL}/sitemap.xml`);
