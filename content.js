
if (typeof window.aubiPlusScraper === 'undefined') {
  window.aubiPlusScraper = {
     
    listingItemSelector: "div.result-container div.my-3.text-primary-dark.overflow-hidden.rounded-3",


    jobLinkSelector: "a.stretched-link",


    nameSelectors: [

        "#sidebar div.col-9.ps-3 > div strong",
    ],
    emailElementSelectors: [
        "#sidebar div.col-9.ps-3 > div a.mail-protect",
    ],
    companyNameSelectors: [
        "main .card h2 a",
        "div.ap-profile-company-name a",                
        "h2 > a[href*='/premium/']",                  
        "h2 > a[href*='/firmenprofil/']",             
        "a[href*='/premium/']",                       
        "#sidebar div.text-truncate > a[href*='/firmenprofil']", 
        "a[title*='Ausbildung bei'], a[title*='Duales Studium bei']", 
        "section[class*='job-details'] h2 a", 
        "div.card-body h2 a" 
    ],

    getJobUrls: function() {
      try {
        const listingItems = document.querySelectorAll(this.listingItemSelector);
        const jobUrls = [];
        console.log(`[content.js] getJobUrls: Found ${listingItems.length} potential listing items with selector: ${this.listingItemSelector}`);
        listingItems.forEach((item, index) => {
          const linkElement = item.querySelector(this.jobLinkSelector);
          if (linkElement && linkElement.href && linkElement.href.startsWith('http')) {
            jobUrls.push(linkElement.href);
            console.log(`[content.js] getJobUrls: Found valid job URL for item ${index}: ${linkElement.href}`);
          } else {
             console.warn(`[content.js] getJobUrls: Could not find a valid job detail link with selector "${this.jobLinkSelector}" within item ${index}.`, item);
          }
        });
        console.log(`[content.js] getJobUrls: Finished collecting URLs. Found ${jobUrls.length} job URLs.`);
        return jobUrls;
      } catch (error) {
        console.error("[content.js] getJobUrls failed:", error);
        return [];
      }
    },

    extractData: function() {
      console.log("[content.js] extractData: Starting data extraction on job detail page.");
      try {
        let name = "N/A";
        for (const selector of this.nameSelectors) {
            const nameElement = document.querySelector(selector);
            if (nameElement && nameElement.textContent.trim()) {
                let rawName = nameElement.textContent.trim();
                

                if (rawName.includes('.-')) {
                    name = rawName.split('.-')[0].trim();
                } else {
                    name = rawName;
                }
                
                console.log(`[content.js] extractData: Extracted Name "${name}" (processed from "${rawName}") using selector: ${selector}`);
                break;
            }
        }
        if (name === "N/A") {
             console.warn(`[content.js] extractData: Could not find name using any of the provided selectors.`);
        }

        let email = "N/A";
        let emailElement = null;
        for (const selector of this.emailElementSelectors) {
            emailElement = document.querySelector(selector);
            if (emailElement) {
                console.log(`[content.js] extractData: Found email element using selector: ${selector}`);
                break;
            }
        }
        if (emailElement) {
            const dataMail = emailElement.getAttribute('data-mail');
            if (dataMail) {
                email = dataMail.replace(/###/g, '').trim();
                console.log(`[content.js] extractData: Extracted email from data-mail attribute: ${email}`);
            } else if (emailElement.href && emailElement.href.startsWith('mailto:')) {
                 email = emailElement.href.replace("mailto:", "").split('?')[0].trim();
                 console.log(`[content.js] extractData: Extracted email from mailto: href: ${email}`);
            } else if (emailElement.textContent.trim().includes('@')) {
                 email = emailElement.textContent.trim();
                 console.log(`[content.js] extractData: Extracted email from textContent: ${email}`);
            } else {
                 console.warn(`[content.js] extractData: Email element found but could not extract email.`);
            }
        } else {
             console.warn(`[content.js] extractData: Email element not found using any of the provided selectors.`);
        }


        let companyName = "N/A";
        for (const selector of this.companyNameSelectors) {
            const companyElement = document.querySelector(selector);
            if (companyElement && companyElement.textContent.trim()) {
                companyName = companyElement.textContent.trim();
                console.log(`[content.js] extractData: Extracted Company Name "${companyName}" using selector: ${selector}`);
                break;
            }
        }
        if (companyName === "N/A") {
             console.warn(`[content.js] extractData: Could not find company name using any of the provided selectors.`);
        }

        console.log(`[content.js] extractData: Final Extracted Data - Name: "${name}", Email: "${email}", Company: "${companyName}" from ${window.location.href}`);

        if (name === "N/A" && email === "N/A" && companyName === "N/A") { 
             console.warn(`[content.js] extractData: Could not extract name, email, or company name from ${window.location.href}.`);
             return {
                name: 'N/A',
                email: 'N/A',
                companyName: 'N/A',
                error: `Data not found with selectors on detail page`,
                url: window.location.href,
                timestamp: new Date().toISOString()
             };
        }

        return {
          name: name,
          email: email,
          companyName: companyName, 
          url: window.location.href,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error("[content.js] extractData failed:", error);
        return {
           name: 'Error',
           email: 'Error',
           companyName: 'Error', 
           error: `Extraction error: ${error.message}`,
           url: window.location.href,
           timestamp: new Date().toISOString()
        };
      }
    }
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[content.js] Received message:", request?.action);
});

console.log("[content.js] Content script loaded successfully for aubi-plus.de (More General Selectors)");
