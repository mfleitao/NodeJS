/*********************************************************************************
*  WEB322 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Matheus Fernando Leitao Student ID: 148 300 171 Date: 01/14/2019
*
*  Online (Heroku) URL: https://shielded-cove-24754.herokuapp.com/
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.send("Matheus Fernando Leitao - 148300171");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);