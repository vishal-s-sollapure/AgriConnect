# AgriConnect – Hackathon Video Demo Storyboard

**Format:** 1080p Full HD (1920 × 1080), 60 FPS, 16:9 Widescreen  
**Target Duration:** **2 minutes 40 seconds** (160 seconds) — Strictly under the 3:00 minute hackathon limit  
**Primary URLs:**  
- Production: `https://agri-connect-gamma-kohl.vercel.app/`  
- Local Fallback: `http://localhost:5173/`  

---

## Storyboard Overview & Timeline Map

```text
 0:00        0:15              0:40                     1:10                     1:35                  2:00               2:20          2:40
  |-----------|-----------------|------------------------|------------------------|---------------------|------------------|-------------|
  [ Intro &   ][ Auth & Roles   ][ Farmer: Job Creation  ][ Worker: Discovery &   ][ Hiring Lifecycle:  ][ Multilingual &   ][ Tech Stack  ]
  [ Problem   ][ Dual Portals   ][ & Location Map        ][ Interactive Map View  ][ Apply -> Accept     ][ Voice Assistant ][ & Wrap-up   ]
```

---

## Detailed Scene-by-Scene Breakdown

### Scene 1: Introduction & The Agricultural Labor Problem
- **Timestamp:** `0:00 – 0:15` (15 seconds)
- **Screen Action / Visual Choreography:**
  - Start on the **AgriConnect Landing Page** (`/`).
  - Clean browser window in Fullscreen (`F11`).
  - Cursor begins at the top-left logo **"🌾 AgriConnect"**, then smoothly scrolls down through the hero section highlighting the tagline: *"Connecting Indian Farmers with Local Agricultural Labor"*.
  - Briefly reveal the platform metric counters (Active Jobs, Registered Laborers, Verified Districts).
- **On-Screen Text Callout:**
  - `🌾 AgriConnect | Digital Marketplace for Agricultural Labor`
  - `Problem: Severe Seasonal Labor Shortages & Lack of Direct Discovery`
- **Narration Cue:**
  > *"Every harvest season, over 100 million Indian farmers face severe labor shortages, while millions of rural laborers struggle to find steady seasonal employment due to middlemen and fragmented communication. This is AgriConnect — a digital agricultural marketplace bridging farmers and local farm workers directly."*
- **Transition:** Smooth scroll back to hero section; click on **"Get Started"** or **"Login"**.

---

### Scene 2: Dual-Role Authentication & Role-Based Portals
- **Timestamp:** `0:15 – 0:40` (25 seconds)
- **Screen Action / Visual Choreography:**
  - Click **"Sign In"** in the top navbar. The **AuthModal** opens with a slick backdrop blur.
  - Demonstrate the two role tabs: **"👨‍🌾 Farmer"** and **"👷 Worker"**.
  - Log in as **Farmer Rajesh Patel** (`farmer@agriconnect.com`).
  - Modal closes, redirecting instantly to the **Farmer Dashboard** (`/farmer`).
  - Highlight the dashboard metrics: **Active Jobs (3)**, **Total Applicants (7)**, **Hired Workers (4)**.
- **On-Screen Text Callout:**
  - `Dual-Role JWT Authentication (Farmer & Worker)`
  - `Role-Protected Portals & Real-time Dashboards`
- **Narration Cue:**
  > *"AgriConnect is built as a two-sided marketplace with role-specific authentication. Farmers access a streamlined management portal with active listings and applicant pipelines, while workers receive a dedicated discovery dashboard tailored to their agricultural skills."*
- **Transition:** Quick click on **"Post New Job"** button on the Farmer Dashboard.

---

### Scene 3: Farmer Workflow — Job Creation & Location Pinning
- **Timestamp:** `0:40 – 1:10` (30 seconds)
- **Screen Action / Visual Choreography:**
  - Load the **Create Job** form (`/farmer/jobs/new`).
  - Show realistic pre-filled data:
    - Crop: **Sugarcane (ऊस)**
    - Work Type: **Harvesting & Bundling**
    - Headcount Needed: **8 Workers**
    - Daily Wage: **₹650 / Day**
    - Location: **Shirur, Pune District, Maharashtra**
  - Scroll down to the **Interactive Leaflet Location Picker Map**.
  - Click on the map to drop a farm coordinate pin (lat/lng coordinates update dynamically).
  - Click **"Publish Farm Job"**. A success toast pops up and the new job appears at the top of **My Jobs** (`/farmer/jobs`).
- **On-Screen Text Callout:**
  - `Interactive Leaflet & OpenStreetMap Geolocation`
  - `Dynamic Regional Wage Benchmarking`
- **Narration Cue:**
  > *"Posting a job takes less than a minute. Farmers specify crop type, required operations, daily wages, and drop a precise pin using interactive OpenStreetMap integration. Our system automatically provides wage parity guidance to ensure competitive, fair pay."*
- **Transition:** Log out as Farmer; switch view to Worker experience.

---

### Scene 4: Worker Workflow — Job Discovery, Filters & Interactive Map
- **Timestamp:** `1:10 – 1:35` (25 seconds)
- **Screen Action / Visual Choreography:**
  - Navigate to **Job Discovery** (`/jobs`).
  - Type `"Sugarcane"` into the search bar — the list filters instantly in real-time.
  - Show the filter chips: Crop, Wage Range (₹500 - ₹800), and Distance Radius (< 25 km).
  - Click the **"🗺️ Map View"** toggle button.
  - The view transforms into an interactive **Leaflet Map** showing cluster pins across Maharashtra.
  - Click on the farm pin in Pune to reveal the popup card showing: *"Sugarcane Harvesting – ₹650/day – 8 Openings – 12 km away"*.
  - Click the card to open **Job Details** (`/jobs/:id`).
- **On-Screen Text Callout:**
  - `Real-Time Search & Multi-Parameter Filter Engine`
  - `Proximity & Haversine Distance Calculation`
- **Narration Cue:**
  > *"Workers can discover jobs via instant search, crop filters, or an interactive map view powered by Leaflet. The system calculates exact travel proximity using the Haversine formula, so laborers can find work right in their home district without migrating."*
- **Transition:** Smooth scroll to the job details page action button.

---

### Scene 5: Application & Hiring Lifecycle — 1-Click Apply to Accept
- **Timestamp:** `1:35 – 2:00` (25 seconds)
- **Screen Action / Visual Choreography:**
  - On the Job Details page, click **"Apply for This Job"**.
  - A green badge flashes: **"Application Submitted Successfully!"**.
  - Navigate to **My Applications** (`/worker/applications`) showing the status badge: **"Pending Review"**.
  - Quick split-screen or fast cut to the **Farmer's Applicant Management view** (`/farmer/jobs/:id/applicants`).
  - The farmer sees worker **Suresh Kumar** with an **88% Match Compatibility Score**.
  - The farmer clicks the green **"Accept & Hire"** button.
  - Status updates instantly to **"Hired / Accepted"**, revealing direct phone contact details.
- **On-Screen Text Callout:**
  - `1-Click Worker Application & Status Tracking`
  - `Applicant Match Scoring & Direct Hiring Workflow`
- **Narration Cue:**
  > *"Applying is seamless with a single click. On the farmer's portal, applicants are ranked by skill affinity and commute distance. With one click, the farmer accepts the worker, unlocking verified direct contact and confirming the seasonal crew."*
- **Transition:** Cut back to the main navigation bar.

---

### Scene 6: Multilingual Accessibility & Voice Assistant
- **Timestamp:** `2:00 – 2:20` (20 seconds)
- **Screen Action / Visual Choreography:**
  - Click the **Language Switcher** dropdown in the top navigation bar.
  - Switch from **English** to **हिन्दी (Hindi)** — headings, buttons, and badges translate immediately.
  - Switch to **ಕನ್ನಡ (Kannada)** and **ગુજરાતી (Gujarati)** to show full vernacular coverage across 7 Indian languages.
  - Click the floating **Voice Assistant Widget** in the bottom-right corner.
  - Show the microphone wave animation and the prompt: *"खेत में गेहूं की कटाई के काम खोजें"*.
  - The assistant responds with localized TTS voice synthesis and auto-filters the jobs.
- **On-Screen Text Callout:**
  - `7 Indian Regional Languages (Hindi, Kannada, Gujarati, Marathi, Tamil, Telugu, English)`
  - `Web Speech Voice Assistant & Regional TTS Synthesis`
- **Narration Cue:**
  > *"To ensure true rural accessibility, AgriConnect supports 7 Indian regional languages with over 300 localized strings each. Our hands-free voice assistant enables low-literacy agricultural laborers to search for jobs in their native mother tongue using standard Web Speech synthesis."*
- **Transition:** Cut to closing screen showing GitHub repository and live deployment badge.

---

### Scene 7: Tech Stack, Live Deployment & Vision
- **Timestamp:** `2:20 – 2:40` (20 seconds)
- **Screen Action / Visual Choreography:**
  - Display the project architecture slide or GitHub repository tab:
    - Frontend: **React 18 + Vite** (Deployed on Vercel)
    - Backend: **Node.js + Express** (Deployed on Render)
    - Database: **MongoDB Atlas**
    - Mapping: **Leaflet & OpenStreetMap**
  - Show live browser tab at `agri-connect-gamma-kohl.vercel.app`.
  - Closing screen with AgriConnect logo, creator name, and repository link.
- **On-Screen Text Callout:**
  - `MERN Architecture | 100% Responsive | Production Deployed`
  - `Live at: agri-connect-gamma-kohl.vercel.app`
- **Narration Cue:**
  > *"Built with React, Node.js, Express, MongoDB Atlas, and Leaflet, AgriConnect is fully responsive, container-ready, and deployed live today. AgriConnect empowers Indian agriculture with dignified employment, transparent wages, and direct connectivity. Thank you!"*
- **Final Frame:** Fade to black at **2:38** (Total running time: **2m 38s**).

---

## Storyboard Production Checklist

| Scene # | Time Window | Key Click / Visual Event | Must-Show Highlight |
| :---: | :---: | :--- | :--- |
| **1** | `0:00 - 0:15` | Smooth page scroll on Landing Page | AgriConnect branding + Problem statement |
| **2** | `0:15 - 0:40` | Open Auth modal, toggle roles, login | Role-based dashboard metrics |
| **3** | `0:40 - 1:10` | Form fill + click Leaflet map pin + Submit | Pin coordinates + dynamic wage guide |
| **4** | `1:10 - 1:35` | Text search "Sugarcane" + switch to Map View | Interactive OSM pins + distance calculation |
| **5** | `1:35 - 2:00` | Click Apply -> Farmer portal -> Click Accept | 1-Click Apply + Applicant status change |
| **6** | `2:00 - 2:20` | Click Language switcher + open Voice Widget | English -> Hindi -> Kannada + Voice assistant |
| **7** | `2:20 - 2:40` | Show live URL + GitHub repo + Tech stack | Production deployment verification |
