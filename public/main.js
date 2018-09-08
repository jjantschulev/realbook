var keyWords = ["random"]

var searchBox = document.getElementById('searchBox');
var searchButton = document.getElementById('searchButton');
var resultDiv = document.getElementById('results');
urlHttpLess = window.location.href.substring(window.location.href.indexOf('/') + 2, window.location.href.length);
var socketURL = urlHttpLess.substring(0, urlHttpLess.indexOf('/') == -1 ? urlHttpLess.length : urlHttpLess.indexOf('/'));
var socket = io(socketURL);
console.log("Socket connecting to: " + socketURL);
searchButton.addEventListener("click", search)
searchBox.addEventListener('keyup', function (e) {
  search();
});
search();

if (window.location.href.indexOf("#") != -1) {
  var url = window.location.href;
  var indexes = [];
  for (var i = 0; i < url.length; i++) {
    if (url.charAt(i) == "?") {
      indexes.push(i);
    }
  }
  if (indexes.length == 3) {
    var song_name = url.slice(indexes[0] + 1, indexes[1]);
    var book_name = url.slice(indexes[1] + 1, indexes[2]);
    var page_number = parseInt(url.slice(indexes[2] + 1, url.length));
    loadSong(song_name, book_name, page_number);
  }
}


function search() {
  if (keyWords.indexOf(searchBox.value.toLowerCase()) != -1) {
    searchBox.classList.add("special-search-text");
  } else {
    searchBox.classList.remove("special-search-text");
  }
  socket.emit("search", searchBox.value, {});
}
socket.on("results", function (results) {
  clearResults();
  for (var result of results) {
    createResult(result.song_name, result.book_name, result.page_number);
  }
});

function createResult(song_name, book_name, page_number) {
  var infoText = book_name + ", Page " + page_number;

  var link = document.createElement('a');
  link.className = "no-text-decoration";
  link.href = "#?" + song_name + "?" + book_name + "?" + page_number;
  link.onclick = function () {
    loadSong(song_name, book_name, page_number);
  }
  var card = document.createElement('div');
  card.className = "card card-link no-text-decoration";
  var cardBody = document.createElement('div');
  cardBody.className = "card-body";
  var heading = document.createElement("h5");
  heading.className = "card-title blue";
  var info = document.createElement("p");
  info.className = "card-subtitle text-muted grey";
  var headingText = document.createTextNode(song_name);
  var infoText = document.createTextNode(infoText);

  info.appendChild(infoText);
  heading.appendChild(headingText);
  cardBody.appendChild(heading);
  cardBody.appendChild(info);
  card.appendChild(cardBody);
  link.appendChild(card);
  resultDiv.appendChild(link);
}

function clearResults() {
  resultDiv.innerHTML = "";
}


function loadSong(song_name, book_name, page_number) {
  socket.emit("getSongName", song_name, book_name, page_number);
}

socket.on("songName", function (song_name, book_name, page_number) {
  openViewer(song_name, book_name, page_number);
})

function openViewer(song_name, book_name, page_number) {
  document.getElementById('song-display').style.display = "block";
  document.getElementById('song-search').style.display = "none";
  document.getElementById('song_name').innerHTML = song_name;
  document.getElementById('song_info').innerHTML = book_name + ", Page " + page_number;
  var img = document.getElementById('image');
  var pageAdr = "/" + book_name + "/" + book_name + "-" + page_number + ".jpeg";
  img.src = pageAdr;
  document.getElementById('download_page').href = pageAdr;
  var padding = 110;
  var ratio = img.naturalWidth / img.naturalHeight;
  if (window.innerWidth / window.innerHeight < ratio) {
    //Phone or Tablet
    // alert("Phone detected")
    img.style.width = "calc(100% - 20px)";
    img.style.height = "calc(calc(100vw - 20px) / " + ratio + ")";
  } else {
    // Most likely a computer
    img.style.width = "calc(calc(100vh - 80px) * " + ratio + ")";
    img.style.height = "calc(100% - 20px)";
  }
  var link = document.getElementById('btn-next-page');
  link.href = "#?" + song_name + "?" + book_name + "?" + page_number;
  link.onclick = function () {
    loadSong(song_name, book_name, page_number + 1);
  }
  link = document.getElementById('btn-prev-page');
  link.href = "#?" + song_name + "?" + book_name + "?" + page_number;
  link.onclick = function () {
    if (page_number > 1) {
      loadSong(song_name, book_name, page_number - 1);
    }
  }
}


function exitViewer() {
  document.getElementById('song-display').style.display = "none";
  document.getElementById('song-search').style.display = "block";
}
