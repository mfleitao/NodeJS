
var employees = [];
var departments = [];

module.exports.initialize = function() {
    var fs = require("fs");

    return new Promise((resolve, reject) => {
        fs.readFile("./data/departments.json", (err, data) => {
            if (err) reject("*** departments.json file could not be read ***");
            departments = JSON.parse(data);
        });
        fs.readFile("./data/employees.json", (err, data) => {
            if (err) reject("*** employees.json file could not be read ***");
            employees = JSON.parse(data);
        });
        resolve("JSON Files has been read");
    });
}

function a(a, b) {
    return new Promise((resolve, reject) => {
        if (a < b)
            reject("Error");
        else 
            resolve(a * b);
    });
}

module.exports.getAllEmployees = function() {
    return new Promise((resolve, reject) => {
        if (employees.length > 0)
            resolve(employees);
        else 
            reject("No Results Returned!");
    });
};

module.exports.getManagers = function() {
    var managers = [];
    return new Promise((resolve, rejects) => {
        employees.forEach(emp => {
            if (emp.isManager)
                managers.push(emp);
            if (managers.length > 0)
                resolve(managers);
            else 
                reject("No Results Returned!");
        });
    });
};

module.exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        if (departments.length > 0)
            resolve(departments);
        else 
            reject("No Results Returned!");
    });
};

function divide(a, b) {
    if (a < b)
        throw new Error("First parameter can not be less than Second one");
    return a / b;
}

function treat() {
    try {
        divide(3, 6);
    } catch (ex) {
        console.log("Error "+ ex.message);
    }
}

