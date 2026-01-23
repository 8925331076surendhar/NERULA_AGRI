/**
 * Component: Reports & History
 * Allows users to filter historical disease data and download logs
 */

window.initReports = function () {
    const container = document.getElementById('reports-panel');
    if (!container) return;

    // Render Reports UI
    container.innerHTML = `
        <div class="panel-header">
            <h2><i class="fa-solid fa-file-contract"></i> Disease History Report</h2>
            <div class="controls">
                <button class="btn-icon" onclick="window.print()"><i class="fa-solid fa-print"></i></button>
            </div>
        </div>
        
        <div class="report-controls" style="padding:1rem; display:flex; gap:1rem; align-items:center; background:rgba(0,0,0,0.2); margin-bottom:1rem; border-radius:8px;">
            <div class="form-group" style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.8rem; color:#aaa;">From Date:</label>
                <input type="date" id="date-from" style="padding:6px; background:#1e293b; border:1px solid #334155; color:white; border-radius:4px;">
            </div>
            <div class="form-group" style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.8rem; color:#aaa;">To Date:</label>
                <input type="date" id="date-to" style="padding:6px; background:#1e293b; border:1px solid #334155; color:white; border-radius:4px;">
            </div>
            <button onclick="generateReportData()" style="height:36px; margin-top:1.2rem; background:var(--primary); color:white; border:none; padding:0 20px; border-radius:4px; font-weight:600; cursor:pointer;">
                <i class="fa-solid fa-filter"></i> Generate
            </button>
             <button onclick="downloadCSV()" style="height:36px; margin-top:1.2rem; background:#3b82f6; color:white; border:none; padding:0 20px; border-radius:4px; font-weight:600; cursor:pointer; margin-left:auto;">
                <i class="fa-solid fa-download"></i> Download CSV
            </button>
        </div>

        <div class="report-table-container" style="flex:1; overflow:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                <thead style="background:#0f172a; position:sticky; top:0;">
                    <tr>
                        <th style="padding:12px; text-align:left; color:#94a3b8;">Date & Time</th>
                        <th style="padding:12px; text-align:left; color:#94a3b8;">Location (Sector)</th>
                        <th style="padding:12px; text-align:left; color:#94a3b8;">Detected Disease</th>
                        <th style="padding:12px; text-align:left; color:#94a3b8;">Severity</th>
                        <th style="padding:12px; text-align:left; color:#94a3b8;">Status</th>
                    </tr>
                </thead>
                <tbody id="report-rows">
                    <tr><td colspan="5" style="padding:20px; text-align:center; color:#666;">Select dates and click Generate</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Set Default Dates (Today)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-from').value = today;
    document.getElementById('date-to').value = today;
}

let currentReportData = [];

window.generateReportData = function () {
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    const tbody = document.getElementById('report-rows');

    if (!from || !to) {
        alert("Please select both dates.");
        return;
    }

    // Mock Data Generation based on range
    const rows = [];
    const diseases = ['Leaf Blight', 'Brown Spot', 'Rice Blast', 'Stem Borer', 'Hispa'];
    const severities = ['Low', 'Medium', 'High'];
    const locations = ['Sector A (North)', 'Sector A (East)', 'Sector B (West)', 'Sector B (South)'];

    // Generate random 5-15 entries
    const count = 5 + Math.floor(Math.random() * 10);
    currentReportData = [];

    for (let i = 0; i < count; i++) {
        const date = from; // Simplify to selected range for demo
        const time = `${10 + Math.floor(Math.random() * 5)}:${10 + Math.floor(Math.random() * 50)} AM`;
        const item = {
            datetime: `${date} ${time}`,
            location: locations[Math.floor(Math.random() * locations.length)],
            disease: diseases[Math.floor(Math.random() * diseases.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: Math.random() > 0.3 ? 'Resolved' : 'Pending Action'
        };
        rows.push(item);
        currentReportData.push(item);
    }

    // Render
    tbody.innerHTML = rows.map(r => `
        <tr style="border-bottom:1px solid #1e293b;">
            <td style="padding:12px;">${r.datetime}</td>
            <td style="padding:12px;">${r.location}</td>
            <td style="padding:12px;"><span style="color:${getReportColor(r.disease)}">${r.disease}</span></td>
            <td style="padding:12px;"><span class="badge ${r.severity.toLowerCase()}">${r.severity}</span></td>
            <td style="padding:12px;">${r.status}</td>
        </tr>
    `).join('');
}

function getReportColor(d) {
    if (d.includes('Blight') || d.includes('Blast')) return '#ef4444';
    if (d.includes('Spot')) return '#fbbf24';
    return '#fff';
}

window.downloadCSV = function () {
    if (currentReportData.length === 0) {
        alert("No data to download. Generate a report first.");
        return;
    }

    const csvRows = [];
    // Header
    csvRows.push(['Date Time', 'Location', 'Disease', 'Severity', 'Status']);

    // Data
    currentReportData.forEach(r => {
        csvRows.push([r.datetime, r.location, r.disease, r.severity, r.status]);
    });

    const csvString = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'agri_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
