/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Matheus Fernando Leitao Student ID: 148 300 171 Date: 03/08/2019
*
*  Online (Heroku) Link:  https://radiant-harbor-31780.herokuapp.com/
*
********************************************************************************/ 
const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const path = require("path");

const dataService = require("./data-service.js");
const multer = require("multer");
const exphbs = require("express-handlebars");
const fs = require("fs");
const bodyParser = require("body-parser");

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

app.engine(".hbs", exphbs({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue)
                return options.inverse(this);
            else
                return options.fn(this);
        }
    } 
}));

app.set("view engine", ".hbs");

app.use(function(request, response, next){
    let route = request.baseUrl + request.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get("/", (request, response) => {
    response.render("home");
});

app.get("/about", (request, response) => {
    response.render("about");
});

app.get("/employees/add", (request, response) => {
    response.render("addEmployee");
}); 

app.post("/employees/add", (request, response) => {
    dataService.addEmployee(request.body).then((data) => {
        response.redirect("/employees");
    });
});

app.post("/employee/update", (request, response) => {
    dataService.updateEmployee(request.body).then((data) => {
        response.redirect("/employees");
    });
});

app.get("/images/add", (request, response) => {
    response.render("addImage");
});

app.get("/employees/:id", (request, response) => {
    dataService.getEmployeeByID(request.params.id).then((data) => {
        response.render("employee", { employee: data });
    }).catch((reason) => {
        response.render({employee: "no results"});
    });
});

app.get("/employees", (request, response) => {
    if (request.query.status) {
        dataService.getEmployeesByStatus(request.query.status).then((data) => {
            response.render("employees", { employees: data });
        }).catch((reason) => {
            response.render({message: "no results"});
        });
    }
    else if (request.query.department) {
        dataService.getEmployeesByDepartment(request.query.department).then((data) => {
            response.render("employees", { employees: data });
        }).catch((reason) => {
            response.render({message: "no results"});
        });
    }
    else if (request.query.manager) {
        dataService.getEmployeesByManager(request.query.manager).then((data) => {
            response.render("employees", { employees: data });
        }).catch((reason) => {
            response.render({message: "no results"});
        });
    }
    else {
        dataService.getAllEmployees().then((data) => {
            response.render("employees", { employees: data });
        }).catch((reason) => {
            response.render({message: "no results"});
        });
    }
});

app.post("/images/add", upload.single("imageFile"), (request, response) => {
    response.redirect("/images");
});

app.get("/images", (request, response) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        response.render("images", { images: items });
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
        response.render("departments", { departments: data });
    }).catch((reason) => {
        response.render({message: "no results"});
    });
});

app.use((request, response) => {
    response.status(404).send("Page Not Found");
});

app.listen(HTTP_PORT, onHttpStart);