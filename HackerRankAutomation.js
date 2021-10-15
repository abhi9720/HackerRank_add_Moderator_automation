// node HackerRankAutomation.js --url="https://www.hackerrank.com/auth/login" --config="config.json"
let minimist = require("minimist"),
  puppeteer = require("puppeteer"),
  fs = require("fs");

let args = minimist(process.argv);

let configJson = fs.readFileSync(args.config, "utf-8");
let config = JSON.parse(configJson);

(async function runner() {
  let browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
    defaultViewport: { width: 1520, height: 720, isMobile: false },
  });
  let pages = await browser.pages();
  let tab = pages[0];

  await tab.goto(args.url, {
    waitUntil: "networkidle2",
  });
  // `networkidle2` : consider setting content to be finished when there are no
  //      *   more than 2 network connections for at least `500` ms.

  // avoiding navigation to login by button m using direct link to login
  // await tab.click("li#menu-item-2887");
  // await tab.waitForNavigation();

  await tab.type("#input-1", config.email);
  await tab.type("#input-2", config.password);
  await tab.click(".auth-button");
  await tab.waitForTimeout(5000);
  await tab.click(".contests");
  await tab.waitForTimeout(5000);
  // const [button] = await tab.$x("//a[contains(text(), 'Create Contest')]"); // get button by xpath using text
  const [button] = await tab.$x("//a[contains(text(), 'Create Contest')]"); // get button by xpath using text

  if (button) {
    await Promise.all([
      await button.click(),
      tab.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
  }

  let contestUrl = await createContest(tab);
  console.log(contestUrl);

  await addModerator(tab);
})();

async function createContest(tab) {
  await tab.type("#name", "Test6");

  await tab.type("#startdate", "12/11/2021");
  await tab.type("#starttime", "00:30");

  await tab.type("#enddate", "12/11/2021");
  await tab.type("#endtime", "01:00");

  await tab.click("a.select2-choice");
  await tab.click(".select2-result-label");
  await tab.keyboard.press("Tab");
  await tab.type("#organization_name", "postgram1");

  await Promise.all([
    await tab.click(".save-contest"),
    tab.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  let contestUrl = "https://www.hackerrank.com/";
  // waitForSelector
  await tab.waitForTimeout(5000);
  let name = await tab.$eval("h1.pjT", (el) => el.textContent);

  contestUrl = contestUrl + name.trim().split(" ").join("-");
  console.log(contestUrl);
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
  const moderatorUserName = "compete12";
  // if there is multiple moderator  , either pass
  // array as argument , or use array in global scope
  await tab.type(".wide", moderatorUserName);
  await tab.click(".moderator-save");

  console.log("Work Done");
}
