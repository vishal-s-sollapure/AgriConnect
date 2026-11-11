const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve('c:/Users/VISHAL/OneDrive/Desktop/AgriConnect/AgriConnect/client/dist');

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
    farmerId: 'farmer_001',
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
    farmerId: 'farmer_001',
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
    farmerId: 'farmer_002',
    farmerName: 'Gajanan Deshmukh',
    farmName: 'Deshmukh Cotton Estates',
    farmerPhone: '+91 98765 43214',
    description: 'Second-cycle cotton picking. Fair per-day wages with bonus for clean quality lint separation.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'job_004',
    title: 'Paddy / Rice Harvesting',
    crop: 'Paddy / Rice',
    workType: 'Harvesting',
    location: {
      address: 'Alibag, Raigad, Maharashtra',
      village: 'Alibag',
      district: 'Raigad',
      state: 'Maharashtra',
      coordinates: [72.8767, 18.6414]
    },
    wage: 680,
    wageType: 'daily',
    workersNeeded: 6,
    openingsCount: 6,
    durationDays: 10,
    startDate: '2026-11-28T00:00:00.000Z',
    endDate: '2026-12-08T00:00:00.000Z',
    status: 'open',
    farmerId: 'farmer_003',
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
    workerId: {
      _id: 'worker_001',
      name: 'Ramesh Kumar',
      phone: '+91 98765 43211',
      location: 'Shirur, Pune District, Maharashtra',
      skills: ['Harvesting', 'Sowing', 'Spraying'],
      experienceYears: 6
    },
    status: 'accepted',
    proposedWage: 650,
    appliedAt: '2026-11-10T10:30:00.000Z',
    notes: 'Available immediately for full 14 days with team of 2 relatives.'
  },
  {
    _id: 'app_002',
    jobId: 'job_001',
    workerId: {
      _id: 'worker_002',
      name: 'Suresh Patil',
      phone: '+91 98765 43222',
      location: 'Khed, Pune District, Maharashtra',
      skills: ['Harvesting', 'Bundling'],
      experienceYears: 4
    },
    status: 'pending',
    proposedWage: 650,
    appliedAt: '2026-11-10T14:15:00.000Z',
    notes: 'Experienced in sugarcane cutting and loading onto trailers.'
  },
  {
    _id: 'app_003',
    jobId: 'job_001',
    workerId: {
      _id: 'worker_003',
      name: 'Sunita Shinde',
      phone: '+91 98765 43233',
      location: 'Shirur, Pune District, Maharashtra',
      skills: ['Harvesting', 'Weeding'],
      experienceYears: 5
    },
    status: 'pending',
    proposedWage: 650,
    appliedAt: '2026-11-11T09:00:00.000Z',
    notes: 'Local agricultural worker from Shirur village.'
  }
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, 'http://127.0.0.1:4173');
  const pathname = parsedUrl.pathname;

  // Mock API endpoints
  if (pathname === '/api/jobs' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      jobs: MOCK_JOBS,
      pagination: { page: 1, limit: 9, total: MOCK_JOBS.length, totalPages: 1 }
    }));
    return;
  }

  if (pathname === '/api/jobs/my-jobs') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
    }));
    return;
  }

  if (pathname.startsWith('/api/jobs/') && pathname.endsWith('/applicants')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      job: MOCK_JOBS[0],
      applicants: MOCK_APPLICANTS,
      stats: { total: 3, pending: 2, accepted: 1, rejected: 0 }
    }));
    return;
  }

  if (pathname.startsWith('/api/jobs/') && req.method === 'GET') {
    const id = pathname.replace('/api/jobs/', '');
    const job = MOCK_JOBS.find(j => j._id === id) || MOCK_JOBS[0];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, job }));
    return;
  }

  if (pathname === '/api/applications/my-applications') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      applications: MOCK_APPLICANTS.map(a => ({
        ...a,
        job: MOCK_JOBS[0]
      })),
      stats: { total: 3, pending: 2, accepted: 1, rejected: 0 }
    }));
    return;
  }

  if (pathname === '/api/notifications') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
          title: 'Hiring Confirmed',
          message: 'Ramesh Kumar was accepted for Sugarcane Harvesting.',
          type: 'application_accepted',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'notif_003',
          title: 'Regional Wage Advisory',
          message: 'Pune district sugarcane harvesting wage parity updated to ₹650/day.',
          type: 'system_alert',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      unreadCount: 1
    }));
    return;
  }

  if (pathname === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: {
        _id: 'farmer_001',
        name: 'Rajesh Patel',
        email: 'farmer@agriconnect.com',
        role: 'farmer',
        phone: '+91 98765 43210',
        location: 'Shirur, Pune District, Maharashtra',
        farmName: 'Patel Organic Farms'
      }
    }));
    return;
  }

  // Static file serving from DIST_DIR
  let filePath = path.join(DIST_DIR, pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + pathname);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(4173, '127.0.0.1', () => {
  console.log('AgriConnect local test server running at http://127.0.0.1:4173');
});
