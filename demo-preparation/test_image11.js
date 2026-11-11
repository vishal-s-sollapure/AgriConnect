const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

const DIST_DIR = path.resolve(__dirname, '../AgriConnect/client/dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2'
};

const FARMER_USER = {
  _id: 'farmer_001',
  name: 'Rajesh Patel',
  email: 'farmer@agriconnect.com',
  role: 'farmer',
  phone: '+91 98765 43210',
  location: 'Shirur, Pune District, Maharashtra',
  farmName: 'Patel Organic Farms'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    const parsed = new URL(req.url, 'http://127.0.0.1:4173');
    let filePath = path.join(DIST_DIR, parsed.pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

async function run() {
  const server = createStaticServer();
  await new Promise(r => server.listen(4173, '127.0.0.1', r));

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 1200 });
  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes(':5000/api/') || url.includes('onrender.com/api/')) {
      const headers = { 'Access-Control-Allow-Origin': '*' };
      if (url.includes('/api/notifications')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({
            success: true,
            notifications: [
              {
                _id: 'notif_001',
                title: 'New Applicant Received',
                message: 'Suresh Patil applied for Sugarcane Harvesting & Bundling.',
                type: 'application_received',
                read: false,
                createdAt: new Date().toISOString()
              },
              {
                _id: 'notif_002',
                title: 'Worker Hired',
                message: 'Ramesh Kumar accepted for 14-day sugarcane harvest.',
                type: 'application_accepted',
                read: true,
                createdAt: new Date(Date.now() - 3600000).toISOString()
              }
            ],
            unreadCount: 1
          })
        });
        return;
      }
      if (url.includes('/api/auth/me') || url.includes('/api/users/profile')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({ success: true, user: FARMER_USER })
        });
        return;
      }
      if (url.includes('/api/jobs/my-jobs')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({
            success: true,
            jobs: [],
            stats: { total: 2, open: 2, closed: 0, completed: 0, totalApplications: 7, pendingApplications: 4, acceptedWorkers: 3 }
          })
        });
        return;
      }
    }
    req.continue();
  });

  await page.goto('http://127.0.0.1:4173/farmer', { waitUntil: 'networkidle2' });
  await page.evaluate((farmer) => {
    localStorage.setItem('agriconnect_user', JSON.stringify(farmer));
    localStorage.setItem('agri_user', JSON.stringify(farmer));
    localStorage.setItem('agriconnect_token', 'simulated_farmer_token');
    localStorage.setItem('agri_token', 'simulated_farmer_token');
    localStorage.setItem('agriconnect_lang', 'en');
  }, FARMER_USER);
  await page.goto('http://127.0.0.1:4173/farmer', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    // Click AI Voice Assistant button
    const buttons = Array.from(document.querySelectorAll('button'));
    const aiBtn = buttons.find(b => b.innerText.includes('AI Voice Assistant') || b.innerText.includes('Voice'));
    if (aiBtn) aiBtn.click();

    // Click Notification bell button
    const bellBtn = document.querySelector('button[aria-label*=\"Notification\"], button[aria-label*=\"notification\"]');
    if (bellBtn) bellBtn.click();
    window.scrollTo(0, 0);
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: process.env.TEMP + '\\test_img11.png' });
  console.log('Test 11 screenshot saved!');
  await browser.close();
  await new Promise(r => server.close(r));
}

run().catch(console.error);
