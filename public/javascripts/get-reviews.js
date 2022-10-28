function download_file(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([content], {
      type: mimeType
    }), fileName);
  } else if (URL && 'download' in a) { //html5 A[download]
    a.href = URL.createObjectURL(new Blob([content], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }
}

$("#get-review-form").submit(function (event) {
  const formData = new FormData(event.target);

  const btn = $("#getBtn");

  btn.attr("disabled", true);
  btn.text("Loading...");

  $.post(
    "/get-reviews",
    {
      asin: formData.get("asin"),
      pageCount: formData.get("pageCount"),
    },
    function (data) {
      const ws = XLSX.utils.json_to_sheet(data.reviews);

      const csv = XLSX.utils.sheet_to_csv(ws);

      download_file(csv, `${formData.get('asin')}.csv`, 'text/csv;encoding:utf-8');

      btn.attr("disabled", false);
      btn.text("Get Reviews");
    }
  );

  event.preventDefault();
});
