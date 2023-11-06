import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "toDoS",
  password: "pilsucki",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function getItems() {
  const result = await db.query("SELECT * FROM items");
  let items =[];
  result.rows.forEach((item) => {
    items.push(item);
  });
  console.log("stringified list acquired: "+JSON.stringify(items));
  return items;
}

async function insertItem(title) {
  

  const item = await db.query(
    "INSERT INTO items (title) VALUES ($1) Returning *",
    [title]
  );
  console.log("The follwoing item was inserted: "+JSON.stringify(item.rows));

}

async function updateItem(task) {
  

  const item = await db.query(
    "UPDATE items SET title = '"+task.updatedItemTitle+"'WHERE id = "+task.updatedItemId+" Returning *"
  );
  console.log("The follwoing item was UPDATED: "+JSON.stringify(item.rows));

}

async function deleteItem(id) {
  

  const item = await db.query(
    "DELETE FROM items WHERE id = "+id+" Returning *"
  );
  console.log("The follwoing item was Deleted: "+JSON.stringify(item.rows));

}
/*
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];
*/

app.get("/", async (req, res) => {
  
  let items = await getItems();
  let retval = {
    listTitle: "Today",
    listItems: items,
  };
  console.log("Object sent: "+JSON.stringify(retval));
  res.render("index.ejs", retval);
});

app.post("/add", async (req, res) => {
  const item = await req.body.newItem;
  
  insertItem(item); 
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = await req.body.updatedItemId;
  const title = await req.body.updatedItemTitle;
  const item = {
    updatedItemId : id,
    updatedItemTitle :title
  };
  
  console.log("Item to be edited: "+JSON.stringify(item));
  updateItem(item); 
  res.redirect("/");
});

app.post("/delete", (req, res) => {

  deleteItem(req.body.deleteItemId); 
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
