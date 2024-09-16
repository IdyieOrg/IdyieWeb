import "vendor/dataTables"

function initDataTable(id) {
  let table;
  if (typeof table !== 'undefined') {
    table.destroy();
  }
  table = new DataTable('#' + id, {
    responsive: true,
    paging: false,
    info: false,
    searching: false,
    layout: {
      bottomEnd: {
        buttons: [
          {
            extend: 'csv',
            text: '<i class="fa fa-file-csv"></i> Exporter en CSV',
            className: 'btn btn-dark'
          },
          {
            extend: 'excel',
            text: '<i class="fa fa-file-excel"></i> Exporter en Excel',
            className: 'btn btn-dark'
          },
          {
            extend: 'pdf',
            text: '<i class="fa fa-file-pdf"></i> Exporter en PDF',
            className: 'btn btn-dark'
          },
          {
            extend: 'print',
            text: '<i class="fa fa-print"></i> Imprimer',
            className: 'btn btn-dark'
          }
        ]
      }
    },
  });

  let buttons = table.buttons();
  console.log(buttons);
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].node.classList.remove('dt-button');
    buttons[i].node.style.marginRight = '5px';
    buttons[i].node.style.color = '#00bf63';
  };
}

export { initDataTable };
