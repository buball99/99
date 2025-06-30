const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Go to Sharjah departures page
    await page.goto('https://www.sharjahairport.ae/en/traveller/flight-information/passenger-departures/', { waitUntil: 'networkidle2' });

    // Wait for flight blocks to load
    await page.waitForSelector('.flight-item-detail');

    // Extract flight data
    const flights = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.flight-item-detail')).map(div => ({
        airline: div.getAttribute('data-airline'),
        flight: div.getAttribute('data-flight'),
        origin: div.getAttribute('data-origin'),
        status: div.getAttribute('data-status'),
        gate: div.querySelector('.flight_belt')?.innerText.trim() || 'No gate info',
        statusNote: div.querySelector('.status-note')?.innerText.trim() || 'No status note'
      }));
    });

    // Filter only scheduled or on ground flights
    const filteredFlights = flights.filter(flight =>
      flight.status === 'scheduled' || flight.status === 'on ground'
    );

    console.log(filteredFlights);

    await browser.close();
  } catch (error) {
    console.error('Error scraping Sharjah airport:', error);
    process.exit(1);
  }
})();
