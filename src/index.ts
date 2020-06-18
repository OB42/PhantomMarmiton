"use strict"
// Phantombuster configuration {
"phantombuster command: nodejs"
"phantombuster package: 5"
"phantombuster flags: save-folder"

const Buster = require("phantombuster")
const buster = new Buster()
const puppeteer = require('puppeteer')
;(async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"] // this is needed to run Puppeteer in a Phantombuster container
    })
    const page = await browser.newPage()
    //await buster.setResultObject({})
    await page.close()
    await browser.close()
    process.exit()
})()
