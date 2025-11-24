document.getElementById('startScraping').addEventListener('click', () => {
  document.getElementById('startScraping').disabled = true;
  document.getElementById('stopScraping').disabled = false;
  document.getElementById('status').textContent = "Sending start request...";
  chrome.runtime.sendMessage({ action: "startScraping" });
});

document.getElementById('stopScraping').addEventListener('click', () => {
  document.getElementById('stopScraping').disabled = true;
  document.getElementById('status').textContent = "Sending stop request...";
  chrome.runtime.sendMessage({ action: "stopScraping" });
});

document.getElementById('showData').addEventListener('click', () => {
  console.log("[popup.js] 'Show Collected Data' button clicked.");
  document.getElementById('status').textContent = "Opening data page...";
  chrome.runtime.sendMessage({ action: "openDataPage" });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.status) {
    console.log(`[popup.js] Status Update: ${message.status}`);
    document.getElementById('status').textContent = message.status;

    if (message.status.includes("Finished") || message.status.includes("Stopped") || message.status.includes("failed") || message.status.includes("No items found")) {
      document.getElementById('startScraping').disabled = false;
      document.getElementById('stopScraping').disabled = true;  should be disabled when finished
    } else if (message.status.includes("Starting") || message.status.includes("Processing")) {
       document.getElementById('startScraping').disabled = true;
       document.getElementById('stopScraping').disabled = false;
    } else if (message.status.includes("Ready")) {
       document.getElementById('startScraping').disabled = false;
       document.getElementById('stopScraping').disabled = true;
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('stopScraping').disabled = true; 
});
