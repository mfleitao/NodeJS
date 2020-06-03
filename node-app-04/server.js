/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Matheus Fernando Leitao Student ID: 148 300 171 Date: 03/20/2019
*
*  Online (Heroku) Link:  https://lit-retreat-75095.herokuapp.com
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

// ------------------------------------------------------------------------------------------
//  EMPLOYEE
// ------------------------------------------------------------------------------------------

app.get("/employees/add", (request, response) => {
    dataService.getDepartments()
        .then((data) => {
            response.render("addEmployee", { departments: data });
        })
        .catch((err) => {
            response.render("addEmployee", { departments: [] });
    });
}); 

app.post("/employees/add", (request, response) => {
    dataService.addEmployee(request.body)
        .then((data) => {
            response.redirect("/employees");
        })
        .catch((err) => {
            response.status(500).send("Unable to Add Employee");
    });
});

app.post("/employee/update", (request, response) => {
    dataService.updateEmployee(request.body)
        .then((data) => {
            response.redirect("/employees");
        })
        .catch((err) => {
            response.status(500).send("Unable to Update Employee");
    });
});

app.get("/employees/:id", (request, response) => {
    var viewData = {};
    dataService.getEmployeeByID(request.params.id)
        .then((data) => {
            viewData.employee = (data) ? data : null;
        })
        .catch((reason) => {
            viewData.employee = null;
        })
        .then(dataService.getDepartments).then((data) => {
            viewData.departments = data;
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department)
                    viewData.departments[i].selected = true;
            }
        })
        .catch((err) => {
            viewData.departments = [];
        })
        .then(() => {
            if (viewData.employee == null)
                response.status(404).send("Employee Not Found");
            else
                response.render("employee", { viewData: viewData });
    });
});

app.get("/employees/delete/:id", (request, response) => {
    dataService.deleteEmployeeById(request.params.id)
        .then((data) => {
            response.redirect("/employees");
        })
        .catch((err) => {
        response.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/employees", (request, response) => {
    if (request.query.status) {
        dataService.getEmployeesByStatus(request.query.status)
            .then((data) => {
                if (data.length > 0)
                    response.render("employees", { employees: data });
                else 
                    response.render("employees", { message: "No Results" });
            })
            .catch((reason) => {
                response.status(500).send("No results found");
        });
    }
    else if (request.query.department) {
        dataService.getEmployeesByDepartment(request.query.department)
            .then((data) => {
                if (data.length > 0)
                    response.render("employees", { employees: data });
                else 
                    response.render("employees", { message: "No Results" });
            })
            .catch((reason) => {
                response.status(500).send("No results found");
        });
    }
    else if (request.query.manager) {
        dataService.getEmployeesByManager(request.query.manager)
            .then((data) => {
                if (data.length > 0)
                    response.render("employees", { employees: data });
                else 
                    response.render("employees", { message: "No Results" });
            })
            .catch((reason) => {
                response.status(500).send("No results found");
        });
    }
    else {
        dataService.getAllEmployees()
            .then((data) => {
                if (data.length > 0)
                    response.render("employees", { employees: data });
                else 
                    response.render("employees", { message: "No Results" });
            })
            .catch((reason) => {
                response.status(500).send("No results found");
        });
    }
});

// ------------------------------------------------------------------------------------------
//  IMAGES
// ------------------------------------------------------------------------------------------

app.get("/images/add", (request, response) => {
    response.render("addImage");
});

app.post("/images/add", upload.single("imageFile"), (request, response) => {
    response.redirect("/images");
});

app.get("/images", (request, response) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        response.render("images", { images: items });
    });
});

// ------------------------------------------------------------------------------------------
//  DEPARTMENT
// ------------------------------------------------------------------------------------------

app.get("/departments", (request, response) => {
    dataService.getDepartments()
        .then((data) => {
            if (data.length > 0)
                response.render("departments", { departments: data });
            else 
                response.render("departments", { message: "no results" });
        })
        .catch((reason) => {
            response.status(500).send("No results found");
    });
});

app.get("/departments/add", (request, response) => {
    response.render("addDepartment");
});

app.get("/department/:id", (request, response) => {
    dataService.getDepartmentById(request.params.id)
        .then((data) => {
            response.render("department", { department: data });
        })
        .catch((reason) => {
            response.status(404).send("Page Not Found");
    });
});

app.post("/departments/add", (request, response) => {
    dataService.addDepartment(request.body)
        .then((data) => {
            response.redirect("/departments");
        })
        .catch((err) => {
            response.status(500).send("Unable to Add Department");
    });
});

app.post("/department/update", (request, response) => {
    dataService.updateDepartment(request.body)
        .then((data) => {
            response.redirect("/departments");
        })
        .catch((err) => {
            response.status(500).send("Unable to Update Department");
    });
});


app.use((request, response) => {
    response.status(404).send("Page Not Found");
});

dataService.initialize()
    .then(function(data){
        console.log(data);
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch(function(reason){
        console.log(reason);
});
