const fs = require('fs');
const path = require('path');

function read(p) {
  try { return fs.readFileSync(path.join(__dirname, '..', p), 'utf8'); }
  catch (e) { return null; }
}

const html = read('admin_management.html');
const css = read('admin_management.css');
const js = read('admin_management.js');

let problems = [];

if (!html) problems.push('Missing admin_management.html');
else {
  if (!/meta name="viewport"/i.test(html)) problems.push('Missing viewport meta in admin_management.html');
  if (!/class="sidebar-overlay"/i.test(html)) problems.push('Missing .sidebar-overlay element in admin_management.html');
  if (!/id="menuToggle"/i.test(html)) problems.push('Missing #menuToggle button in admin_management.html');
}

if (!css) problems.push('Missing admin_management.css');
else {
  if (!/@media\s*\(max-width:\s*768px\)/i.test(css)) problems.push('No @media (max-width: 768px) rules found in admin_management.css');
  if (!/\.sidebar-overlay/i.test(css)) problems.push('No .sidebar-overlay styles found in admin_management.css');
}

if (!js) problems.push('Missing admin_management.js');
else {
  if (!/menuToggle/.test(js)) problems.push('No menuToggle handling found in admin_management.js');
  if (!/sidebar-overlay/.test(js) && !/sidebar\.classList/.test(js)) problems.push('No overlay or sidebar toggling found in admin_management.js');
}

if (problems.length === 0) {
  console.log('OK: admin dashboard responsive checks passed');
  process.exit(0);
} else {
  console.error('FAIL: found issues:');
  problems.forEach(p => console.error('- ' + p));
  process.exit(2);
}
