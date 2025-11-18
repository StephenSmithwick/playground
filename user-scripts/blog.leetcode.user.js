// ==UserScript==
// @name         LeetCode Study Plan
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Decorate Blog leetcode lists with Leetcode userdata
// @author       stephensmithwick
// @match        http://127.0.0.1:4000/leetcode/*
// @match        https://stephensmithwick.github.io/leetcode/*
// @match        http://stephensmithwick.github.io/leetcode/*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function () {
  "use strict";

  function loadProblems(slug) {
    GM.xmlHttpRequest({
      method: "GET",
      url: `https://leetcode.com/api/problems/${slug}/`,
      onload: function (leet) {
        const leetData = JSON.parse(leet.response);
        console.log(leetData);

        const leetProblems = new Map(
          leetData.stat_status_pairs.map((x) => [
            x.stat.question__title_slug,
            x,
          ]),
        );

        [...document.querySelectorAll(".leetcode>li")].forEach((li) => {
          const slug = li.dataset.slug || li.innerHTML;
          const url = `https://leetcode.com/problems/${slug}`;

          const problem = leetProblems.get(slug);
          if (problem) {
            const id = problem.stat?.frontend_question_id;
            const title = problem.stat?.question__title;
            const status = problem.status === "ac" ? "✅" : "⬛";
            const level = problem.difficulty?.level;
            const difficulty = ["NA", "🟢", "🟡", "🔴"][level ? level : 0];
            const locked = problem.paid_only ? "🔒" : " ";
            const total_acs = problem.stat?.total_acs;
            const total_submitted = problem.stat?.total_submitted;
            const success_rate =
              total_acs && total_submitted
                ? (total_acs / total_submitted).toFixed(2)
                : "";

            li.innerHTML = `
                        <data class="status">${status} ${difficulty} ${locked}</data>
                        <a href="${url}">${id}. ${title} </a>
                        <data class="stats">
                            tries: <data>${total_submitted}</data>
                            rate: <data>${success_rate}</data>
                        </data>`;
            li.classList.add("grid");
          }
        });
      },
    });
  }

  GM.xmlHttpRequest({
    method: "GET",
    url: "https://leetcode.com/problems/api/card-info/",
    onload: function (leet) {
      const leetData = JSON.parse(leet.response);
      console.log(leetData);
      for (let category of leetData.categories[0]) {
        loadProblems(category.slug);
      }
    },
  });
})();
