<div align="center">

# 🦅 Aubi-Plus Job Automator

### End-to-End Recruitment Outreach System

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge\&logo=javascript\&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/Chrome_Ext-Manifest_V3-4285F4?style=for-the-badge\&logo=google-chrome\&logoColor=white)
![Status](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge)

<p align="center">
  <em>A specialized Chrome Extension designed to automate the lead generation process on aubi-plus.de, featuring intelligent DOM parsing and robust error handling.</em>
</p>

</div>

---

## 📖 Overview

This tool was engineered to solve a specific problem: the tedious manual extraction of contact details from apprenticeship listings on **Aubi-Plus**. Unlike standard scrapers, this extension handles the site's complex, nested DOM structure and variable layout patterns.

It navigates search results, opens job details in background tabs, extracts decision-maker contact info (Name, Email, Company), and exports clean CSV data for outreach campaigns.

---

## ⚙️ Technical Architecture

### 1. Manifest V3 Foundation

Built on the latest Chrome Extension standard using **Service Workers** (`background.js`) for persistent state management, ensuring compliance with modern browser security policies.

### 2. Smart DOM Traversal (`content.js`)

* **Multi-Selector Logic:** Uses an array of fallback selectors to find company names and emails, accounting for inconsistent page layouts across thousands of listings.
* **Data Sanitization:** Includes RegEx logic to clean "messy" names (e.g., removing titles like "Dipl.-Kfm.") before saving.
* **Hidden Email Handling:** Detects and extracts emails from `data-mail` attributes and protected `mailto:` links.

### 3. State Management

Tracks processed URLs to prevent duplicate scraping and manages concurrent tab processing to respect browser resources (RAM/CPU).

---

## 🚀 Key Features

| Feature                     | Description                                                                                |
| :-------------------------- | :----------------------------------------------------------------------------------------- |
| **🤖 Automated Navigation** | Iterates through pagination pages automatically without manual clicking.                   |
| **👻 Headless Extraction**  | Opens job details in non-active (background) tabs to keep the user workflow uninterrupted. |
| **💾 CSV Export**           | One-click download of structured data (Company, Contact Person, Email).                    |
| **🛡️ Resilience**          | Continues scraping even if individual pages fail to load or lack data.                     |

---

## 📂 Project Structure

```bash
Aubi-Plus-Automation-Suite/
├── manifest.json           # Manifest V3 Configuration
├── background.js           # Service Worker (State & Tab Management)
├── content.js              # DOM Scraper & Logic
├── popup.html              # Extension UI
├── popup.js                # UI Logic
└── README.md               # Documentation
```

## 💻 Installation

**Clone the repository:**

```bash
git clone https://github.com/redouanebou/Aubi-Plus-Automation-Suite.git
```

**Load  into  Chrome:**

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable Developer Mode (toggle in top right).
3. Click **Load Unpacked** and select the repository folder.

**Run:**

1. Navigate to aubi-plus.de search results.
2. Click the extension icon to open the popup.
3. Click **Start Scraping**.

---

⚠️ **Disclaimer**

<div align="center">
  Educational Purpose Only
</div>

This software demonstrates browser automation and DOM manipulation capabilities. The author (Redouane Boundra) is **not responsible** for misuse, including spamming, violation of platform TOS, or data privacy breaches.

* **Rate Limiting:** The tool includes delays to respect the target server. Do not remove them.
* **GDPR:** Ensure any extracted public contact data is handled in accordance with local privacy laws.

Engineered by Redouane Boundra - Python Developer & Automation Engineer.
