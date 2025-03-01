
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates a sitemap.xml file for the website
 * @param baseUrl The base URL of the website (e.g., https://mesterilocali.ro)
 * @param outputPath The path where the sitemap.xml file will be saved
 */
export const generateSitemap = (baseUrl: string, outputPath = './public/sitemap.xml') => {
  // Remove trailing slash if present
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

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
    xmlContent += `    <loc>${normalizedBaseUrl}${path}</loc>\n`;
    xmlContent += '    <changefreq>weekly</changefreq>\n';
    xmlContent += '    <priority>0.8</priority>\n';
    xmlContent += '  </url>\n';
  });

  xmlContent += '</urlset>';

  // Write the sitemap to a file
  fs.writeFileSync(outputPath, xmlContent);
  
  console.log(`Sitemap generated at: ${outputPath}`);
  return outputPath;
};

export default generateSitemap;
