const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

const DIST_DIR = path.resolve(__dirname, '../AgriConnect/client/dist');
const OUTPUT_DIR = path.resolve(__dirname, 'project-gallery');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

const MOCK_JOBS = [
  {
    _id: 'job_001',
    title: 'Sugarcane Harvesting & Bundling',
    crop: 'Sugarcane',
    workType: 'Harvesting',
    location: 'Shirur, Pune District, Maharashtra',
    village: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.8284,
    longitude: 74.3789,
    wage: 650,
    wageAmount: 650,
    wageType: 'daily',
    workersNeeded: 8,
    workersRequired: 8,
    openingsCount: 8,
    durationDays: 14,
    startDate: '2026-11-20',
    endDate: '2026-12-04',
    status: 'open',
    farmerId: { _id: 'f1', name: 'Rajesh Patel', phone: '+91 98765 43210' },
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
    location: 'Baramati, Pune, Maharashtra',
    village: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.1517,
    longitude: 74.5784,
    wage: 600,
    wageAmount: 600,
    wageType: 'daily',
    workersNeeded: 5,
    workersRequired: 5,
    openingsCount: 5,
    durationDays: 7,
    startDate: '2026-11-22',
    endDate: '2026-11-29',
    status: 'open',
    farmerId: { _id: 'f1', name: 'Rajesh Patel', phone: '+91 98765 43210' },
    farmerName: 'Rajesh Patel',
    farmName: 'Patel Organic Farms',
    farmerPhone: '+91 98765 43210',
    description: 'Sowing winter wheat across 10 acres. Tractor support available, need laborers for seed drilling and line alignment.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'job_003',
    title: 'Cotton Picking & Sorting',
    crop: 'Cotton',
    workType: 'Harvesting',
    location: 'Wardha, Vidarbha, Maharashtra',
    village: 'Hinganghat',
    district: 'Wardha',
    state: 'Maharashtra',
    latitude: 20.5539,
    longitude: 78.8394,
    wage: 620,
    wageAmount: 620,
    wageType: 'daily',
    workersNeeded: 12,
    workersRequired: 12,
    openingsCount: 12,
    durationDays: 20,
    startDate: '2026-11-25',
    endDate: '2026-12-15',
    status: 'open',
    farmerId: { _id: 'f2', name: 'Gajanan Deshmukh', phone: '+91 98765 43214' },
    farmerName: 'Gajanan Deshmukh',
    farmName: 'Deshmukh Cotton Estates',
    farmerPhone: '+91 98765 43214',
    description: 'Second-cycle cotton picking. Fair per-day wages with bonus for clean quality lint separation.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'job_004',
    title: 'Paddy / Rice Harvesting & Threshing',
    crop: 'Paddy / Rice',
    workType: 'Harvesting',
    location: 'Alibag, Raigad, Maharashtra',
    village: 'Alibag',
    district: 'Raigad',
    state: 'Maharashtra',
    latitude: 18.6414,
    longitude: 72.8767,
    wage: 680,
    wageAmount: 680,
    wageType: 'daily',
    workersNeeded: 6,
    workersRequired: 6,
    openingsCount: 6,
    durationDays: 10,
    startDate: '2026-11-28',
    endDate: '2026-12-08',
    status: 'open',
    farmerId: { _id: 'f3', name: 'Vinayak Patil', phone: '+91 98765 43216' },
    farmerName: 'Vinayak Patil',
    farmName: 'Konkan Agro Farm',
    farmerPhone: '+91 98765 43216',
    description: 'Traditional coastal rice cutting, threshing, and bagging. Transport assistance provided.',
    createdAt: new Date().toISOString()
  }
];

const MOCK_APPLICANTS = [
  {
    _id: 'app_001',
    jobId: 'job_001',
    worker: {
      _id: 'worker_001',
      name: 'Ramesh Kumar',
      phone: '+91 98765 43211',
      location: 'Shirur, Pune District, Maharashtra',
      skills: ['Harvesting', 'Sowing', 'Spraying'],
      experienceYears: 6
    },
    status: 'accepted',
    proposedWage: 650,
    createdAt: '2026-11-10T10:30:00.000Z',
    notes: 'Available immediately for full 14 days with experienced team of 2 relatives.'
  },
  {
    _id: 'app_002',
    jobId: 'job_001',
    worker: {
      _id: 'worker_002',
      name: 'Suresh Patil',
      phone: '+91 98765 43222',
      location: 'Khed, Pune District, Maharashtra',
      skills: ['Harvesting', 'Bundling'],
      experienceYears: 4
    },
    status: 'pending',
    proposedWage: 650,
    createdAt: '2026-11-10T14:15:00.000Z',
    notes: 'Specialist in mechanized and manual sugarcane cutting.'
  },
  {
    _id: 'app_003',
    jobId: 'job_001',
    worker: {
      _id: 'worker_003',
      name: 'Sunita Shinde',
      phone: '+91 98765 43233',
      location: 'Shirur, Pune District, Maharashtra',
      skills: ['Harvesting', 'Weeding'],
      experienceYears: 5
    },
    status: 'pending',
    proposedWage: 650,
    createdAt: '2026-11-11T09:00:00.000Z',
    notes: 'Local agricultural worker from Shirur village.'
  }
];

const FARMER_USER = {
  _id: 'farmer_001',
  name: 'Rajesh Patel',
  email: 'farmer@agriconnect.com',
  role: 'farmer',
  phone: '+91 98765 43210',
  location: 'Shirur, Pune District, Maharashtra',
  farmName: 'Patel Organic Farms'
};

const WORKER_USER = {
  _id: 'worker_001',
  name: 'Ramesh Kumar',
  email: 'worker@agriconnect.com',
  role: 'worker',
  phone: '+91 98765 43211',
  location: 'Shirur, Pune District, Maharashtra',
  skills: ['Harvesting', 'Sowing', 'Spraying'],
  experienceYears: 6
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

async function saveScreenshot(page, filename) {
  const tempPath = path.join(process.env.TEMP, filename);
  await page.screenshot({ path: tempPath, fullPage: false });
  const destPath = path.join(OUTPUT_DIR, filename);
  fs.copyFileSync(tempPath, destPath);
  const stats = fs.statSync(destPath);
  console.log(`[Captured] ${filename} (${(stats.size / 1024).toFixed(1)} KB) -> 3:2 Aspect Ratio`);
}

async function main() {
  console.log('--- AgriConnect Professional Image Gallery Generator ---');
  const server = createStaticServer();
  await new Promise(r => server.listen(4173, '127.0.0.1', r));
  console.log('✓ Local static web server started at http://127.0.0.1:4173');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Set exact 3:2 aspect ratio: 1800 x 1200
  await page.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 1 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (!url.includes(':5000/api/') && !url.includes('onrender.com/api/')) {
      req.continue();
      return;
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, *'
    };

    if (req.method() === 'OPTIONS') {
      req.respond({ status: 204, headers });
      return;
    }

    if (url.includes('/api/notifications/unread-count')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({ success: true, unreadCount: 1 })
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
          jobs: MOCK_JOBS.slice(0, 2),
          stats: {
            total: 2,
            open: 2,
            closed: 0,
            completed: 0,
            totalApplications: 7,
            pendingApplications: 4,
            acceptedWorkers: 3
          }
        })
      });
      return;
    }

    // Handlers for /jobs/:id/applications (job applications for farmer applicant review)
    if (url.includes('/applications') && url.includes('/jobs/')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({
          success: true,
          job: MOCK_JOBS[0],
          applications: MOCK_APPLICANTS,
          summary: {
            total: 3,
            pending: 2,
            accepted: 1,
            rejected: 0,
            withdrawn: 0,
            workersRequired: 8,
            remainingVacancies: 7,
            isFullyStaffed: false
          },
          pagination: { page: 1, limit: 10, total: 3, totalPages: 1 }
        })
      });
      return;
    }

    if (url.includes('/api/applications/my-applications')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({
          success: true,
          data: MOCK_APPLICANTS.map(a => ({
            ...a,
            job: MOCK_JOBS[0]
          })),
          stats: { total: 3, pending: 2, accepted: 1, rejected: 0 }
        })
      });
      return;
    }

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
            },
            {
              _id: 'notif_003',
              title: 'Regional Wage Guidance',
              message: 'Sugarcane harvesting benchmark is ₹650/day in Pune District.',
              type: 'system_alert',
              read: true,
              createdAt: new Date(Date.now() - 86400000).toISOString()
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
        body: JSON.stringify({
          success: true,
          user: FARMER_USER
        })
      });
      return;
    }

    if (url.includes('/api/jobs/') && !url.includes('?')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({ success: true, job: MOCK_JOBS[0] })
      });
      return;
    }

    // Default /api/jobs list
    req.respond({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({
        success: true,
        jobs: MOCK_JOBS,
        pagination: { page: 1, limit: 9, total: MOCK_JOBS.length, totalPages: 1 }
      })
    });
  });

  // ==========================================
  // IMAGE 1: AgriConnect Cover Showcase
  // ==========================================
  console.log('Generating Image 1: AgriConnect Cover Showcase...');
  const coverHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1800px;
        height: 1200px;
        background: radial-gradient(circle at 50% 20%, #0d2e22 0%, #06140e 55%, #030805 100%);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        padding: 65px 85px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }
      .glow-orb {
        position: absolute;
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%);
        top: -150px;
        right: -100px;
        border-radius: 50%;
        filter: blur(40px);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 18px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 9999px;
        color: #34d399;
        font-size: 17px;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-bottom: 20px;
      }
      .header-title {
        font-size: 68px;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -1.5px;
        background: linear-gradient(135deg, #ffffff 40%, #86efac 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 16px;
      }
      .header-tagline {
        font-size: 26px;
        color: #94a3b8;
        font-weight: 500;
        max-width: 950px;
        line-height: 1.45;
      }
      .pillars {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        margin-top: 36px;
      }
      .pillar-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(52, 211, 153, 0.22);
        border-radius: 18px;
        padding: 26px 24px;
        backdrop-filter: blur(12px);
      }
      .pillar-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }
      .pillar-title {
        font-size: 20px;
        font-weight: 700;
        color: #e2e8f0;
        margin-bottom: 8px;
      }
      .pillar-desc {
        font-size: 14.5px;
        color: #94a3b8;
        line-height: 1.5;
      }
      .showcase-strip {
        background: rgba(11, 31, 23, 0.75);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 22px;
        padding: 24px 34px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 36px;
      }
      .stats-group {
        display: flex;
        gap: 48px;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
      }
      .stat-num {
        font-size: 32px;
        font-weight: 800;
        color: #34d399;
      }
      .stat-label {
        font-size: 13.5px;
        color: #94a3b8;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .tech-tags {
        display: flex;
        gap: 12px;
      }
      .tech-pill {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.25);
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #cbd5e1;
      }
      .footer-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 24px;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
        font-size: 15px;
        color: #64748b;
      }
      .url-link {
        color: #34d399;
        font-weight: 600;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="glow-orb"></div>
    <div>
      <div class="badge">
        <span>🌾</span> Google Hackathon 2026 • Production-Ready Submission
      </div>
      <h1 class="header-title">AgriConnect</h1>
      <p class="header-tagline">Connecting Farmers with Agricultural Workers — Digital Employment Marketplace for Rural India</p>

      <div class="pillars">
        <div class="pillar-card">
          <div class="pillar-icon">👨‍🌾</div>
          <div class="pillar-title">Dual-Sided Portals</div>
          <div class="pillar-desc">Role-based JWT authentication separating farmer job management from worker discovery and application pipelines.</div>
        </div>
        <div class="pillar-card">
          <div class="pillar-icon">📍</div>
          <div class="pillar-title">Geolocation Matching</div>
          <div class="pillar-desc">Interactive Leaflet OpenStreetMap integration with Haversine distance engine ensuring laborers find local work without migration.</div>
        </div>
        <div class="pillar-card">
          <div class="pillar-icon">🗣️</div>
          <div class="pillar-title">7 Indian Languages</div>
          <div class="pillar-desc">Comprehensive localization across English, Hindi, Kannada, Marathi, Gujarati, Tamil, and Telugu with voice speech support.</div>
        </div>
        <div class="pillar-card">
          <div class="pillar-icon">⚡</div>
          <div class="pillar-title">Direct Hiring & Fair Wages</div>
          <div class="pillar-desc">Transparent daily wage benchmarks, instant 1-click applicant review, and real-time status alerts with zero middlemen.</div>
        </div>
      </div>

      <div class="showcase-strip">
        <div class="stats-group">
          <div class="stat-item">
            <span class="stat-num">9 Phases</span>
            <span class="stat-label">Production Ready</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">7 Languages</span>
            <span class="stat-label">301 Verified Keys</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">Zero</span>
            <span class="stat-label">Brokerage Middlemen</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">100%</span>
            <span class="stat-label">Live Deployed</span>
          </div>
        </div>
        <div class="tech-tags">
          <span class="tech-pill">React 18 + Vite</span>
          <span class="tech-pill">Node.js + Express</span>
          <span class="tech-pill">MongoDB Atlas</span>
          <span class="tech-pill">Leaflet Maps</span>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div>Live Web App: <span class="url-link">https://agri-connect-gamma-kohl.vercel.app/</span></div>
      <div>Backend API: <span class="url-link">https://agriconnect-jc13.onrender.com</span></div>
      <div>GitHub: <span class="url-link">github.com/vishal-s-sollapure/AgriConnect</span></div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(coverHtml, { waitUntil: 'domcontentloaded' });
  await saveScreenshot(page, '01-agriconnect-cover.png');

  // ==========================================
  // IMAGE 2: Landing Page
  // ==========================================
  console.log('Capturing Image 2: Landing Page...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    try { localStorage.clear(); } catch(e) {}
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '02-landing-page.png');

  // ==========================================
  // IMAGE 3: Farmer Dashboard
  // ==========================================
  console.log('Capturing Image 3: Farmer Dashboard...');
  await page.evaluate((farmer) => {
    localStorage.setItem('agriconnect_user', JSON.stringify(farmer));
    localStorage.setItem('agri_user', JSON.stringify(farmer));
    localStorage.setItem('agriconnect_token', 'simulated_farmer_token');
    localStorage.setItem('agri_token', 'simulated_farmer_token');
  }, FARMER_USER);
  await page.goto('http://127.0.0.1:4173/farmer', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '03-farmer-dashboard.png');

  // ==========================================
  // IMAGE 4: Create Agricultural Job Form
  // ==========================================
  console.log('Capturing Image 4: Create Job Form...');
  await page.goto('http://127.0.0.1:4173/farmer/jobs/new', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    // Fill title input triggering React's synthetic value setter
    const titleInput = document.querySelector('input[placeholder*="Harvesting"]');
    if (titleInput) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(titleInput, 'Sugarcane Harvesting & Bundling');
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '04-create-job.png');

  // ==========================================
  // IMAGE 5: Worker Dashboard
  // ==========================================
  console.log('Capturing Image 5: Worker Dashboard...');
  await page.evaluate((worker) => {
    localStorage.setItem('agriconnect_user', JSON.stringify(worker));
    localStorage.setItem('agri_user', JSON.stringify(worker));
    localStorage.setItem('agriconnect_token', 'simulated_worker_token');
    localStorage.setItem('agri_token', 'simulated_worker_token');
  }, WORKER_USER);
  await page.goto('http://127.0.0.1:4173/worker', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '05-worker-dashboard.png');

  // ==========================================
  // IMAGE 6: Job Discovery
  // ==========================================
  console.log('Capturing Image 6: Job Discovery...');
  await page.goto('http://127.0.0.1:4173/jobs', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const searchInput = document.querySelector('input[type=\"text\"]');
    if (searchInput) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(searchInput, 'Sugarcane Harvesting');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '06-job-discovery.png');

  // ==========================================
  // IMAGE 7: Location-Based Discovery (Map View)
  // ==========================================
  console.log('Capturing Image 7: Location-Based Discovery...');
  await page.goto('http://127.0.0.1:4173/jobs', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const mapBtn = buttons.find(b => b.innerText.includes('Map Only'));
    if (mapBtn) mapBtn.click();
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1800));
  await saveScreenshot(page, '07-location-discovery.png');

  // ==========================================
  // IMAGE 8: Job Application Workflow (Details)
  // ==========================================
  console.log('Capturing Image 8: Job Application Workflow...');
  await page.goto('http://127.0.0.1:4173/jobs/job_001', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '08-job-application.png');

  // ==========================================
  // IMAGE 9: Applicant Management
  // ==========================================
  console.log('Capturing Image 9: Applicant Management...');
  await page.evaluate((farmer) => {
    localStorage.setItem('agriconnect_user', JSON.stringify(farmer));
    localStorage.setItem('agri_user', JSON.stringify(farmer));
    localStorage.setItem('agriconnect_token', 'simulated_farmer_token');
    localStorage.setItem('agri_token', 'simulated_farmer_token');
  }, FARMER_USER);
  await page.goto('http://127.0.0.1:4173/farmer/jobs/job_001/applicants', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1800));
  await saveScreenshot(page, '09-applicant-management.png');

  // ==========================================
  // IMAGE 10: Multilingual Accessibility Showcase
  // ==========================================
  console.log('Capturing Image 10: Multilingual Support...');
  await page.evaluate(() => {
    localStorage.setItem('agriconnect_lang', 'mr');
    window.scrollTo(0, 0);
  });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, '10-multilingual-support.png');
  // Reset language to English
  await page.evaluate(() => {
    localStorage.setItem('agriconnect_lang', 'en');
  });

  // ==========================================
  // IMAGE 11: Notifications and Smart Assistance
  // ==========================================
  console.log('Capturing Image 11: Notifications & Assistance...');
  await page.evaluate((farmer) => {
    localStorage.setItem('agriconnect_user', JSON.stringify(farmer));
    localStorage.setItem('agri_user', JSON.stringify(farmer));
    localStorage.setItem('agriconnect_token', 'simulated_farmer_token');
    localStorage.setItem('agri_token', 'simulated_farmer_token');
    localStorage.setItem('agriconnect_lang', 'en');
  }, FARMER_USER);
  await page.goto('http://127.0.0.1:4173/farmer', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => {
    // Open Notification Bell dropdown
    const bellBtn = document.querySelector('button[aria-label*="notification"], button[aria-label*="Notification"], button svg.lucide-bell')?.closest('button');
    if (bellBtn) bellBtn.click();
    // Open AI Assistant widget
    const aiButton = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('AI Voice Assistant') || b.innerText.includes('Voice'));
    if (aiButton) aiButton.click();
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1800));
  await saveScreenshot(page, '11-notifications-assistance.png');

  // ==========================================
  // IMAGE 12: Technology Architecture Infographic
  // ==========================================
  console.log('Generating Image 12: Technology Architecture...');
  const archHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1800px;
        height: 1200px;
        background: #06110c;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        padding: 55px 75px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 9999px;
        color: #34d399;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 12px;
      }
      .arch-title {
        font-size: 44px;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 40%, #86efac 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
      }
      .arch-subtitle {
        font-size: 19px;
        color: #94a3b8;
        margin-bottom: 28px;
      }
      .grid-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      .tier-card {
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(52, 211, 153, 0.22);
        border-radius: 18px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .tier-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      }
      .tier-icon {
        font-size: 28px;
      }
      .tier-name {
        font-size: 22px;
        font-weight: 700;
        color: #34d399;
      }
      .tier-badge {
        margin-left: auto;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
      }
      .tech-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .tech-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .tech-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        margin-top: 7px;
        flex-shrink: 0;
      }
      .tech-name {
        font-weight: 700;
        color: #e2e8f0;
        font-size: 16px;
      }
      .tech-desc {
        color: #94a3b8;
        font-size: 13.5px;
        line-height: 1.4;
      }
      .roadmap-strip {
        background: rgba(11, 31, 23, 0.7);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 18px;
        padding: 22px 28px;
        margin-top: 24px;
      }
      .roadmap-title {
        font-size: 18px;
        font-weight: 700;
        color: #34d399;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .roadmap-item {
        background: rgba(15, 23, 42, 0.5);
        padding: 12px 16px;
        border-radius: 10px;
        border-left: 3px solid #10b981;
      }
      .roadmap-label {
        font-weight: 700;
        color: #f1f5f9;
        font-size: 14.5px;
      }
      .roadmap-sub {
        color: #94a3b8;
        font-size: 12.5px;
        margin-top: 3px;
      }
      .footer-note {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        font-size: 13.5px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div>
      <div class="badge">⚙️ Full-Stack System Architecture</div>
      <h1 class="arch-title">AgriConnect Technical Architecture</h1>
      <p class="arch-subtitle">Modern MERN + Leaflet decoupled architecture deployed across Vercel, Render, and MongoDB Atlas</p>

      <div class="grid-container">
        <!-- Tier 1 -->
        <div class="tier-card">
          <div class="tier-header">
            <span class="tier-icon">💻</span>
            <span class="tier-name">Frontend Tier</span>
            <span class="tier-badge">Vercel CDN</span>
          </div>
          <ul class="tech-list">
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">React 18 & Vite 5</div>
                <div class="tech-desc">Ultra-fast SPA bundling, React Router v7, Context API state management for Auth, Agri, and i18n.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Leaflet & OpenStreetMap</div>
                <div class="tech-desc">Interactive geolocation with custom SVG DivIcons, radius filtering, and zero-token OSM raster tiles.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">7-Language i18n Engine</div>
                <div class="tech-desc">Native dictionary system with 301 verified translation keys per language (English, HI, KN, MR, GU, TA, TE).</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Web Speech Voice API</div>
                <div class="tech-desc">Client-side speech synthesis and recognition for voice-enabled rural job search without typing.</div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Tier 2 -->
        <div class="tier-card">
          <div class="tier-header">
            <span class="tier-icon">⚡</span>
            <span class="tier-name">Backend API Tier</span>
            <span class="tier-badge">Render Web Service</span>
          </div>
          <ul class="tech-list">
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Node.js 20 & Express 5</div>
                <div class="tech-desc">High-throughput REST API with async controllers, centralized error handling, and robust CORS whitelisting.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">JWT & Bcrypt Security</div>
                <div class="tech-desc">Stateless token authentication (32+ character secrets), salted password hashing, and role-based route guard.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Haversine Distance Engine</div>
                <div class="tech-desc">Mathematical great-circle distance algorithm calculating proximity in km between farm coordinates and workers.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Algorithmic Match Scoring</div>
                <div class="tech-desc">Multi-parameter heuristic scoring engine (crop expertise, proximity, wage parity) returning 60%–99% fit score.</div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Tier 3 -->
        <div class="tier-card">
          <div class="tier-header">
            <span class="tier-icon">🗄️</span>
            <span class="tier-name">Database Tier</span>
            <span class="tier-badge">MongoDB Atlas Cloud</span>
          </div>
          <ul class="tech-list">
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Mongoose 9 ODM</div>
                <div class="tech-desc">Strict schema validation, automated timestamps, pre-save hooks, and population of farmer/worker models.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Users Collection</div>
                <div class="tech-desc">Dual roles (Farmer & Worker) with skills arrays, phone, district, and farm profile data.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Jobs & Applications Collections</div>
                <div class="tech-desc">Job postings with 2dsphere GPS indices, daily wages, openings count, and 3-state application pipeline.</div>
              </div>
            </li>
            <li class="tech-item">
              <span class="tech-dot"></span>
              <div>
                <div class="tech-name">Notifications Collection</div>
                <div class="tech-desc">Phase 9 real-time alert event log with unread counts and direct job navigation links.</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="roadmap-strip">
        <div class="roadmap-title">
          <span>🚀</span> Hackathon Evaluation Transparency: Implemented Production vs. Future Roadmap
        </div>
        <div class="roadmap-grid">
          <div class="roadmap-item">
            <div class="roadmap-label">✓ Implemented: Core Marketplace (Phases 1-9)</div>
            <div class="roadmap-sub">Auth, Jobs, Applications, Leaflet Maps, 7 Languages, Notifications</div>
          </div>
          <div class="roadmap-item">
            <div class="roadmap-label">✓ Implemented: Algorithmic Heuristics</div>
            <div class="roadmap-sub">Haversine geo-distance, wage parity benchmarks, keyword speech intent</div>
          </div>
          <div class="roadmap-item" style="border-left-color: #38bdf8;">
            <div class="roadmap-label">📋 Planned: UPI Escrow & LLM Advisory (Phase 10)</div>
            <div class="roadmap-sub">PayPal/UPI payment gateway integration and Google Gemini API advisory</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <div>AgriConnect • Hackathon Submission 2026</div>
      <div>Frontend: Vercel • Backend: Render • Database: MongoDB Atlas (AWS Mumbai)</div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(archHtml, { waitUntil: 'domcontentloaded' });
  await saveScreenshot(page, '12-technology-architecture.png');

  await browser.close();
  await new Promise(r => server.close(r));
  console.log('✓ All 12 gallery images generated successfully in demo-preparation/project-gallery/!');
}

main().catch(err => {
  console.error('Generation error:', err);
  process.exit(1);
});
