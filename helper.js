// Requiring node modules 

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");
let jsdom = require("jsdom");
let ytdl=require('ytdl-core');
let args = minimist(process.argv);
var html_to_pdf = require("html-pdf-node");


//  reading the question json file 
let quesJSON = fs.readFileSync(args.ques, "utf-8");
let quesJSO = JSON.parse(quesJSON);
let urlarr = [];
let detail = [];
let ytlink=[];
// launching the browser
async function run() {
  let browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
    defaultViewport: null,
  });

  // searching the questions on wikihow website
  for (let i = 0; i < quesJSO.length; i++) {
    const page = await browser.newPage();
    await page.goto(args.url);
    await page.waitForSelector("input[name='search']");
    await page.type("input[name='search']", quesJSO[i], { delay: 50 });
    await page.waitForSelector("button#hs_submit");
    await page.click("button#hs_submit");
    await page.waitForSelector("a.result_link");
    await page.click("a.result_link");
    const url = await page.url();
    urlarr.push(url);
  }

  //  asking questions from KUKI AI chatbot
  for (let o = 0; o < 1; o++) {
    const page = await browser.newPage();
    await page.goto("https://chat.kuki.ai/signin");
    await page.waitForSelector("div.facebook-sign-in-button");
    await page.click("div.facebook-sign-in-button");
    await page.waitFor(3000);
    // add your facebook credentials here for login authentication
    await page.waitForSelector("input[name='email']");
   await page.keyboard.type("jsmgtbit@gmail.com", { delay: 50 });
   await page.waitFor(3000);
   await page.waitForSelector("input[name='pass']");
   await page.type("input[name='pass']", "********");
   await page.waitForSelector("button[name='login']");
    await page.click("button[name='login']");
    for (let j = 0; j < quesJSO.length; j++){
      await page.waitFor(10000);
      await page.waitForSelector("input[data-testid='chat-input']");
      await page.type("input[data-testid='chat-input']", quesJSO[j], { delay: 50 });
      await page.keyboard.press("Enter");
    }
  }
  // login in to twitter for asking those questions
    const page = await browser.newPage();
      await page.goto("https://twitter.com/i/flow/login");
      // add your twitter credentials here for login authentication
      await page.waitForSelector("input[name='username']");
      await page.type("input[name='username']", "jsyoungmetro", { delay: 50 });
      await page.keyboard.press("Enter");
      await page.waitForSelector("input[name='password']");
      await page.type("input[name='password']", "******", { delay: 50 });
      await page.keyboard.press("Enter");
    await page.waitForSelector('.DraftEditor-editorContainer');
    await page.click('.DraftEditor-editorContainer');
    await page.keyboard.type(quesJSO[0],{delay: 50});
    await page.waitForSelector("div[data-testid='tweetButtonInline']");
    await page.click("div[data-testid='tweetButtonInline']");
    for(let h=1;h<quesJSO.length;h++){
      await page.goto("https://twitter.com/home");
      await page.waitForSelector('.DraftEditor-editorContainer');
    await page.click('.DraftEditor-editorContainer');
    await page.keyboard.type(quesJSO[h],{delay: 50});
    await page.waitForSelector("div[data-testid='tweetButtonInline']");
    await page.click("div[data-testid='tweetButtonInline']");
    }

    // creating pdf's from the web results generated from wikihow pages earlier
  let urlJSON = JSON.stringify(urlarr); // done
  fs.writeFileSync("url.json", urlJSON, "utf-8");
  let urlJSO = JSON.parse(urlJSON);
  let options = { format: "A4" };
  for (let d = 0; d < quesJSO.length; d++) {
    let file = { url: urlJSO[d] };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      let filenamee = quesJSO[d] + ".pdf";
      fs.writeFileSync(filenamee, pdfBuffer, "utf-8");
    });
    // searching for video solutions on youtube
    const page = await browser.newPage();
  await page.goto("https://youtube.com");
  await page.waitForSelector("input#search");
    await page.type("input#search", quesJSO[d], { delay: 50 });
    await page.waitForSelector("button#search-icon-legacy");
    await page.click("button#search-icon-legacy");
    await page.waitForSelector("a#video-title");
    await page.click("a#video-title");
    const url = await page.url();
    ytlink.push(url);
  }
  // downloading those youtube videos for offline purpose
  let ytlinkJSON = JSON.stringify(ytlink); // done
  fs.writeFileSync("ytlink.json", ytlinkJSON, "utf-8");
  let ytlinkJSO = JSON.parse(ytlinkJSON);
  for(let n=0;n<ytlinkJSO.length;n++){
    ytdl(ytlinkJSO[n])
  .pipe(fs.createWriteStream(quesJSO[n]+'video.mp4'));
  }
}
run();
