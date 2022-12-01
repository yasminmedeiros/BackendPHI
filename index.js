const express = require("express");
const app = express();
// const CSVToJSON = require("csvtojson");
//const dadoscsv = require("./dados");
const routes =  require('./src/routes');
const cors = require("cors");

require('./src/database/models/initConnection');

app.use(cors());
app.use(express.json());
app.use(routes);



app.listen(process.env.PORT || 3001, () => console.log("Servidor rodando"));
