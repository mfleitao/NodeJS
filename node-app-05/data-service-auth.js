const mongoose = require("mongoose");
const Schema  = mongoose.Schema;
const bcrypt = require('bcryptjs');
const STR_CONNECTION = "mongodb+srv://web322SenecaDB:mfl155853@senecaweb-33cdc.mongodb.net/web322_week8?retryWrites=true";
let User;

var userSchema = new Schema({
    "userName":{
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date,
        "userAgent": String
    }]
});

module.exports.initialize = function() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(STR_CONNECTION);
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
           User = db.model("Users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {        
            var newUser = new User(userData);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password");
                    }
                    else {
                        newUser.password = hash;
                        newUser.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code == 11000)
                                reject("User Name already taken");                 
                            else
                                reject("There was an error creating the user: "+ err);
                        }); 
                    }
                });
            });
        }
    });
}

module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec()
        .then((finded_user) => { 
            bcrypt.compare(userData.password, finded_user[0].password)
            .then((res) => {
                finded_user[0].loginHistory.push({
                    dateTime: (new Date()).toString(),
                    userAgent: userData.userAgent
                });
                User.update({ 
                    userName: finded_user[0].userName
                }, { 
                    $set: { 
                        loginHistory: finded_user[0].loginHistory 
                    } 
                }, { 
                    multi: false 
                })
                .exec()
                .then(() => {
                    resolve(finded_user[0]);
                })
                .catch((err) => {
                    reject("There was an error verifying the user: " + err);
                });
            })
            .catch((err) => {
                reject("Incorrect Password for user: " + userData.userName);
            })  
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.userName);
        });
    });
}
