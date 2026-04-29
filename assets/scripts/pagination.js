function renderPaginatedList(type, items, page, loadFn, itemRenderer) {
  let html = `<ul class="${type}-list">`;
  items.forEach((item) => (html += itemRenderer(item)));
  html += "</ul>";

  html += `<div class="pagination">
        <button ${page <= 1 ? "disabled" : ""} onclick="${loadFn.name}(${page - 1})">Previous</button>
        <span>Page ${page}</span>
        <button onclick="${loadFn.name}(${page + 1})">Next</button>
    </div>`;
  tabContent.innerHTML = html;
}
