const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();

const myLimit =
  typeof process.argv[2] !== "undefined" ? process.argv[2] : "100kb";
console.log("Using limit: ", myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.use(function (request, response, next) {
  /**
   *  Set CORS headers: allow all origins, methods, and headers:
   *  you may want to lock this down in a production environment
   */
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  );

  // Proceed
  next();
});

app.all("*", (req, res) => {
  if (req.method === "OPTIONS") {
    // CORS Preflight
    res.send();
  } else {
    const targetURL = req.header("Target-URL"); // Target-URL ie. https://example.com or http://example.com
    if (!targetURL) {
      res
        .status(500)
        .send({ error: "There is no Target-Endpoint header in the request" });
      return;
    }
    request({ url: targetURL, method: req.method }, (error, response) => {
      if (error) {
        console.error(`error: ${response.statusCode}`);
      }
      //                console.log(body);
    }).pipe(res);
  }
});

app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
  console.log(`Proxy server listening on port ${app.get("port")}`);
});
