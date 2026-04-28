// Adds a "Network Capture" panel into Chrome DevTools.
chrome.devtools.panels.create(
  'Network Capture',
  '',
  'panel.html',
  () => { /* panel ready */ }
);
