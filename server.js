const express = require("express");
const app = express();
const server = app.listen(3008);
app.use(express.static("public"));
app.use(express.static("data"));
const book_list = [
    "RealBk1",
    "RealBk2",
    "RealBk3",
    "NewReal1",
    "NewReal2",
    "NewReal3",
    "Library",
    "TheBook",
    "JazzLTD",
    "JazzFake",
    "Colorado",
    "EvansBk"
];
const io = require("socket.io")(server);
const mysql = require("mysql");
const dbconfig = require("./dbconfig");
const conn = mysql.createConnection(dbconfig.dbconfig);

conn.connect();

io.on("connection", function(socket) {
    socket.on("search", function(searchPhrase, searchOptions) {
        searchPhrase = mysql.escape(searchPhrase);
        var sql =
            "SELECT * FROM master_index WHERE MATCH(song_name) AGAINST('" +
            searchPhrase +
            "') " +
            (searchPhrase.length < 1 ? "ORDER BY RAND()" : "") +
            " LIMIT 100;";
        if (searchPhrase.toLowerCase() == "random") {
            sql = "SELECT * FROM master_index ORDER BY RAND() LIMIT 50";
        }
        if (book_list.indexOf(searchPhrase) != -1) {
            sql =
                "SELECT * FROM master_index WHERE book_name='" +
                book_list[book_list.indexOf(searchPhrase)] +
                "' ORDER BY RAND() LIMIT 50";
        }
        conn.query(sql, function(err, result) {
            if (err) throw err;
            socket.emit("results", result);
        });
    });

    socket.on("getSongName", function(song_name, book_name, page_number) {
        var sql =
            "SELECT song_name FROM master_index WHERE book_name = " +
            mysql.escape(book_name) +
            " AND page_number = " +
            mysql.escape(page_number);
        conn.query(sql, function(err, result) {
            if (result.length > 0) {
                socket.emit(
                    "songName",
                    result[0].song_name,
                    book_name,
                    page_number
                );
            } else {
                socket.emit("songName", song_name, book_name, page_number);
            }
        });
    });
});
