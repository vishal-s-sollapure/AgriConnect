const puppeteer = require('puppeteer-core');

const MOCK_JOBS = [
  {
    _id: 'job_001',
    title: 'Sugarcane Harvesting & Bundling',
    crop: 'Sugarcane',
    workType: 'Harvesting',
    location: {
      address: 'Shirur, Pune District, Maharashtra',
      village: 'Shirur',
      district: 'Pune',
      state: 'Maharashtra',
      coordinates: [74.3789, 18.8284]
    },
    wage: 650,
    wageType: 'daily',
    workersNeeded: 8,
    openingsCount: 8,
    durationDays: 14,
    startDate: '2026-11-20T00:00:00.000Z',
    endDate: '2026-12-04T00:00:00.000Z',
    status: 'open',
    farmerName: 'Rajesh Patel',
    farmName: 'Patel Organic Farms',
    farmerPhone: '+91 98765 43210',
    description: 'Looking for 8 experienced agricultural workers for manual sugarcane cutting, cleaning, and bundling on a 15-acre farm. Daily water and midday snacks provided.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'job_002',
    title: 'Wheat Sowing & Field Tilling',
    crop: 'Wheat',
    workType: 'Sowing',
    location: {
      address: 'Baramati, Pune, Maharashtra',
      village: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      coordinates: [74.5784, 18.1517]
    },
    wage: 600,
    wageType: 'daily',
    workersNeeded: 5,
    openingsCount: 5,
    durationDays: 7,
    startDate: '2026-11-22T00:00:00.000Z',
    endDate: '2026-11-29T00:00:00.000Z',
    status: 'open',
    farmerName: 'Anand Shinde',
    farmName: 'Shinde Agro',
    farmerPhone: '+91 98765 43212',
    description: 'Sowing winter wheat across 10 acres. Tractor support available, need laborers for seed drilling and line alignment.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'job_003',
    title: 'Cotton Picking & Sorting',
    crop: 'Cotton',
    workType: 'Harvesting',
    location: {
      address: 'Wardha, Vidarbha, Maharashtra',
      village: 'Hinganghat',
      district: 'Wardha',
      state: 'Maharashtra',
      coordinates: [78.8394, 20.5539]
    },
    wage: 620,
    wageType: 'daily',
    workersNeeded: 12,
    openingsCount: 12,
    durationDays: 20,
    startDate: '2026-11-25T00:00:00.000Z',
    endDate: '2026-12-15T00:00:00.000Z',
    status: 'open',
    farmerName: 'Gajanan Deshmukh',
    farmName: 'Deshmukh Cotton Estates',
    farmerPhone: '+91 98765 43214',
    description: 'Second-cycle cotton picking. Fair per-day wages with bonus for clean quality lint separation.',
    createdAt: new Date().toISOString()
  }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('onrender.com') || (url.includes('/api/jobs') && !url.includes('.js') && !url.includes('.css'))) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          jobs: MOCK_JOBS,
          pagination: { page: 1, limit: 9, total: 3, totalPages: 1 }
        })
      });
      return;
    }
    req.continue();
  });

  await page.goto('https://agri-connect-gamma-kohl.vercel.app/jobs', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: process.env.TEMP + '\\test_jobs_mocked.png' });
  console.log('Mocked jobs screenshot taken!');
  await browser.close();
}

run().catch(console.error);
