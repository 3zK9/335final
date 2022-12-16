const http = require("http");
const path = require("path");
const express = require("express");
const bodyparser = require("body-parser");
require('dotenv').config()


const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

const databaseAndCollection = {db: "final335", collection: "final335"};

const { MongoClient, ServerApiVersion } = require('mongodb');
const { response, text } = require("express");
const uri = `mongodb+srv://${userName}:${password}@cluster0.lw1rpii.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect().then(
    res => app.listen(portNumber),    
    err => console.error("ERROR Connecting"),
);

const app = express();

process.stdin.setEncoding("utf8");

//if (process.argv.length != 3) {
//    process.stdout.write(`Usage Example: metrics.js portNumber\n`);
//    process.exit(1);
//}

app.use(bodyparser.urlencoded({extended:false}));

const portNumber = process.argv[2];

app.set("views", path.resolve(__dirname, "pages"));

app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.render("index");
});

app.post("/", async (request, response) => {
    let {email, password} = request.body;
    let filter = {email: email, password: password};
    const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find(filter);
    const result = await cursor.toArray();

    if(result.length === 0) {
        console.log("Error No Email/Password Combo Found Found Try Again");
        response.render("index");
    }
    //api
    const unirest = require("unirest");

    const req = unirest("GET", "https://community-hacker-news-v1.p.rapidapi.com/updates.json");


    req.query({
        "print": "pretty"
    });
    
    req.headers({
        "X-RapidAPI-Key": "f8fd9ed8f7msh1da1df76852a7d0p1bf96bjsn1a9939ecc7bb",
        "X-RapidAPI-Host": "community-hacker-news-v1.p.rapidapi.com",
        "useQueryString": true
    });
    
    let test;

    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        test = res.body;
        console.log(test);
        let text;
        for (i in res.body.items) {
            text += res.body.items[i];
            text += "<br>";
        }
        response.render("app", {test:text});
    });
});

app.get("/newuser", (request, response) => {
    response.render("newuser");
});

app.post("/newuser", async (request, response) => {
    let {email, password} = request.body;
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne({email: email, password: password});
    response.render("index");
});


const prompt = "Type this command to shutdown the server: STOP:\t";
process.stdout.write(prompt);

process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
        let command = dataInput.trim();
        if (command == "STOP") {
            process.stdout.write("Shutting down the server >:(");
            process.exit(0);
        }
        else {
            process.stdout.write("Invalid command: " + command + "\n");
        }
    }
    process.stdout.write(prompt);
    process.stdin.resume();
});