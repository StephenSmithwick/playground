// ==UserScript==
// @name        Remove Sponsored linkedin Messages
// @namespace   Violentmonkey Scripts
// @match       https://www.linkedin.com/*
// @grant       none
// @version     1.0
// @author      Stephen Smithwick
// @description 1/22/2025, 11:05:34 AM
// ==/UserScript==

const target_class = ["msg-conversation-card"];

function removeSponsored() {
  for (const node of document.querySelectorAll(
    "aside#msg-overlay .entry-point",
  )) {
    if (node.innerText.includes("Sponsored")) {
      node.remove();
    }
  }
}

function onAdded(targets, action) {
  const observer = new MutationObserver((mutationList, observer) => {
    var doAction = false;
    for (const mutation of mutationList) {
      if (
        mutation.type === "childList" &&
        mutation.addedNodes &&
        targets.some((clazz) => mutation.target.innerHTML.indexOf(clazz) > 0)
      ) {
        doAction = true;
      }
    }
    if (doAction) action();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  action();
}

console.log("Remove Sponsored linkedin Messages - loaded");
onAdded(target_class, removeSponsored);
