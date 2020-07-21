"use strict";

const realLocation = window.location;

global.fetch = jest.fn().mockImplementation((url) =>
  Promise.resolve({
    json: () =>
      Promise.resolve(
        url.includes("/item/")
          ? {
              by: "ByMock",
              score: 1,
              time: 1595312533,
              title: "Title Mock",
              url: "https://test.com",
            }
          : [1001, 1002, 1003]
      ),
  })
);

const waitForElement = (className) => new Promise((resolve) => {  
  const interval = setInterval(() => {
    const elements = document.getElementsByClassName(className);
    if (!elements || !elements[0]) {
      return;
    }

    clearInterval(interval);
    resolve();
  }, 50);
});


describe("app", () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <table>
        <thead>
          <tr>
            <th></th>
            <th>
              <a class="topstories" href="/?t=topstories">topstories</a>
              <a class="newstories" href="/?t=newstories">newstories</a>
              <a class="beststories" href="/?t=beststories">beststories</a>
            </th>
          </tr>
        </thead>
        <tbody class="list">
          <tr class="spacer"></tr>
          <tr>
            <td></td>
            <td>Loading stories...</td>
          </tr>
        </tbody>
      </table>`;
  });

  afterEach(() => {
    window.location = realLocation;
    jest.clearAllMocks();
  })

  it("should fetch topstories", async () => {
    require("../app");

    await waitForElement("title");

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(global.fetch).toHaveBeenNthCalledWith(1, "https://hacker-news.firebaseio.com/v0/topstories.json");
    expect(global.fetch).toHaveBeenNthCalledWith(2, "https://hacker-news.firebaseio.com/v0/item/1001.json");
    expect(global.fetch).toHaveBeenNthCalledWith(3, "https://hacker-news.firebaseio.com/v0/item/1002.json");
    expect(global.fetch).toHaveBeenNthCalledWith(4, "https://hacker-news.firebaseio.com/v0/item/1003.json");
  });

  it("should fetch newstories", async () => {
    delete window.location;

    window.location = new URL('http://localhost/?t=newstories');

    require("../app");

    await waitForElement("title");

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(global.fetch).toHaveBeenNthCalledWith(1, "https://hacker-news.firebaseio.com/v0/newstories.json");
    expect(global.fetch).toHaveBeenNthCalledWith(2, "https://hacker-news.firebaseio.com/v0/item/1001.json");
    expect(global.fetch).toHaveBeenNthCalledWith(3, "https://hacker-news.firebaseio.com/v0/item/1002.json");
    expect(global.fetch).toHaveBeenNthCalledWith(4, "https://hacker-news.firebaseio.com/v0/item/1003.json");
  });

  it("should render story links", async () => {
    require("../app");

    await waitForElement("title");

    const storyLinks = document.getElementsByClassName("storylink");

    expect(storyLinks).toHaveLength(3);
    Object.values(storyLinks).forEach((link) => {
      expect(link.innerHTML).toBe('<a href="https://test.com">Title Mock</a>');
    })
  });

  it("should add active class to nav link", async () => {
    delete window.location;

    window.location = new URL('http://localhost/?t=beststories');

    require("../app");

    await waitForElement("title");

    const navLink = document.getElementsByClassName("beststories")[0];

    expect(navLink).toBeTruthy();
    expect(navLink.className).toMatch(/active/);
  });
});
