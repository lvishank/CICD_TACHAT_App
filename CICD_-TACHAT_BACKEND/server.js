require("custom-env").env();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {
  connectDatabase,
  loadModels,
  sync: syncTables
} = require("./utils/models");
const { addMasterRecords } = require("./modules/Department/service");

const configureRoutes = require("./routes");

const port = process.env.PORT || 8001;

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
  .then(_ => addMasterRecords())
  .then(_ => configureRoutes(app))
  .then(_ => {
    return app.listen(port, () => {
      console.log(`Application running on port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
    console.log(
      "Failed connecting to database, please check if the credentials are correct"
    );
  });
