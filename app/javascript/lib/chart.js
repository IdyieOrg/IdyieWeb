import "vendor/chart"

function chartInitializer(type, id, title, labels, data, borderColor, backgroundColor = '#155b91') {
  let ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

function lineChartInitializer(id, title, labels, data, color) {
  chartInitializer('line', id, title, labels, data, color);
}

function barChartInitializer(id, title, labels, data, color) {
  chartInitializer('bar', id, title, labels, data, color);
}

export { lineChartInitializer, barChartInitializer }
