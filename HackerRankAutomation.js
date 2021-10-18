// node HackerRankAutomation.js --url="https://www.hackerrank.com" --config="config.json"
let minimist = require("minimist"),
  puppeteer = require("puppeteer"),
  fs = require("fs");

let args = minimist(process.argv);

let configJson = fs.readFileSync(args.config, "utf-8");
let config = JSON.parse(configJson);
const moderatorUserName = config.moderator;

(async function runner() {
  let browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
    defaultViewport: { width: 1520, height: 720, isMobile: false },
  });
  let pages = await browser.pages();
  let tab = pages[0];

  await tab.goto(`${args.url}/auth/login`, {
    waitUntil: "networkidle2",
  });
  // `networkidle2` : consider setting content to be finished when there are no
  //      *   more than 2 network connections for at least `500` ms.

  //login
  await tab.type("#input-1", config.email);
  await tab.type("#input-2", config.password);
  await tab.click(".auth-button");

  // wait till navigation
  await tab.waitForNavigation({ waitUntil: "networkidle2" });
  // click on contest button from nav-bar
  await tab.click(".contests");

  await tab.waitForTimeout(2000);

  // let contestUrl = await createContest(tab);
  // console.log(contestUrl);

  console.log(moderatorUserName);
  await Manage_Moderator(browser, tab);
})();

async function createContest(tab) {
  // get button by xpath using text
  const [button] = await tab.$x("//a[contains(text(), 'Create Contest')]");

  if (button) {
    await Promise.all([
      await button.click(),
      tab.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
  }
  await tab.type("#name", "demo contest 3");

  await tab.type("#startdate", "12/11/2021");
  await tab.type("#starttime", "00:30");

  await tab.type("#enddate", "12/11/2021");
  await tab.type("#endtime", "01:00");

  await tab.click("a.select2-choice");
  await tab.click(".select2-result-label");
  await tab.keyboard.press("Tab");
  await tab.type("#organization_name", "postgram1");

  await tab.click(".save-contest");
  await tab.waitForNavigation({ waitUntil: "networkidle2" });

  let contestUrl = "https://www.hackerrank.com/";
  // waitForSelector
  await tab.waitForTimeout(5000);
  let name = await tab.$eval("h1.pjT", (el) => el.textContent);

  contestUrl = contestUrl + name.trim().split(" ").join("-");

  await addModerator(tab);
  await tab.close(); // not know it work, new added
  return contestUrl;
}
async function addModerator(tab, contestUrl = null) {
  if (contestUrl) {
    await tab.goto(contestUrl, {
      waitUntil: "networkidle2",
    });
  }

  let nav = await tab.click("ul.contest-admin-nav>li:nth-child(4)");
  await tab.waitForTimeout(5000);

  // if there is multiple moderator  , either pass
  // array as argument , or use array in global scope
  for (let i = 0; i < moderatorUserName.length; i++) {
    await tab.type(".wide", moderatorUserName[i], { delay: 50 });
    await tab.keyboard.press("Enter");
  }

  console.log("Work Done");
}

async function Manage_Moderator(browser, tab) {
  const [button] = await tab.$x("//a[contains(text(), 'Manage Contest')]");

  if (button) {
    await Promise.all([
      await button.click(),
      tab.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
  }

  await tab.waitForSelector("a[data-attr1='Last']");
  let pageCount = await tab.$eval("a[data-attr1='Last']", (atag) => {
    let toPage = parseInt(atag.getAttribute("data-page"));
    return toPage;
  });
  console.log("pageCount " + pageCount);

  for (let i = 1; i <= pageCount; i++) {
    console.log("page  : " + i);
    await handleAllContestOfCurrentPage(browser, tab);
    if (i != pageCount) {
      await tab.waitForSelector("a[data-attr1='Right']");
      await tab.click("a[data-attr1='Right']");
    }
  }
}

async function handleAllContestOfCurrentPage(browser, tab) {
  // work as querySelectorAll()
  await tab.waitForSelector("a.block-center");
  let links = await tab.$$eval("a.block-center", (aTag) =>
    aTag.map((x) => x.getAttribute("href"))
  );
  console.log("links : " + links.length);

  for (let i = 0; i < links.length; i++) {
    const page = await browser.newPage();
    await page.bringToFront(); // to shift focus to new tab

    let contestUrl = `${args.url}${links[i]}`;
    await addModerator(page, contestUrl);
    console.log("Moderator added ");
    //then close page
    await page.close();
  }
}
