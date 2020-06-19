"use strict"
// Phantombuster configuration {
"phantombuster command: nodejs"
"phantombuster package: 5"
"phantombuster flags: save-folder"

const Buster = require('phantombuster')
const validator = require('is-my-json-valid')
const buster = new Buster()
import puppeteer from "puppeteer"
var marmitonValidator = validator({
  required: true,
  type: 'object',
  properties: {
    searchURL: {
      required: true,
      type: 'string'
    },
    pages: {
      required: false,
      type: 'number',
      minimum: 1
    }
  }
})
if (marmitonValidator(buster.argument) === false) {
  throw new Error('Invalid arguments')
  process.exit()
}
interface Recipe {
  title: string
  url: string
  rating: number
  totalRatings: number
}
async function isRealRecipe(element: puppeteer.ElementHandle){
    //checking if it's a sponsored recipe
    if (await element.$('.recipe-card__sponsored')){
      return (false)
    }
    //checking if it's a recipe and not an album
    else if (await element.$('.recipe-card__add-to-notebook')){
      return (true)
    }
    else {
      return (false)
    }
}
;(async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"] // this is needed to run Puppeteer in a Phantombuster container
    })
    const page = await browser.newPage()
    await page.goto(buster.argument.searchURL)
    await page.waitForSelector('.recipe-results')
    var recipes: Array<puppeteer.ElementHandle> = await page.$$('.recipe-card')
    var recipesData: Array<Recipe> = []
    for (var i in recipes) {
      if (await isRealRecipe(recipes[i])) {
        var recipeData: Recipe = {} as Recipe
        recipeData.title = await recipes[i].$eval('.recipe-card__title', (element: any) => element.textContent)
        recipeData.url = await recipes[i].$eval('.recipe-card-link', (element: any) => element.href)
        recipeData.rating = await recipes[i].$eval('.recipe-card__rating__value', (element: any) => parseFloat(element.textContent))
        recipeData.totalRatings = await recipes[i].$eval('.mrtn-font-discret', (element: any) => parseInt(element.textContent.match(/[0-9]./)))
        recipesData.push(recipeData)
      }
    }
    await buster.setResultObject(recipesData)
    await page.close()
    await browser.close()
    process.exit()
})()
