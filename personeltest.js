// node HackerRankAutomation.js
let minimist = require("minimist"),
  puppeteer = require("puppeteer");
async function runner() {
  let browser = await puppeteer.launch({
    headless: false,
    rgs: ["--start-fullscreen", "--window-size=1920,1080"],
  });
  let page = await browser.newPage();
  await page.setViewport({ width: 1320, height: 720 });

  await page.goto("https://postgram-social.herokuapp.com/", {
    waitUntil: "networkidle2",
  });

  await page.type("#filled-email-input", "ishu9669tiwari@gmail.com");
  await page.type("#filled-password-input", "This_is_gain_hard_kittu");
  await page.click(".loginButton");
  await page.waitForTimeout(5000);

  await page.click(".shareProfileImg");
  await page.waitForTimeout(10000);
  await page.screenshot(
    { path: "abhishek.png" },
    {
      waitUntil: "networkidle0",
    }
  ),
    browser.close();
}

runner();
