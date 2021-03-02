const Websocket = require("ws");
const http = require("http");

const wss = new Websocket.Server({ port: 8080 });

const parse = (data) => JSON.parse(data);
const stringify = (data) => JSON.stringify(data);

const LOGIN_TYPE = "LOGIN";
const MESSAGE_TYPE = "MESSAGE";
const GENERAL_TYPE = "GENERAL";

const DB = [];

const handleRequest = (data, ws) => {
  if (data.type === LOGIN_TYPE) {
    if (data.name) {
      const message = `${data.name} connected to chat`;

      DB.push({ ...data, message });
      wss.clients.forEach(function each(client) {
        // typeof client === 'object'
        if (client === ws) {
          return;
        }

        client.send(
          stringify({
            type: GENERAL_TYPE,
            message: `${data.name} connected to chat`,
          })
        );
      });

      return;
    }

    ws.close();
  } else if (data.type === MESSAGE_TYPE) {
    const message = `${data.name}: ${data.message}`

    DB.push({...data, message});
    wss.clients.forEach(function each(client) {
      client.send(
        stringify({
          type: MESSAGE_TYPE,
          message: message
        })
      );
    });
  }
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    const parsed = parse(data);
    handleRequest(parsed, ws);
  });
});

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept");

  if (req.method === "GET" && req.url === "/messages") {
    res.setHeader("Content-Type", "application/json");
    res.end(stringify({ messages: stringify(DB) }));
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.end(stringify({ error: "Page not found" }));
});

server.listen(8081);
