const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.sharjahairport.ae/en/traveller/flight-information/passenger-departures/', {
    waitUntil: 'networkidle2'
  });

  await page.waitForSelector('.flight-item-detail');

  const flights = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.flight-item-detail'))
      .filter(div => div.getAttribute('data-status') !== 'departed')
      .map(div => ({
        airline: div.getAttribute('data-airline'),
        flight: div.getAttribute('data-flight'),
        origin: div.getAttribute('data-origin'),
        status: div.getAttribute('data-status'),
        gate: div.querySelector('.flight_belt')?.innerText.trim() || 'No gate info',
        statusNote: div.querySelector('.status-note')?.innerText.trim() || 'No status note'
      }));
  });

  console.log(flights);
  await browser.close();
})();

