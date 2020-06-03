
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
        });
        if (managers.length > 0)
            resolve(managers);
        else 
            reject("No Results Returned!");
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

module.exports.addEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager == undefined) ? false : true;
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        resolve(employees);
    });
}

module.exports.getEmployeesByStatus = function(status) {
    var employeesByStatus = [];
    return new Promise((resolve, reject) => {
        employees.forEach(emp => {
            if (emp.status == status)
                employeesByStatus.push(emp);
        });
        if (employeesByStatus.length > 0)
            resolve(employeesByStatus);
        else
            reject("No Results Returned!");
    });
}

module.exports.getEmployeesByDepartment = function(department) {
    var employeesByDepartment = [];
    return new Promise((resolve, reject) => {
        employees.forEach(emp => {
            if (emp.department == department)
                employeesByDepartment.push(emp);
        });
        if (employeesByDepartment.length > 0)
            resolve(employeesByDepartment);
        else
            reject("No Results Returned!");
    });
}

module.exports.getEmployeesByManager = function(manager) {
    var employeesByManager = [];
    return new Promise((resolve, reject) => {
        employees.forEach(emp => {
            if (emp.isManager == manager)
                employeesByManager.push(emp);
        });
        if (employeesByManager.length > 0)
            resolve(employeesByManager);
        else
            reject("No Results Returned!");
    });
}

module.exports.getEmployeeByID = function(id) {
    var employeeByID;
    return new Promise((resolve, reject) => {
        employees.forEach(emp => {
            if (emp.employeeNum == id)
                employeeByID = emp;   
        });
        if (employeeByID != undefined)
            resolve(employeeByID);
        else
            reject("No Results Returned!");
    });
}