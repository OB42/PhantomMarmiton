"use strict"
// Phantombuster configuration {
"phantombuster command: nodejs"
"phantombuster package: 5"

import Buster from "phantombuster"
import puppeteer from "puppeteer"
const buster = new Buster()
const validator = require('is-my-json-valid')
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
interface Arguments {
  searchURL: string
  pages?: number
}
if (marmitonValidator(buster.argument) === false) {
  throw new Error('Invalid arguments')
  process.exit()
}
else {
  var marmitonArguments = <Arguments>buster.argument
}
;(async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"] // this is needed to run Puppeteer in a Phantombuster container
    })
    const page = await browser.newPage()
    await page.goto(marmitonArguments.searchURL)
    await buster.setResultObject(await getRecipes(page, marmitonArguments.pages || 1))
    await page.close()
    await browser.close()
    process.exit()
})()
interface Recipe {
  title: string
  url: string
  rating: number
  totalRatings: number
}
async function getRecipes(page: puppeteer.Page, pagesLeftToScrape: number): Promise<Array<Recipe>> {
  await page.waitForSelector('.recipe-results')
  var recipesElements: Array<puppeteer.ElementHandle> = await page.$$('.recipe-card')
  var recipesData: Array<Recipe> = []
  for (var i in recipesElements) {
    if (await isRealRecipe(recipesElements[i])) {
      var recipeData: Recipe = {} as Recipe
      recipeData.title = await recipesElements[i].$eval('.recipe-card__title', (element: any) => element.textContent)
      recipeData.url = await recipesElements[i].$eval('.recipe-card-link', (element: any) => element.href)
      recipeData.rating = await recipesElements[i].$eval('.recipe-card__rating__value', (element: any) => parseFloat(element.textContent))
      recipeData.totalRatings = await recipesElements[i].$eval('.mrtn-font-discret', (element: any) => parseInt(element.textContent.match(/[0-9]./)))
      recipesData.push(recipeData)
    }
  }
  if (pagesLeftToScrape > 1 && (await page.$('.af-pagination .selected + li'))) {
    //click on next page
    page.click('.af-pagination .selected + li')
    await page.waitForNavigation()
    recipesData = recipesData.concat(await getRecipes(page, pagesLeftToScrape - 1))
  }
  return (recipesData)
}
async function isRealRecipe(element: puppeteer.ElementHandle): Promise<boolean>{
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
