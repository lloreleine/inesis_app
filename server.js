const PG = require("pg");
const fetch = require("node-fetch");

const express = require("express");
const nunjucks = require("nunjucks");
const app = express();

const port = process.env["PORT"] || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

const client = new PG.Client();
client.connect();

nunjucks.configure("views", {
  autoescape:true,
  express:app
});

app.use(express.static('./'));
app.use(require("body-parser").urlencoded({ extended: true }));

app.set("views", __dirname + "/views");
app.set("view engine", "njk");

app.get("/", function(request, result) {
  result.render("home");
});

app.get("/form", function(request, result) {
  result.render("form");
});

app.post("/index", function(request, result) {
  result.render("index", {
    id:request.body.user_id
  });
});

app.get("/index", function(request, result) {
  result.render("index", {
    id:request.body.user_id
  });
});

app.get("/idea", function(request, result) {
  result.render("idea");
});

app.get("/faq", function(request, result) {
  result.render("faq");
});

app.get("/test", function(request, result) {
  result.render("test");
});

app.get("/feedback", function(request, result) {
  result.render("feedback");
});

app.get("/index/:city", function(request, result) {
  return fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${request.params.city}&units=metric&APPID=${API_KEY}`,
      {method: "GET"}
    )
    .then((response) => response.json())
    .then((resultProd) => {
      console.log(resultProd);
      result.render("index", {
        weather:resultProd,
        city:request.params.city
      });
    });
});

function fillDataBase(object, age){
  console.log(object);
  console.log(age);
  client.query(
    "INSERT INTO users_data VALUES ($1::serial, $2::varchar(250), $3::varchar(250), $4::varchar(10), $5::date, $6::integer, $7::varchar(100), $8::varchar(20), $9::varchar(10), $10::float4, $11::text)",
    ['', object.user_name, object.user_firstname, object.user_gender, object.user_birthdate, age, object.user_email, object.user_password, object.user_level, object.user_index, object.weather],
    function(error, result){
      if(error){
        console.warn(error);
      } else {
        console.log(object);
      }
      // client.end();
    }
  );
}

app.post("/data", function(request, result) {
    const td=new Date();// Le date d'ouverture de la page (aujourd'hui)
    const dtn=request.body.user_birthdate; // on lit la date de naissance
    let an=dtn.substr(0,4); // l'année (les quatre premiers caractères de la chaîne à partir de zéro)
    let age=td.getFullYear()-an; // l'âge du joueur
    // (newDate().getFullYear())-(request.body.user_birthdate.substr(0,4)
  // fillDataBase(request.body);
  // console.log(request.body);
  fillDataBase(request.body, age);
  result.render("data", {
    data:request.body,
    age:age
  });
});




app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
