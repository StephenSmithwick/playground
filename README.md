[//]: # (External)
[rust-book]: https://doc.rust-lang.org/book/title-page.html
[localstack]: https://github.com/localstack/localstack
[fastapi]: https://fastapi.tiangolo.com/

[//]: # (Blog Posts)
[me.tls-certificates]: https://stephensmithwick.github.io/tls/tls-certificates.html
[me.disable-gateKeeper]: https://stephensmithwick.github.io/dev-desktop/Disable-GateKeeper.html\
[me.aws-stateful-cdk]:https://stephensmithwick.github.io/devops/Message-Board.html

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

[//]: # (Javascript)
[next-comments]: /js/next-comments
[next-comments-client]: /js/next-comments-client
[nextjs-dashboard]: /js/nextjs-dashboard
[react-foundation]: /js/react-foundation

[//]: # (GoLang)
[ct]: /golang/ct
[go-leet]: /golang/leetcode

[//]: # (Python)
[testFastAPI]: /python/testFastAPI
[py-leet]: /python/leetcode

[//]: # (DevOps)
[state-cdk]: /devops/state-cdk
[state-tf]: /devops/state-tf
[terraform-local]: /devops/terraform-local


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
- **[pi][pi]** An experiment with qwen code generation to see how well it generates rust code.  Some work was needed to update the generated code for more recent rust: 
    `(cd rust/pi/src; diff main.rs main.qwen.rs)`
- **[reagent][reagent]** An AI Agent written in Rust using a local model hosted by llamma.cpp
- **[smol-reagent][smol-reagent]** An AI Agent written in Rust using a local model hosted by llamma.cpp using smol instead of tokio
- **[rust-lang-book][rust-lang-book]** My workthrough of the code in the [Rust Programming Language Book][rust-book]
- **[streaming-math][streaming-math]** An early investigation of doing streaming io in rust

## Javascript
- **[next-comments][next-comments]** A vercel/neon service for post comments.  Currently not secure
- **[next-comments-client][next-comments-client]** A thin client for the above service - after experimentation - a solid implementation was created in the blog repo
- **[nextjs-dashboard][nextjs-dashboard]** A nextjs tutorial run-through
- **[react-foundation][react-foundation]** A react tutorial run-through

## Python
- **[testFastAPI][testFastAPI]** An exploration of the [FastAPI](fastapi) Framework which generates Restful APIs and documentation following the Swagger/OpenAPi standard
- **[LeetCode playground][py-leet]** A number of simple leetcode puzzles solved using `python`

## GoLang
- **[ct][ct]** An exploration of CertificateTransparency(CT) APIs. The CT api provides a list of all certificates created by participating Certificate Authorities.
- **[LeetCode playground][py-leet]** some simple leetcode puzzles solved using `go`

## DevOps
- **[state-cdk][state-cdk]** A stateful AWS Lambda Application using CDK. See my blogpost on [A Stateful Lambda CDK ][me.aws-stateful-cdk]
- **[terraform-local][terraform-local]** A basic terraform project using [LocalStack][localstack]

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
