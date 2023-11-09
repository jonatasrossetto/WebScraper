//Frontend JS for the index page

// Monitor the DOM for the submit event of the search form
let btnSearch = document.getElementById('btn-search');
let inputSearch = document.getElementById('input-search');

// Add an event listener to the search button
btnSearch.addEventListener('click', function (e) {
  e.preventDefault();
  // Get the search term from the input field
  let searchText = inputSearch.value;
  //   console.log('search input: ' + search);
  // Check if the search term is empty
  if (searchText == '') {
    alert('Please enter a search term');
    return;
  }
  // Replace the spaces with + signs
  searchText = searchText.replace(' ', '+');

  // Fetch the search data from the backend
  fetch('http://localhost:3000/api/scrape/?keyword=' + searchText)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      //   console.log(data);
      // Check if the backend returned any results
      if (data.length == 0) {
        alert('No results found');
        return;
      }

      let html = '';
      // Loop through the results and create the HTML code for the table
      data.forEach((element) => {
        html += `<tr><td class="col-2"> <img src="${element.imageUrl}" class="img-thumbnail" style="width:5rem ;">'</td>'`;
        html += '<td class="col-6">' + element.name + '</td>';
        html += '<td class="col-2">' + element.stars + '</td>';
        html += '<td class="col-2">' + element.reviews + '</td></tr>';
      });
      // Insert the HTML code into the table body
      document.getElementById('results').innerHTML = html;
    });
});
