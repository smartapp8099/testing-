const express = require("express");
const constants = require('./app/config');
const MongoClient = require('mongodb').MongoClient;
  const cors = require('cors');

var http = require("http");
bp = require("body-parser");
router = express.Router();
const app = express();
const routes = require('./app/routes');
app.use(bp.json());
app.use(express.json());
const DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const DB_URL = 'mongodb://localhost:27017/admin';

app.use((req, res, next)=>{  
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");  

  // Request headers you wish to allow
  res.setHeader(  
    "Access-Control-Allow-Headers",  
    "Origin, X-Requested-With, Content-Type, Accept");  
  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods",  
  "GET, POST, PATCH, DELETE, OPTIONS");  
  
  next();
});
app.use(cors());

app.get('/', (req, res) => {
  res.send("Mock Service is running...");
});

app.use(constants.PROGRAM_ENDPOINT, routes.program);
app.use(constants.ORGANIZATION_ENDPOINT,routes.organization);
app.use(constants.USERS_ENDPOINT,routes.users);
app.use(constants.FORMS_ENDPOINT,routes.formsHandler);
app.use(constants.CONTROL_ENDPOINT,routes.controlHandler);

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
//app.listen(port, () => console.log(`Listening on port ${port}..`));

// mongoose.connect(DB_URL, DB_OPTIONS, err => {
// 	if(err) {
// 		console.error('Failed to connect to Database', err);
// 	} else {
// 		console.log('Connected to Database');
// 		app.listen(port, () => {
// 			console.log(`Server started on PORT: ${port}`);
// 		});
// 	}
// });

MongoClient.connect(DB_URL, function(err, db) {
  if (err) throw err;
  console.clear();
  console.log("Database created!");
  app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
  });
  db.close();
});