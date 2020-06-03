
/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Matheus Fernando Leitao Student ID: 148 300 171 Date: 02/01/2019
*
*  Online (Heroku) Link: https://agile-sands-83212.herokuapp.com/
*
********************************************************************************/ 

const dataService = require("./data-service.js");

const express = require("express");
const app = express();
var path = require("path");

const HTTP_PORT = process.env.HTTP_PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on "+ HTTP_PORT);
    dataService.initialize().then(function(data){
        console.log(data);
    }).catch(function(reason){
        console.log(reason);
    });
}

app.use(express.static("public"));

app.get("/route", (req, res) => {
    res.send("E ai mano, firmeza");
});

app.get("/vaila", (req, res) => {
    res.sendFile(path.join(__dirname, "/path/views/fileName.html"));
});

app.get("/student:id", (req, res) => {
    if (req.query.role) {
        send.json({message: "Error"})
    }
    else {
        send.json({message: "Student id: "+ req.query.role});
    }
});

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (request, response) => {
    response.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees", (request, response) => { 
    dataService.getAllEmployees().then(function(data){
        response.json(data);
    }).catch(function(reason){
        response.json({message: reason});
    });
});

app.get("/managers", (request, response) => {
    dataService.getManagers().then(function(data){
        response.json(data);
    }).catch(function(reason){
        response.json({message: reason});
    });
});

app.get("/departments", (request, response) => {
    dataService.getDepartments().then(function(data){
        response.json(data);
    }).catch(function(reason){
        response.json({message: reason});
    });
});

app.use((request, response) => {
    response.status(404).send("Page Not Found");
});

app.listen(HTTP_PORT, onHttpStart);