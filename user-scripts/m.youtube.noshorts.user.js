// ==UserScript==
// @name         Remove Youtube Shorts on mobile
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Remove Youtube Shorts on Mobile Youtube
// @author       Stephen Smithwick
// @match        https://m.youtube.com/*
// ==/UserScript==

const target_class = [
  "rich-section-single-column",
  "reel-shelf-content-wrapper",
  "rich-section-content-wrapper",
  "reel-shelf-items",
  "reel-shelf-header",
];

function onAdded(targets, action) {
  const observer = new MutationObserver((mutationList, observer) => {
    if (
      mutationList.find(
        (mutation) =>
          mutation.type === "childList" &&
          mutation.addedNodes &&
          targets.some((clazz) => mutation.target.innerHTML.indexOf(clazz) > 0),
      )
    ) {
      action();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  action();
}

console.log("Remove Youtube Shorts - loaded");
onAdded(target_class, () => {
  console.log("Removing Shorts");
  for (const clazz of target_class) {
    [...document.querySelectorAll(`.${clazz}`)].forEach((elem) => {
      const boundingRect = elem.getBoundingClientRect();
      elem.remove();
      if (boundingRect.bottom < 0) {
        window.scrollBy(0, -elem.offsetHeight);
      }
    });
  }
});
