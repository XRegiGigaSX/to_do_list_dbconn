const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

//mongoose setup
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://Rayyan:Rayyan%402008@cluster0.pmu0v.mongodb.net/todolistDB');
}

// schema+model building
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [itemsSchema]
})

const List = mongoose.model('List', listSchema)

const Item = mongoose.model('Item', itemsSchema)

const default1 = new Item ({ 
    name: "Study"
})

const default2 = new Item ({ 
    name: "Play"
})

const defaultItems = [default1, default2];

var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var today = new Date();
var options = {
 weekday: "long",
 day: "numeric",
 month: "long"
}

var dday = today.toLocaleDateString("en-US", options);

app.get("/", function(req, res){
 
   Item.find({}, function(err, items){
    if(err){
        console.log(err);
    }else{
        if(items.length === 0){
            Item.insertMany(defaultItems, function(error){
                if(err){
                    console.log(error);
                }else{
                    console.log("success!");
                }
            })
            res.redirect("/");
        }else{
            res.render("list", {kindOfDay: dday, task: items });
        }
    }
})
})

app.post("/", (req, res) => {

    
    const itemName = new Item ({
        name: req.body.newItem
    })
    
    if ( req.body.button === "Monday," || req.body.button === "Tuesday," || req.body.button === "Wednesday," || req.body.button === "Thursday," || req.body.button === "Friday," || req.body.button === "Saturday," || req.body.button === "Sunday,"){
        itemName.save(function (err){});
        res.redirect("/");
    }else{
        List.findOne({name: req.body.button}, function(err, foundList){
            foundList.items.push(itemName);
            foundList.save(function (err){});
            res.redirect("/"+req.body.button);
        })
    }

    

})

app.post("/delete", function(req, res){
    console.log(req.body)
    if ( req.body.listDlt === dday){
        Item.deleteOne({_id: req.body.checkbox}, function(err){})
        res.redirect("/");
    }else{
        List.findOne({name: req.body.listDlt}, function(err, foundList){
            if (!err){
                List.findOneAndUpdate({name: req.body.listDlt}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, foundList){})
                res.redirect("/"+req.body.listDlt)
            }
        })
    }
})

app.get("/:customListName", function(req, res){

    const customList = _.capitalize(req.params.customListName)
    
    List.findOne({name: customList}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customList,
                    items: defaultItems
                })

                list.save(function(err){});
                res.redirect("/"+customList)
            }else{
                res.render("list", {kindOfDay: foundList.name, task: foundList.items})
            } 
        }
    })
    
    
    // res.render("list", {kindOfDay: dday, task: list.items })
})

app.listen(5500, () => {
    console.log("server up and running on port 5500.")
})