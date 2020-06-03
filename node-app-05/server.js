/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Matheus Fernando Leitao Student ID: 148 300 171 Date: 04/02/2019
*
*  Online (Heroku) Link:  https://boiling-garden-30696.herokuapp.com/
*
********************************************************************************/ 
const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const path = require("path");

const dataService = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const multer = require("multer");
const exphbs = require("express-handlebars");
const fs = require("fs");
const bodyParser = require("body-parser");
const clientSessions = require("client-sessions");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session",
    secret:"web322_week8",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

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

function onHttpStart() {
    console.log("Express http server listening on "+ HTTP_PORT);
}

function ensureLogin(request, response, next) {
    if (!(request.session.user)) 
        response.redirect("/login");
    else
        next();
}

app.get("/", (request, response) => {
    response.render("home");
});

app.get("/about", (request, response) => {
    response.render("about");
});

// ------------------------------------------------------------------------------------------
//  LOGIN
// ------------------------------------------------------------------------------------------

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", (request, response) => {
    request.body.userAgent = request.get('User-Agent');
    dataServiceAuth.checkUser(request.body)
    .then((get_user) => {
        request.session.user = {
            userName: get_user.userName,
            email: get_user.email,
            loginHistory: get_user.loginHistory
        };
        response.redirect('/employees');       
    })
    .catch((err) => {
        response.render("login",{ errorMessage: err, userName: request.body.userName });
    });
});

app.get("/register", (request, response) => {
    response.render("register");
});

app.post("/register", (request, response) => {
    dataServiceAuth.registerUser(request.body)
    .then(() => {
        response.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
        response.render("register", { errorMessage: err, userName: JSON.stringify(request.body.userName) });
    })
});

app.get("/logout", (request, response) => {
    request.session.reset();
    response.redirect("/");
});

app.get("/userHistory", ensureLogin, (request, response) => {
    response.render("userHistory", { user: request.session.user });
});

// ------------------------------------------------------------------------------------------
//  EMPLOYEE
// ------------------------------------------------------------------------------------------

app.get("/employees/add", ensureLogin, (request, response) => {
    dataService.getDepartments()
        .then((data) => {
            response.render("addEmployee", { departments: data });
        })
        .catch((err) => {
            response.render("addEmployee", { departments: [] });
    });
}); 

app.post("/employees/add", ensureLogin, (request, response) => {
    dataService.addEmployee(request.body)
        .then((data) => {
            response.redirect("/employees");
        })
        .catch((err) => {
            response.status(500).send("Unable to Add Employee");
    });
});

app.post("/employee/update", ensureLogin, (request, response) => {
    dataService.updateEmployee(request.body)
        .then((data) => {
            response.redirect("/employees");
        })
        .catch((err) => {
            response.status(500).send("Unable to Update Employee");
    });
});

app.get("/employees/:id", ensureLogin, (request, response) => {
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

app.get("/employees/delete/:id", ensureLogin, (request, response) => {
    dataService.deleteEmployeeById(request.params.id)
        .then((data) => {
            response.redirect("/employees");
        })
        .catch((err) => {
        response.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/employees", ensureLogin, (request, response) => {
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

app.get("/images/add", ensureLogin, (request, response) => {
    response.render("addImage");
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (request, response) => {
    response.redirect("/images");
});

app.get("/images", ensureLogin, (request, response) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        response.render("images", { images: items });
    });
});

// ------------------------------------------------------------------------------------------
//  DEPARTMENT
// ------------------------------------------------------------------------------------------

app.get("/departments", ensureLogin, (request, response) => {
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

app.get("/departments/add", ensureLogin, (request, response) => {
    response.render("addDepartment");
});

app.get("/department/:id", ensureLogin, (request, response) => {
    dataService.getDepartmentById(request.params.id)
        .then((data) => {
            response.render("department", { department: data });
        })
        .catch((reason) => {
            response.status(404).send("Page Not Found");
    });
});

app.post("/departments/add", ensureLogin, (request, response) => {
    dataService.addDepartment(request.body)
        .then((data) => {
            response.redirect("/departments");
        })
        .catch((err) => {
            response.status(500).send("Unable to Add Department");
    });
});

app.post("/department/update", ensureLogin, (request, response) => {
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
    .then(dataServiceAuth.initialize)
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch((err) => {
        console.log(err);
});
