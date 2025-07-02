import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public')); //required for css styling
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/view" , (req,res) => {
  res.render("view", { posts: posts });
})

app.get("/compose",(req,res) =>{
  res.render("compose.ejs");
})

let postId = 1;
const posts = [];
app.post("/view", (req, res) => {
  const post = {
    id: postId++, 
    title: req.body.title,
    author: req.body.author,
    content: req.body.content,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  };
  posts.push(post);
  res.redirect("/view");
});

app.get("/view/:id", (req, res) => {
  const post = posts.find((p) => p.id == req.params.id);
  if (post) {
    res.render("single-post", { post: post });
  } else {
    res.status(404).send("Post not found");
  }
});


app.get("/edit/:id", (req, res) => {
  const post = posts.find((p) => p.id == req.params.id);
  if (post) {
    res.render("edit", { post: post });
  } else {
    res.status(404).send("Post not found");
  }
});


app.post("/edit/:id", (req, res) => {
  const post = posts.find((p) => p.id == req.params.id);
  if (post) {
    post.title = req.body.title;
    post.author = req.body.author;
    post.content = req.body.content;
    res.redirect("/view");
  } else {
    res.status(404).send("Post not found");
  }
});


app.post("/delete/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id == req.params.id);
  if (index !== -1) {
    posts.splice(index, 1);
  }
  res.redirect("/view");
});

app.listen(port,() =>{
    console.log(`Listening on port ${port}`);
});