//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

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

let listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {
    // console.log(foundItems)
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) { console.log(err);}
        else {console.log("Successuflly saved default items to database.")}
      }); 
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }); 
});

// const day = date.getDate();

app.get("/:customListName", function(req, res){
  let customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList) { // create a new list
        // console.log("Does NOT exist");

        let list = new List ({
          name : customListName,
          items: defaultItems
        })
      
        list.save();
        res.redirect("/" + customListName);
      }
      else{ // show an existing list
        // console.log("Exists!")
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
})

app.post("/", function(req, res){

  const itemName = req.body.newItem; 
  let listName = req.body.list;

  let item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/"); 
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){

  let checkedItemID = req.body.checkbox;
  let listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.")
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
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
