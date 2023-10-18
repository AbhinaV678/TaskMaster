//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://debmickey4:DoctorDisrespect1993@cluster0.yacgh7z.mongodb.net/toDoListDB");

const itemsSchema = new mongoose.Schema({
        itemName : {
          type: String,
          required : [true,"Please check your data entry, no itemName specified!"]
        }
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    itemName : "Welcome to TaskMaster!",
});

const item2 = new Item({
  itemName : "Use the ( + ) icon to insert tasks.",
});

const item3 = new Item({
  itemName : "Use the checkbox beside each task by ticking it to delete the particular task.",
});

const item4 = new Item({
  itemName : "You can also make custom lists by appending the / symbol and then appending your custom name in the website url displayed in the browser and pressing enter. Eg: websiteUrl/myHouseworkList + ENTER",
});

const item5 = new Item({
  itemName : "If you want to name new lists based on dates then do it like-> websiteUrl/10_Oct_2023 + ENTER",
});

const item6 = new Item({
  itemName : "If you want to see the names of lists you have created visit 'websiteUrl/data' , you can delete the lists there by checking the checkboxes.",
});

const item7 = new Item({
  itemName : "Don't submit blank entries!",
});

const defaultItems = [item1,item2,item3,item4,item5,item6,item7];

const ListSchema = new mongoose.Schema({
        name : String,
        items: [itemsSchema]
});

const List = mongoose.model("List",ListSchema);

app.get("/", async function(req, res) {
  var items = await Item.find({});

  if(items.length===0){
    Item.insertMany(defaultItems);
    items = await Item.find({});
  }
  res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/:customListName",async function(req,res){
      const customListName= _.capitalize(req.params.customListName);

      if(customListName==="Favicon.ico"){
        return;
      }

      if(customListName==="Data"){
        var lists = await List.find({});
        return res.render("listData", {listTitle: "CUSTOM LIST INVENTORY", newListItems: lists});
      }

      var confirmList = await List.findOne({ name: customListName }).exec();
      if(confirmList!==null){
        res.render("list", {listTitle: confirmList.name, newListItems: confirmList.items});
        console.log("list already exists.");
      }else{
        const list = new List({
          name: customListName,
          items: defaultItems
          });
        list.save();
        console.log("new list created.");
        res.redirect("/"+customListName);
      }
});

app.post("/", async function(req, res){

  const name = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    itemName : name,
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    var foundList = await List.findOne({ name: listName }).exec();
    console.log(foundList);
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async function(req, res){
 const deleteItemId = req.body.deletedItem;
 const listName = req.body.listName;
  if(listName==="Today"){
    await Item.findByIdAndDelete(deleteItemId);
    res.redirect("/");
  }else{
    var foundList = await List.findOneAndUpdate({name: listName},{$pull:{items:{_id: deleteItemId}}});
    if(foundList){
      foundList.save();
      res.redirect("/" + listName);
    }else{
      res.send({message: "Error!"});
    }
  }
});


app.post("/deleteList", async function(req, res){
  const deleteItemId = req.body.deletedList;
  var listName = "Data";
  await List.findByIdAndDelete(deleteItemId);
  res.redirect("/" + listName);
 });

let port = process.env.PORT;
if(port==null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});
