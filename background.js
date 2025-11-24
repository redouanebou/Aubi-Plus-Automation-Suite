const scrapingManager = {
  state: {
    active: false,
    originalTabId: null, 
    data: [],
    currentJobTabId: null, 
    jobUrls: [], 
    currentIndex: 0 
  },


  startScraping: async function() {
    if (this.state.active) {
      this.sendStatus("Scraping already in progress");
      return;
    }

    console.log("[background.js] Starting scraping process");
    this.state.active = true;
    this.state.data = []; 
    this.state.currentIndex = 0;
    this.state.jobUrls = []; 
    this.sendStatus("Initializing...");

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      if (!tab.url.startsWith("https://www.aubi-plus.de/")) {
         this.sendStatus("Please navigate to aubi-plus.de to start scraping.");
         this.completeScraping(false); 
         return;
      }

      this.state.originalTabId = tab.id;
      console.log(`[background.js] Initializing on tab ${tab.id}`);

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

       const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.aubiPlusScraper) {
            return window.aubiPlusScraper.getJobUrls();
          }
          console.error("[content.js] aubiPlusScraper not found for getJobUrls");
          return [];
        }
      });

      this.state.jobUrls = result?.[0]?.result || [];
      console.log(`[background.js] Found ${this.state.jobUrls.length} job URLs`);

      if (this.state.jobUrls.length > 0) {
        this.sendStatus(`Found ${this.state.jobUrls.length} job listings. Starting...`);
        this.processNextJob();
      } else {
        this.sendStatus("No job listings found on this page with the specified selectors.");
        this.completeScraping(false);
      }
    } catch (error) {
      console.error("[background.js] Start scraping failed:", error);
      this.sendStatus(`Start failed: ${error.message}`);
      this.completeScraping(false);
    }
  },

  processNextJob: async function() {
    if (!this.state.active) {
      console.log("[background.js] Scraping inactive, stopping job processing.");
      this.completeScraping(); 
      return;
    }

    if (this.state.currentIndex >= this.state.jobUrls.length) {
      console.log("[background.js] Reached end of job list.");
      this.completeScraping();
      return;
    }

    const jobUrl = this.state.jobUrls[this.state.currentIndex];
    const currentIndexForThisJob = this.state.currentIndex; 
    this.state.currentIndex++; 

    this.state.currentJobTabId = null; 
    this.sendStatus(`Processing job ${currentIndexForThisJob + 1} of ${this.state.jobUrls.length}...`);

    try {
      const tab = await chrome.tabs.create({ url: jobUrl, active: true }); 
      this.state.currentJobTabId = tab.id;
      console.log(`[background.js] Opened job tab ${tab.id} for URL: ${jobUrl}`);

      await new Promise((resolve, reject) => {
          const listener = (tabId, changeInfo, updatedTab) => {
              if (tabId === tab.id && changeInfo.status === 'complete') {
                  if (updatedTab.url === jobUrl || updatedTab.url.startsWith(jobUrl)) {
                      chrome.tabs.onUpdated.removeListener(listener); 
                      resolve();
                  }
              }
          };
          chrome.tabs.onUpdated.addListener(listener);
          setTimeout(() => {
              chrome.tabs.onUpdated.removeListener(listener);
              console.warn(`[background.js] Timeout waiting for tab ${tab.id} to load or verify URL.`);
              resolve(); 
          }, 15000); 
      });

      console.log(`[background.js] Tab ${tab.id} loaded (or timed out). Injecting content script.`);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      console.log(`[background.js] Content script injected into tab ${tab.id}. Attempting extraction.`);
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.aubiPlusScraper) {
            return window.aubiPlusScraper.extractData(); 
          }
          console.error("[content.js] aubiPlusScraper not available for extraction");
          return null;
        }
      });

      const extractedData = result?.[0]?.result;


      if (extractedData && extractedData.email && extractedData.email !== 'N/A' && extractedData.email !== 'Error') {
        this.state.data.push(extractedData); 
        console.log(`[background.js] Collected data with email for job ${currentIndexForThisJob + 1}`, extractedData);
        this.sendStatus(`Processed job ${currentIndexForThisJob + 1}: Data collected.`);
      } else {
         console.warn(`[background.js] Skipping data for job ${currentIndexForThisJob + 1} due to missing/invalid email.`, extractedData);
         this.sendStatus(`Processed job ${currentIndexForThisJob + 1}: No valid email, skipping.`);
      }

    } catch (error) {
      console.error(`[background.js] Job ${currentIndexForThisJob + 1} processing failed:`, error);
      this.sendStatus(`Processing job ${currentIndexForThisJob + 1} failed.`);
    } finally {
      if (this.state.currentJobTabId) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          await chrome.tabs.remove(this.state.currentJobTabId);
          console.log(`[background.js] Closed job tab ${this.state.currentJobTabId}`);
        } catch (e) {
          console.warn(`[background.js] Could not close tab ${this.state.currentJobTabId}:`, e);
        }
        this.state.currentJobTabId = null;
      }

      if (this.state.active) {
        setTimeout(() => this.processNextJob(), 500); 
      } else {
         console.log("[background.js] Scraping stopped during job processing, finalizing.");
         this.completeScraping();
      }
    }
  },

  stopScrapingProcess: function() {
    if (!this.state.active) {
      this.sendStatus("No active scraping to stop");
      return;
    }

    console.log("[background.js] Stopping scraping process");
    this.state.active = false; 
    this.sendStatus("Stopping...");

    if (this.state.currentJobTabId) {
        try {

            chrome.tabs.remove(this.state.currentJobTabId).catch(e => console.warn("[background.js] Non-critical: Could not close current job tab on stop:", e));
        } catch (e) {
            console.warn("[background.js] Error attempting to close current job tab on stop:", e);
        }
        this.state.currentJobTabId = null;
    }
    

    setTimeout(() => {
        if (this.state.active === false && !this.state.dataSaved) { 
             console.log("[background.js] stopScrapingProcess calling completeScraping.");
        }
        if (!this.state.jobUrls[this.state.currentIndex] && !this.state.currentJobTabId) {
            this.completeScraping();
        }

    }, 200); 
  },

  completeScraping: function(openDisplay = true) {
    if (this.state.isCompleting) return;
    this.state.isCompleting = true;

    this.state.active = false; 
    const collectedCount = this.state.data.length;
    const statusMessage = `Finished. Collected ${collectedCount} entries (with email)`; 

    console.log(`[background.js] ${statusMessage}`);
    this.sendStatus(statusMessage);

    chrome.storage.local.set({ scrapedData: this.state.data }, () => {
      this.state.isCompleting = false; 
      if (chrome.runtime.lastError) {
        console.error("[background.js] Data save failed:", chrome.runtime.lastError);
        this.sendStatus("Data save failed");
      } else {
        console.log("[background.js] Data saved successfully");
      }
      if (openDisplay) {
        this.openDataDisplayPage();
      }
    });
  },

  openDataDisplayPage: function() {
    chrome.tabs.create({ url: 'data_display.html' })
      .then(tab => console.log(`[background.js] Opened display tab ${tab.id}`))
      .catch(e => console.error("[background.js] Failed to open display:", e));
  },

  sendStatus: function(status) {
    chrome.runtime.sendMessage({ action: "updateStatus", status })
      .catch(e => console.warn("[background.js] Status update failed:", e)); 
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[background.js] Received message:", message?.action);
  try {
    switch (message?.action) {
      case "startScraping":
        scrapingManager.state.isCompleting = false; 
        scrapingManager.startScraping();
        break;
      case "stopScraping":
        scrapingManager.stopScrapingProcess();
        sendResponse({ status: "Stop request received by background." }); 
        return true; 
      case "openDataPage":
        scrapingManager.openDataDisplayPage();
        break;
      case "updateStatus":
        scrapingManager.sendStatus(message.status);
        break;
      default:
        console.warn("[background.js] Unknown message:", message?.action);
    }
  } catch (error) {
    console.error("[background.js] Message handler error:", error);
    scrapingManager.sendStatus(`Error: ${error.message}`);
  }
  return false; 
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === scrapingManager.state.originalTabId) {
    console.log("[background.js] Original tab closed, stopping scraping");
    if (scrapingManager.state.active) { 
        scrapingManager.stopScrapingProcess();
    }
  } else if (tabId === scrapingManager.state.currentJobTabId) {
    console.log("[background.js] Job tab closed prematurely (e.g., by user)");
    scrapingManager.state.currentJobTabId = null; 
    if (scrapingManager.state.active) {
       console.log("[background.js] Attempting to proceed to next job after premature tab close.");
    }
  }
});

console.log("[background.js] Background script loaded");