//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =  require('mongoose');
const _ = require("lodash")
const { render } = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const uri_cloud = "mongodb+srv://ouriemchi4dev:Wolf45@cluster0.c9yxup5.mongodb.net/todolistDB"
const uri = 'mongodb://127.0.0.1/todolistDB'
mongoose.connect(uri_cloud,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
  console.log('Database successfuly connected ')
})
.catch((err)=>{
  console.error('Connection Error :',err)
}) 

const itemSchema = mongoose.Schema({
  item : String 
})
const Item =  mongoose.model('Item',itemSchema)
const items = [];



// mongoose.connection.close()
const page_list = ['about','home']
const item_1 = new Item({item:"Welcome to your todo List !"})
const item_2 = new Item({item:"Hit the + button to add a new item."})
const item_3 = new Item({item:"<-- Hit this to delete an item"})
const defaultItems = [item_1,item_2,item_3]
let title_list = "Today";

const listSchema = mongoose.Schema({
  name:String,
  items:[itemSchema]

})
const List = mongoose.model("List", listSchema)






app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName) 

  List.findOne({name:customListName})
  .then((result)=>{
    res.render("list", {listTitle: result.name, newListItems: result.items})
  })
  .catch((err)=>{
    const list = new List({
      name:customListName,
      items:defaultItems
    })
    list.save()

    res.redirect("/"+customListName)
    // console.error(err)
  })





  // const list = new List({
  //   name:customListName,
  //   items:item_list
  // })
  // list.save()



})



app.get("/",(req,res)=>{
  List.findOne({name:"Today"})
  .then((result)=>{
    res.render("list",{listTitle:"Today",newListItems:result.items})

  })
  .catch((err)=>{
    const defaultList = new List({
      name:"Today",
      items:defaultItems
    }) 
    defaultList.save()
    res.redirect("/")

  })



})














app.post("/", function(req, res){
  

  // const itemName = _.capitalize(req.body.newItem)
  const itemName = _.capitalize(req.body.newItem)

  const listName = req.body.list 
  const new_item = new Item({item:itemName})

  List.findOne({name:listName})
    .then((result)=>{
      result.items.push(new_item)
      result.save()
      res.redirect("/"+listName)

    })
    .catch((err)=>{
      console.error(err)
    })





  // if (listName === "Today"){
  //   new_item.save()
  //     .then(()=>{

  //       console.log('Document successfuly saved!')
  //       res.redirect("/")
  //      })
  //     .catch((err)=>{
  //       console.error('Item insertion failed : ',err)
  //     })
    
  // }else{
  //   List.findOne({name:listName})
  //   .then((result)=>{
  //     result.items.push(new_item)
  //     result.save()
  //     res.redirect("/"+listName)

  //   })
  //   .catch((err)=>{
  //     console.error(err)
  //   })
  // }
 

});

app.post("/delete",(req,res)=>{
  const checkedItemID =req.body.checkbox
  const listName = req.body.listName

  if(listName === "Today"){
    Item.deleteOne({_id:checkedItemID})
      .then(()=>{
        console.log('item has been deleted!')
        res.redirect("/")
       })
      .catch((err)=>{
        console.error('Item insertion failed : ',err)
      })

  }else{
    List.findOne({name:listName})
    .then((result)=>{
      List.findOneAndUpdate(
        {name:result.name},
        {$pull:{items:{_id:checkedItemID}}}
      )
      .then(()=>{
        console.log("Item has been removed!")
        res.redirect("/"+listName)
      })
      .catch((err)=>{
        console.error(err)
      })

    })
    .catch((err)=>{
      console.error(err)
    })
  }





  

})





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
