document.addEventListener('DOMContentLoaded', () => {
  const dataContainer = document.getElementById('data-container');
  dataContainer.innerHTML = ''; 
  console.log("[data_display.js] Loading data...");

  chrome.storage.local.get(['scrapedData'], (result) => {
    if (chrome.runtime.lastError) {
      console.error("[data_display.js] Error loading data:", chrome.runtime.lastError);
      dataContainer.innerHTML = '<p style="color: red;">Error loading data</p>';
      return;
    }

    const scrapedData = result.scrapedData;
    console.log("[data_display.js] Retrieved data:", scrapedData);

    if (scrapedData && scrapedData.length > 0) {
      console.log(`[data_display.js] Displaying ${scrapedData.length} entries`);

      const table = document.createElement('table');
      table.className = 'data-table';

      const thead = table.createTHead();
      const headerRow = thead.insertRow();
      const displayHeaders = ["Company Name", "Name", "Email"];
      displayHeaders.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });

      const tbody = table.createTBody();
      let validEntriesCount = 0;
      scrapedData.forEach((entry) => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${entry.companyName || 'N/A'}</td>
          <td>${entry.name || 'N/A'}</td>
          <td>${entry.email || 'N/A'}</td>
        `;
        validEntriesCount++;
        if (entry.error) {
            row.style.backgroundColor = '#ffebee';
            row.title = `Error: ${entry.error}`;
        }
      });

      if (validEntriesCount === 0) {
           dataContainer.innerHTML = '<p>No valid data with email collected to display.</p>';
      } else {
           dataContainer.appendChild(table);

            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download Data (CSV)';
            downloadButton.style.marginTop = '20px';
            downloadButton.style.padding = '10px';
            downloadButton.style.backgroundColor = '#28a745';
            downloadButton.style.color = 'white';
            downloadButton.style.border = 'none';
            downloadButton.style.borderRadius = '4px';
            downloadButton.style.cursor = 'pointer';

            downloadButton.addEventListener('click', () => {
                const dataToDownload = scrapedData;
                const csvData = convertToCSV(dataToDownload); 
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'aubi_plus_scraped_data.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            dataContainer.appendChild(downloadButton);
      }
    } else {
      console.log("[data_display.js] No data found");
      dataContainer.innerHTML = '<p>No data collected yet (or no entries with email were found).</p>';
    }
  });
});

function convertToCSV(data) {
  const csvHeaders = ["Company Name", "Name", "Email"];
  const csvRows = [];
  csvRows.push(csvHeaders.join(','));

  for (const item of data) {
    const values = [
      item.companyName || 'N/A',
      item.name || 'N/A',
      item.email || 'N/A'
    ].map(value => {
      const stringValue = String(value);
      const escapedValue = stringValue.replace(/"/g, '""'); 
      return `"${escapedValue}"`; 
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}