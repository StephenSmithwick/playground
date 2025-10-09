// ==UserScript==
// @name        Copy to Markdown
// @match       *://*/*
// @grant       GM_setClipboard
// @grant       GM_registerMenuCommand
// @version     0.2
// @author      Stephen Smithwick
// ==/UserScript==


function copyToMarkdown(event) {
  GM_setClipboard(`[${clean(document.title)}](${document.location.href})`);
}

function clean(title) {
  return title
    .replaceAll('[', '')
    .replaceAll(']', '')
    .replace(/ - [^-]+$/ ,"");
}

GM_registerMenuCommand('Copy to Markdown', copyToMarkdown);
