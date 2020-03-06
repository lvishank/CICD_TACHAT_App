require('custom-env').env();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {
  connectDatabase,
  sync: syncTables,
  loadModels
} = require("./utils/models");
const configureRoutes = require("./routes");
const handleSocketConnection = require("./socket");
const { connect: connectRedis, flush: flushRedis } = require("./utils/redis");

const port = process.env.PORT || 9001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  DB: database,
  DB_PORT: dbPort,
  DB_HOST: host,
  DB_USER: user,
  DB_PASSWORD: password
} = process.env;

connectDatabase({ database, dbPort, host, user, password})
  .then(_ => loadModels())
  .then(_ => syncTables())
  .then(_ => {
    app.use("/chat-demo", (req, res) => {
      res.sendFile(`${__dirname}/chat-demo.html`);
    });
  })
  .then(_ => configureRoutes(app))
  .then(_ => {
    return app.listen(port, () => {
      console.log(`Application running on port ${port}`);
    });
  })
  .then(server => {
    const io = require("socket.io")(server);
    return handleSocketConnection(io);
  })
  .then(_ => connectRedis())
  .then(_ => flushRedis())
  .catch(err => {
    console.log(err);
    console.log(
      "Failed connecting to database, please check if the credentials are correct"
    );
  });
