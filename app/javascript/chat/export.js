import { getCSRFToken, uniqueId, scrollToBottom, isHtmlContent } from './utils.js';
// Fonctions d'export pour charts et tables

export function addExportMenu(messageElement, type, targetId) {
  const menuBtn = document.createElement("button");
  menuBtn.innerHTML = '<i class="fas fa-ellipsis-vertical"></i>';
  menuBtn.className = "export-menu-btn";
  menuBtn.style.position = "absolute";
  menuBtn.style.top = "8px";
  menuBtn.style.right = "8px";
  menuBtn.style.background = "none";
  menuBtn.style.border = "none";
  menuBtn.style.cursor = "pointer";
  menuBtn.style.color = "#555";
  menuBtn.style.zIndex = "10";

  const menu = document.createElement("div");
  menu.className = "export-menu";
  menu.style.position = "absolute";
  menu.style.top = "36px";
  menu.style.right = "-160px";
  menu.style.background = "#fff";
  menu.style.color = "#222";
  menu.style.border = "1px solid #ccc";
  menu.style.borderRadius = "10px";
  menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  menu.style.display = "none";
  menu.style.minWidth = "140px";
  menu.style.fontSize = "1rem";
  menu.style.zIndex = "1000";

  // PDF
  const pdfOption = document.createElement("div");
  pdfOption.textContent = "Télécharger en PDF";
  pdfOption.className = "export-menu-item";
  pdfOption.style.padding = "10px";
  pdfOption.style.cursor = "pointer";
  pdfOption.onmouseover = () => pdfOption.style.background = "#eee";
  pdfOption.onmouseout = () => pdfOption.style.background = "none";
  pdfOption.onclick = function() {
    menu.style.display = "none";
    if (type === "chart") {
      exportChartAsPDF(targetId);
    } else if (type === "table") {
      exportTableAsPDF(targetId);
    }
  };
  menu.appendChild(pdfOption);

  // PNG
  const pngOption = document.createElement("div");
  pngOption.textContent = "Télécharger en PNG";
  pngOption.className = "export-menu-item";
  pngOption.style.padding = "10px";
  pngOption.style.cursor = "pointer";
  pngOption.onmouseover = () => pngOption.style.background = "#eee";
  pngOption.onmouseout = () => pngOption.style.background = "none";
  pngOption.onclick = function() {
    menu.style.display = "none";
    if (type === "chart") {
      exportChartAsPNG(targetId);
    } else if (type === "table") {
      exportTableAsPNG(targetId);
    }
  };
  menu.appendChild(pngOption);

  // CSV
  const csvOption = document.createElement("div");
  csvOption.textContent = "Télécharger en CSV";
  csvOption.className = "export-menu-item";
  csvOption.style.padding = "10px";
  csvOption.style.cursor = "pointer";
  csvOption.onmouseover = () => csvOption.style.background = "#eee";
  csvOption.onmouseout = () => csvOption.style.background = "none";
  csvOption.onclick = function() {
    menu.style.display = "none";
    if (type === "chart") {
      exportChartAsCSV(targetId);
    } else if (type === "table") {
      exportTableAsCSV(targetId);
    }
  };
  menu.appendChild(csvOption);

  // Excel
  const excelOption = document.createElement("div");
  excelOption.textContent = "Télécharger en Excel";
  excelOption.className = "export-menu-item";
  excelOption.style.padding = "10px";
  excelOption.style.cursor = "pointer";
  excelOption.onmouseover = () => excelOption.style.background = "#eee";
  excelOption.onmouseout = () => excelOption.style.background = "none";
  excelOption.onclick = function() {
    menu.style.display = "none";
    if (type === "chart") {
      exportChartAsExcel(targetId);
    } else if (type === "table") {
      exportTableAsExcel(targetId);
    }
  };
  menu.appendChild(excelOption);

  menuBtn.onclick = function(e) {
    e.stopPropagation();
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  };
  document.addEventListener("click", function() {
    menu.style.display = "none";
  });

  const bubble = messageElement.querySelector('.bubble');
  if (bubble) {
    bubble.appendChild(menuBtn);
    bubble.appendChild(menu);
  } else {
    messageElement.appendChild(menuBtn);
    messageElement.appendChild(menu);
  }
}

export function exportChartAsPDF(chartId) {
  const chartCanvas = document.getElementById(chartId);
  html2canvas(chartCanvas, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("landscape");
    pdf.addImage(imgData, "PNG", 10, 10, 280, 160);
    pdf.save("chart.pdf");
  });
}
export function exportChartAsPNG(chartId) {
  const chartCanvas = document.getElementById(chartId);
  html2canvas(chartCanvas, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "chart.png";
    link.click();
  });
}
export function exportChartAsCSV(chartId) {
  const chart = Chart.getChart(chartId);
  if (!chart) return;
  let csv = [];
  let header = ["Label", ...chart.data.datasets.map(ds => ds.label || "Série")];
  csv.push(header.join(","));
  chart.data.labels.forEach((label, i) => {
    let row = [label];
    chart.data.datasets.forEach(ds => {
      row.push(ds.data[i]);
    });
    csv.push(row.join(","));
  });
  const csvContent = csv.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chart.csv";
  link.click();
}
export function exportChartAsExcel(chartId) {
  const chart = Chart.getChart(chartId);
  if (!chart || typeof XLSX === 'undefined') return;
  let ws_data = [];
  let header = ["Label", ...chart.data.datasets.map(ds => ds.label || "Série")];
  ws_data.push(header);
  chart.data.labels.forEach((label, i) => {
    let row = [label];
    chart.data.datasets.forEach(ds => {
      row.push(ds.data[i]);
    });
    ws_data.push(row);
  });
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Chart");
  XLSX.writeFile(wb, "chart.xlsx");
}
export function exportTableAsPDF(tableId) {
  const table = document.getElementById(tableId);
  html2canvas(table, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("landscape");
    pdf.addImage(imgData, "PNG", 10, 10, 280, 160);
    pdf.save("table.pdf");
  });
}
export function exportTableAsPNG(tableId) {
  const table = document.getElementById(tableId);
  html2canvas(table, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "table.png";
    link.click();
  });
}
export function exportTableAsCSV(tableId) {
  const table = document.getElementById(tableId);
  let csv = [];
  for (let row of table.rows) {
    let rowData = [];
    for (let cell of row.cells) {
      rowData.push('"' + cell.innerText.replace(/"/g, '""') + '"');
    }
    csv.push(rowData.join(","));
  }
  const csvContent = csv.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "table.csv";
  link.click();
}
export function exportTableAsExcel(tableId) {
  if (typeof XLSX === 'undefined') return;
  const table = document.getElementById(tableId);
  const wb = XLSX.utils.table_to_book(table, {sheet: "Table"});
  XLSX.writeFile(wb, "table.xlsx");
} 