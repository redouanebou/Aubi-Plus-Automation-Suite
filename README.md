# Job-Application-Automator2
🦅 Aubi-Plus Job Automator
A specialized Manifest V3 Chrome Extension designed to automate the lead generation process on aubi-plus.de. Features intelligent DOM parsing, robust error handling, and state-managed pagination.

📖 Overview
This tool was engineered to solve a specific problem: the tedious manual extraction of contact details from apprenticeship listings on Aubi-Plus. Unlike standard scrapers, this extension handles the site's complex, nested DOM structure and variable layout patterns.

It navigates search results, opens job details in background tabs, extracts decision-maker contact info (Name, Email, Company), and exports clean CSV data for outreach campaigns.

⚙️ Technical Architecture
Manifest V3: Built on the latest Chrome Extension standard using Service Workers (background.js) for persistent state management.

Smart DOM Traversal (content.js):

Multi-Selector Logic: Uses an array of fallback selectors to find company names and emails, accounting for inconsistent page layouts.

Data Sanitization: Includes logic to clean "messy" names (e.g., removing titles like "Dipl.-Kfm.") before saving.

Hidden Email Handling: Detects and extracts emails from data-mail attributes and protected mailto: links.

State Management: Tracks processed URLs to prevent duplicate scraping and manages concurrent tab processing to respect browser resources.

🚀 Features
** automated Navigation:** Iterates through job listings automatically without manual clicking.

Headless Extraction: Opens job details in non-active tabs to keep the user workflow uninterrupted.

CSV Export: One-click download of structured data (Company, Contact Person, Email).

Resilience: Continues scraping even if individual pages fail to load or lack data.

💻 Installation
Clone this repository:

Bash

git clone https://github.com/redouanebou/AubiPlus-Job-Automator.git
Open Chrome and navigate to chrome://extensions/.

Enable Developer Mode (top right).

Click Load Unpacked and select this folder.

Go to aubi-plus.de search results and click the extension icon to start.

⚠️ Disclaimer
Educational Purpose Only. This software involves browser automation and scraping. It is intended for personal use to streamline a specific job search workflow.

Rate Limiting: The tool includes delays to respect the target server. Do not remove them.

Compliance: Ensure you comply with aubi-plus.de Terms of Service.

GDPR: This tool processes public contact data. Handle this data responsibly and in accordance with privacy laws.

The author is not responsible for misuse of this code.

Author: Redouane Boundra Python Developer & Automation Engineer
