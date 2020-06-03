/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Matheus Fernando Leitao Student ID: 148 300 171 Date: 02/12/2019
*
*  Online (Heroku) Link: https://morning-caverns-64442.herokuapp.com/
*
********************************************************************************/ 

const dataService = require("./data-service.js");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const path = require("path");
const HTTP_PORT = process.env.HTTP_PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on "+ HTTP_PORT);
    dataService.initialize().then(function(data){
        console.log(data);
    }).catch(function(reason){
        console.log(reason);
    });
}

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (request, response) => {
    response.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees/add", (request, response) => {
    response.sendFile(path.join(__dirname, "/views/addEmployee.html"));
}); 

app.post("/employees/add", (request, response) => {
    dataService.addEmployee(request.body).then((data) => {
        response.redirect("/employees");
    });
});

app.get("/images/add", (request, response) => {
    response.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.get("/employees/:id", (request, response) => {
    dataService.getEmployeeByID(request.params.id).then((data) => {
        response.json(data);
    }).catch((reason) => {
        response.json({message: reason});
    });
});

app.get("/employees", (request, response) => {
    if (request.query.status) {
        dataService.getEmployeesByStatus(request.query.status).then((data) => {
            response.json(data);
        }).catch((reason) => {
            response.json({message: reason});
        });
    }
    else if (request.query.department) {
        dataService.getEmployeesByDepartment(request.query.department).then((data) => {
            response.json(data);
        }).catch((reason) => {
            response.json({message: reason});
        });
    }
    else if (request.query.manager) {
        dataService.getEmployeesByManager(request.query.manager).then((data) => {
            response.json(data);
        }).catch((reason) => {
            response.json({message: reason});
        });
    }
    else {
        dataService.getAllEmployees().then((data) => {
            response.json(data);
        }).catch((reason) => {
            response.json({message: reason});
        });
    }
});

app.post("/images/add", upload.single("imageFile"), (request, response) => {
    response.redirect("/images");
});

app.get("/images", (request, response) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        response.json({ images: items });
    });
});

app.get("/managers", (request, response) => {
    dataService.getManagers().then((data) => {
        response.json(data);
    }).catch((reason) => {
        response.json({message: reason});
    });
});

app.get("/departments", (request, response) => {
    dataService.getDepartments().then((data) => {
        response.json(data);
    }).catch((reason) => {
        response.json({message: reason});
    });
});

app.use((request, response) => {
    response.status(404).send("Page Not Found");
});

app.listen(HTTP_PORT, onHttpStart);