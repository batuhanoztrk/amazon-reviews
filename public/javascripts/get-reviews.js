function s2ab(s) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
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

      const blob = new Blob([s2ab(csv)], { type: "text/plain;charset=utf-8" });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${formData.get("asin")}.csv`;
      link.click();

      btn.attr("disabled", false);
      btn.text("Get Reviews");
    }
  );

  event.preventDefault();
});
