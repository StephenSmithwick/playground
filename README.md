[//]: # (External)
[rust-book]: https://doc.rust-lang.org/book/title-page.html

[//]: # (Blog Posts)
[me.tls-certificates]: https://stephensmithwick.github.io/tls/tls-certificates.html
[me.disable-gateKeeper]: https://stephensmithwick.github.io/dev-desktop/Disable-GateKeeper.html

[//]: # (Misc)
[brewfile]: Brewfile
[osx-allow-unsigned.sh]: /osx-fixes/allow-unsigned.sh
[capture-screen]: /extensions/CaptureScreen

[//]: # (User Scripts)
[blog.leetcode]: /user-scripts/blog.leetcode.user.js
[m.youtube.noshorts]: /user-scripts/m.youtube.noshorts.user.js
[linkedin.nosponsored.user]: /user-scripts/linkedin.nosponsored.user.js
[copyToMarkdown]: /user-scripts/copyToMarkdown.user.js

[//]: # (Rust)
[pi]: /rust/pi
[reagent]: /rust/reagent
[smol-reagent]: /rust/smol-reagent
[rust-lang-book]: /rust/rust-lang-book
[streaming-math]: /rust/streaming-math


# 🛝Playground 
A super repo with a collection of projects with low thresholds to start.  If I like a project it may graduate from here.

## Brewfile
[Brewfile][brewfile] - a homebrew file to be used with `brew bundle`
```bash
git checkout git@github.com:StephenSmithwick/playground.git
cd playground
brew bundle
```

## Rust
A collection of Rust Projects
- [pi][pi] - An experiment with qwen code generation to see how well it generates rust code.  Some work was needed to update the generated code for more recent rust: 
    `(cd rust/pi/src; diff main.rs main.qwen.rs)`
- [reagent][reagent] - An AI Agent written in Rust using a local model hosted by llamma.cpp
- [smol-reagent][smol-reagent] - An AI Agent written in Rust using a local model hosted by llamma.cpp using smol instead of tokio
- [rust-lang-book][rust-lang-book] - My workthrough of the code in the [Rust Programming Language Book][rust-book]
- [streaming-math][streaming-math] - An early investigation of doing streaming io in rust


## Certificates
TLS (`https`) uses public/private key encryption to secure intial conversations.  I am exploring certificates here.
- [certificate-play][certificate-play] -  This is an exploration of creating my own root certificate.  See my blogpost on [TLS Certificates][me.tls-certificates]

## OSX Fixes

- [osx-allow-unsigned.sh][osx-allow-unsigned.sh] - Allows unsigned apps to be installed by disabling Gatekeeper. See my blogpost on [Disabling Gatekeeper][me.disable-gateKeeper]

## User Scripts
A collection of userscripts that I use with 
- **[blog.leetcode][blog.leetcode]** Enhances the blog post [LeetCode - Algorithms](https://stephensmithwick.github.io/leetcode/leetcode-algorithms.html) with additional decorations
- **[m.youtube.noshorts][m.youtube.noshorts]** Removes Shorts from mobile YouTube.
- **[linkedin.nosponsored.user][linkedin.nosponsored.user]** Removes sponsored messages from LinkedIn.
- **[copyToMarkdown][copyToMarkdown]** Copies the current URL as a Markdown link.

## Extensions
Web Extensions that I have created for myself.
- **[Capture Screen][capture-screen]** A chrome targetted extension which captures a screenshot using `navigator.mediaDevices.getDisplayMedia`
