// Prototype: Scrape trending TikTok food clips using Puppeteer
// WARNING: For demo/prototype use only. Not for production or public deployment.
const puppeteer = require('puppeteer');
const { addClip } = require('../models/food_clips');

async function scrapeTikTokFoodClips(hashtag = 'food', maxClips = 5) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const url = `https://www.tiktok.com/tag/${hashtag}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(5000); // Wait for dynamic content
  const clips = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('a[href*="/video/"]'));
    const seen = new Set();
    return nodes.slice(0, 20).map(a => {
      // Avoid duplicates
      const vid = a.href.match(/\/video\/(\d+)/)?.[1];
      if (!vid || seen.has(vid)) return null;
      seen.add(vid);
      const thumbnail = a.querySelector('img')?.src || null;
      const title = a.innerText || '';
      return {
        url: a.href,
        platform: 'tiktok',
        title,
        creator: null,
        tags: hashtag,
        cuisine: null,
        thumbnail
      };
    }).filter(Boolean);
  });
  for (const clip of clips.slice(0, maxClips)) {
    // Simulate AI extraction (replace with real AI call)
    const fakeAI = {
      ai_ingredients: ['ingredient1', 'ingredient2'],
      ai_recipe_name: null,
      ai_steps: [],
      ai_confidence: 0.7
    };
    await addClip({ ...clip, ...fakeAI });
    console.log('Added clip:', clip.url);
  }
  await browser.close();
}

if (require.main === module) {
  scrapeTikTokFoodClips('food', 5).then(() => {
    console.log('Scraping done.');
    process.exit(0);
  });
}
