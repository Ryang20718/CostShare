var AWS = require("aws-sdk");
var dynamo = require('dynamodb');
var tableName = "CostShare";

const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

dynamo.AWS.config.update({accessKeyId: process.env.aws_access_key_id, secretAccessKey: process.env.aws_secret_access_key, region: "us-west-1"});
AWS.config.update({accessKeyId: process.env.aws_access_key_id, secretAccessKey: process.env.aws_secret_access_key, region: "us-west-1"});

const s3 = new AWS.S3();
var dynamodb = new AWS.DynamoDB();



////////CREATE TABLE
exports.createTable = function(){
var params = {
    TableName : tableName,
    KeySchema: [       
        { AttributeName: "email", KeyType: "HASH"},  //Partition Key
    ],
    AttributeDefinitions: [       
        { AttributeName: "email", AttributeType: "S" }
    ],

    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
};




////INSERT Buyer///
exports.insertBuyer = function(email_key, arrayItems, totalCost){//insert or update function

var docClient = new AWS.DynamoDB.DocumentClient();//way to insert
var params = {
  TableName: tableName,
  Item:{
    "email": email_key,//email
    "role": "buyer",
    "cost": totalCost,//integer
    "items":arrayItems//array
  }
};

// Call DynamoDB to add the item to the table
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
};







////INSERT RoadTripper/// the one making the big grocery haul
exports.insertTripper = function(email_key, buyer_array){//insert or update function

var docClient = new AWS.DynamoDB.DocumentClient();//way to insert
var params = {
  TableName: tableName,
  Item:{
    "email": email_key,//email
    "role": "tripper",
    "buyers": buyer_array,//array
  }
};

// Call DynamoDB to add the item to the table
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
};




//Delete a buyer from a tripper's list

exports.deleteTripper = function(email_key, buyer){
var docClient = new AWS.DynamoDB.DocumentClient();
//first get the item
var params = {
    TableName: tableName,
    Key:{
        "email": email_key,
    }
};

docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        //remove buyer from array
    var array = data.Item.buyers;
    var index = array.indexOf(buyer);
        if (index > -1) {
        array.splice(index, 1);
        }  
    var params = {
    TableName: tableName,
    Item:{
        "email": email_key,//email
        "role": "tripper",
        "buyers": array,//array
        }
    };

        // Call DynamoDB to add the item to the table
        docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
}
    
});
};












///////READ THE ITEM
exports.read = function(email_key){//key is by email
    
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: tableName,
    Key:{
        "email": email_key,
    }
};


docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
});
};
//DELETEs Buyer

exports.deleteBuyer = function(email_key){
var docClient = new AWS.DynamoDB.DocumentClient();
    
var params = {
    TableName:tableName,
    Key:{
        "email": email_key,
    }
};

console.log("Attempting a conditional delete...");
docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
});
};






///SCAN ALL ITEMS
exports.scan = function(){
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: tableName
};

console.log("Scanning table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the movies
        console.log("Scan succeeded.");
        console.log(data.Items);

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
}
};







///////FOR PENGYOU APP

exports.insertMale = function(email_key, age, citizen, house, car, yearIncome, picArray){//insert or update function

var docClient = new AWS.DynamoDB.DocumentClient();//way to insert
var params = {
  TableName: tableName,
  Item:{
    "email": email_key,//email
    "age": age,
    "citizen": citizen,//integer
    "house":house,//array
    "car": car,
    "yearIncome": yearIncome,
    "pictures": picArray
  }
};

// Call DynamoDB to add the item to the table
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
};



///Amazon S3 Bucket Need to get it to work

exports.updatePictures = function (email_key, arrayOfPics) {
var params = {
  TableName: tableName,
    TableName: tableName,
    Key:{
        "email": email_key,
    }
};
var docClient = new AWS.DynamoDB.DocumentClient();//way to insert
docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        var pictureArray= data.Item.pictures;
        console.log(pictureArray);
        for (var i = 0; i < arrayOfPics.length; i++) {
            pictureArray.push(arrayOfPics[i]);// add pictures
        }
        console.log(pictureArray);//final array list of all picture url
        exports.insertMale("test@mail", 20, true, true, true, "100000",pictureArray);
    }
});
};


