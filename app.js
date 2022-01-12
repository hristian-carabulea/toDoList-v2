//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

// create a new schema / structure for database
const itemsSchema = new mongoose.Schema ({ // schem itemsSchema is a structure for a collection (table in relational db)
  name: String
});
 
const Item = mongoose.model("Item", itemsSchema); //Item is a model

let item1 = new Item ({ name: "Welcome to your To Do List!" });
let item2 = new Item ({ name: "Hit the + button to add a new item" });
let item3 = new Item ({ name: "<-- Hit this to delete and item." });

let defaultItems = [item1, item2, item3];
Item.insertMany(defaultItems, function(err){
  if (err) { console.log(err);}
  else {console.log("Successuflly saved default items to database.")}
}); 

app.get("/", function(req, res) {

// const day = date.getDate();

  res.render("list", {listTitle: "Today", newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
