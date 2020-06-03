const Sequelize = require("sequelize");

const DATABASE = "d46jq2hcg4sot0";
const USER = "pdwvyjuloniybf";
const PASSWORD = "9ea0b8f4de381915c7d673c18095d062f607c8baa198bcc674f3ebcc3f58bd78";

var sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
    host: "ec2-54-221-201-212.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

sequelize.authenticate()
    .then(() => {
        console.log("*** Connection has been established successfully");
    })
    .catch((err) => {
        console.log("*** Unable to connect to the Database");
});

var Employee = sequelize.define("Employee", {
    employeeNum: {
        type: 			Sequelize.INTEGER,
        primaryKey: 	true,
        autoIncrement: 	true
    },
    firstName: 				Sequelize.STRING,
    lastName: 				Sequelize.STRING,
    email: 					Sequelize.STRING,
    SSN: 					Sequelize.STRING,
    addressStreet: 			Sequelize.STRING,
    addressCity: 			Sequelize.STRING,
    addressState: 			Sequelize.STRING,
    addressPostal: 			Sequelize.STRING,
    maritalStatus: 			Sequelize.STRING,
    isManager: 				Sequelize.BOOLEAN,
    employeeManagerNum: 	Sequelize.INTEGER,
    status: 				Sequelize.STRING, 
    department: 			Sequelize.INTEGER,
    hireDate: 				Sequelize.STRING
});

var Department = sequelize.define("Department", {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve("*** Sync Successfully");
            })
            .catch((err) => {
                reject("*** Error: Unable to Sync to Database");
        });
    });
}

// ------------------------------------------------------------------------------------------
//  DEPARTMENT
// ------------------------------------------------------------------------------------------

module.exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        Department.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("No results returned");
        });
    }); 
};

module.exports.addDepartment = function(departmentData) {
    return new Promise((resolve, reject) => {
        if (departmentData.departmentName == "") 
            departmentData.departmentName = null;
            
        Department.create({
                departmentName: departmentData.departmentName
            })
            .then(() => {
                resolve("A new Department has been added successfully");
            })
            .catch((err) => {
                reject("Unable to add an department");
        });
    });
}

module.exports.updateDepartment = function(departmentData) {
    return new Promise((resolve, reject) => {
        if (departmentData.departmentName == "") 
            departmentData.departmentName = null;

        Department.update({
                departmentName: departmentData.departmentName
            }, {
                where: { departmentId: departmentData.departmentId }
            })
            .then(() => {
                resolve("The Department has been updated successfully");
            })
            .catch((err) => {
                reject("Unable to updated the department");
        });
    });
}

module.exports.getDepartmentById = function(id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
                where: { departmentId: id }
            })
            .then(function(data) {
                resolve(data[0]);
            })
            .catch((err) => {
                reject("No results returned");
        });
    });
}


// ------------------------------------------------------------------------------------------
//  EMPLOYEE
// ------------------------------------------------------------------------------------------

module.exports.getAllEmployees = function() {
    return new Promise((resolve, reject) => {
        Employee.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("No results returned");
        });
    }); 
};

module.exports.getEmployeesByStatus = function(employeeStatus) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
                where: { status: employeeStatus }
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("No results returned");
        });
    });
};

module.exports.getEmployeesByDepartment = function(employeeDepto) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
                where: { department : employeeDepto }
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("No results returned");
        });
    });
}

module.exports.getEmployeesByManager = function(manager) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
                where: { employeeManagerNum : manager }
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("No results returned");
            });
    });
}

module.exports.getEmployeeByID = function(id) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
                where: { employeeNum : id }
            })
            .then((data) => {
                resolve(data[0]);
            })
            .catch((err) => {
                reject("No results returned");
        });
    });
}

module.exports.addEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager == undefined) ? false : true;
        for (const attr in employeeData)
            if (employeeData[attr] == "") employeeData[attr] = null;
        
        Employee.create({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            })
            .then(() => {
                resolve("A new Employee has been added successfully");
            })
            .catch((err) => {
                reject("Unable to add an employee");
        });
    });
}

module.exports.updateEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager == undefined) ? false : true;
        for (const attr in employeeData)
            if (employeeData[attr] == "") employeeData[attr] = null;

        Employee.update({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            }, {
                where: { employeeNum: employeeData.employeeNum }
            })
            .then(() => {
                resolve("The Employee has been updated successfully");
            })
            .catch((err) => {
                reject("Unable to update the employee");
        });
    });
}

module.exports.deleteEmployeeById = function(id) { 
    return new Promise((resolve, reject) => {
        Employee.destroy({
                where: { employeeNum: id }
            })
            .then(() => {
                resolve("Employee deleted successfully");
            })
            .catch((err) => {
                reject("Unable to delete Employee");
        });
    });
}





