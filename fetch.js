let http = require("http");
let fs = require("fs");
let path = require("path");

let getBooks = () => {
  let data = fs.readFileSync(path.join(__dirname, "./books.json")); //__dirname is an environment variable that tells you the absolute path of the directory containing the currently executing file.
  return JSON.parse(data);
};

let saveBooks = (books) => {
  fs.writeFileSync(
    path.join(__dirname, "./books.json"), //joins the specified paths to one 
    JSON.stringify(books)
  );
};
// The http module provides you with http.createServer() function which helps you create a server. This function accepts a callback function with 2 parameters – req (which stores the incoming request object) and res which stands for the response to be sent by the server. This callback function gets executed every time someone hits the server.
let server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/books") {
    // !GET
    let books = getBooks(); //200-ok
    res.writeHead(200, { "Content-Type": "application/json" }); //This method is used to send the response headers to the client. The status code and headers like content-type can be set using this method.
    res.end(JSON.stringify(books)); //This method is used to end the response process.
  } else if (req.method === "POST" && req.url === "/books") {
    // !POST
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let { Title, Author, Pages, Ratings } = JSON.parse(body);
      if (!Title || !Author || !Pages || !Ratings) {
        res.writeHead(400, { "Content-Type": "application/json" }); //bad request
        res.end(
          JSON.stringify({
            error: "Title, Author, Pages and Ratings are required",
          })
        );
        return;
      }
      let books = getBooks();
      let newBook = { id: Date.now(), Title, Author, Pages, Ratings }; //Date.now() returns the number of milliseconds since January 1, 1970.
      books.push(newBook);
      saveBooks(books);
      res.writeHead(201, { "Content-Type": "application/json" }); //created
      res.end(JSON.stringify(newBook));
    });
  }
  // !PUT
  else if (req.method === "PUT" && req.url.startsWith("/books/")) {
    let id = parseInt(req.url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let { Title, Author, Pages, Ratings } = JSON.parse(body);
      if (!Title || !Author || !Pages || !Ratings) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Title, Author, Pages and Ratings are required",
          })
        );
        return;
      }
      let books = getBooks();
      let bookIndex = books.findIndex((b) => b.id === id);
      if (bookIndex === -1) {
        res.writeHead(404, { "Content-Type": "application/json" }); //not found
        res.end(JSON.stringify({ error: "Book not found" }));
        return;
      }
      books[bookIndex] = { id, Title, Author, Pages, Ratings };
      saveBooks(books);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(books[bookIndex]));
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/books/")) {
    // ! DELETE
    let id = parseInt(req.url.split("/")[2]);
    let books = getBooks();
    let newBooks = books.filter((b) => b.id !== id);
    if (books.length === newBooks.length) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Book not found" }));
      return;
    }
    saveBooks(newBooks);
    res.writeHead(204); //successful request
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});
// The listen() function in Node.js http module is used to start a server that listens for incoming requests. It takes a port number as an argument and binds the server to that port number so that it can receive incoming requests on that port.
server.listen(5000, () => {
  console.log("Server is listening on port: http://localhost:5000");
});

