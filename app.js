"use strict";

(function () {
  const RECORDS_PER_PAGE = 30;
  const VALID_TOOPICS = ["topstories", "newstories", "beststories"];

  const currentPage = parseInt(getParameterByName("p") || 0, 10);
  const topic = getParameterByName("t") || "topstories";

  function getParameterByName(name) {
    var match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
    return match && match[1];
  }

  async function getJSON(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  }

  function renderError() {
    const list = document.querySelector(".list");
    list.innerHTML = null;
    const storyElement = document.createElement("tr");
    storyElement.innerHTML = `
        <td></td>
        <td class="title">
          <span>Oops, couldn't fetch stories</span>
        </td>
      </tr>`;
    list.appendChild(storyElement);
  }

  function renderStories(stories = []) {
    const list = document.querySelector(".list");
    list.innerHTML = null;
    stories.forEach(function (story, index) {
      const storyElement = document.createElement("tr");
      const { url, title, time, by, score } = story || {};

      if (!title || !url) return;

      storyElement.innerHTML = `
        <td align="right" valign="top" class="title">
          <span class="rank">${
            index + 1 + currentPage * RECORDS_PER_PAGE
          }.</span>
        </td>
        <td class="title">
          <span class="storylink"><a href="${url}">${title}</a></span>
          <span class="subtext">${score} points by ${by} on ${new Date(
        time * 1000
      ).toLocaleString()}</span>
        </td>
      </tr>`;

      list.appendChild(storyElement);
    });
  }

  async function fetchStories() {
    if (VALID_TOOPICS.indexOf(topic) === -1) {
      return {};
    }
    const storiesList = await getJSON(
      `https://hacker-news.firebaseio.com/v0/${topic}.json`
    );

    if (!storiesList || !storiesList.length) {
      return {};
    }

    const start = currentPage * RECORDS_PER_PAGE;
    const end = start + RECORDS_PER_PAGE;

    const visibleStories = storiesList.slice(start, end);

    const stories = await Promise.all(
      visibleStories.map((storyId) =>
        getJSON(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
      )
    );

    const hasMore = storiesList.length > end;

    return { hasMore, stories };
  }

  function highlightNavItem() {
    const navItem = document.querySelector(`.${topic}`);
    if (navItem) navItem.classList.add("active");
  }

  function renderMoreButton() {
    const list = document.querySelector(".list");
    const storyElement = document.createElement("tr");
    storyElement.innerHTML = `
        <td></td>
        <td class="title">
          <a href="/?t=${topic}&p=${currentPage + 1}">More</a>
        </td>
      </tr>`;
    list.appendChild(storyElement);
  }

  async function init() {
    highlightNavItem();
    const { stories, hasMore } = await fetchStories();
    if (!stories || !stories.length) {
      return renderError();
    }
    renderStories(stories);
    if (hasMore) {
      renderMoreButton();
    }
  }
  init();
})();
