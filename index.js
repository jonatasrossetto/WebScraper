let btnSearch = document.getElementById('btn-search');
let inputSearch = document.getElementById('input-search');

btnSearch.addEventListener('click', function (e) {
  e.preventDefault();
  let search = inputSearch.value;
  console.log('search input: ' + search);
  if (search == '') {
    alert('Please enter a search term');
    return;
  }
  search = search.replace(' ', '+');
  fetch('http://localhost:3000/api/scrape/?keyword=' + search)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let html = '';
      data.forEach((element) => {
        html += `<tr><td class="col-2"> <img src="${element.imageUrl}" class="img-thumbnail" style="width:5rem ;">'</td>'`;
        html += '<td class="col-6">' + element.name + '</td>';
        html += '<td class="col-2">' + element.stars + '</td>';
        html += '<td class="col-2">' + element.reviews + '</td></tr>';
      });
      document.getElementById('results').innerHTML = html;
    });
});
