import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import bcrypt from "bcryptjs";
import Post from "./models/Post.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blogDB";
mongoose.connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1);
  });

app.set('view engine', 'ejs');
app.use(express.static('public')); //required for css styling
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretblogkey12345",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day session longevity
}));

// Global middleware to pass currentUser to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Middleware to protect routes that require authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.render("home.ejs");
});

// --- Authentication Routes ---

// Registration
app.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/view");
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register.ejs", { error: "Username already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();

    // Auto-login after registration
    req.session.user = { id: newUser._id, username: newUser.username };
    res.redirect("/view");
  } catch (err) {
    console.error("Error registering user:", err);
    res.render("register.ejs", { error: "An error occurred during registration. Please try again." });
  }
});

// Login
app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/view");
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login.ejs", { error: "Invalid username or password." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login.ejs", { error: "Invalid username or password." });
    }

    // Login success, create session
    req.session.user = { id: user._id, username: user.username };
    res.redirect("/view");
  } catch (err) {
    console.error("Error logging in:", err);
    res.render("login.ejs", { error: "An error occurred during login. Please try again." });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

// --- Blog Routes ---

// View all blogs
app.get("/view", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render("view", { posts: posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Error retrieving posts");
  }
});

// Compose new blog
app.get("/compose", requireAuth, (req, res) => {
  res.render("compose.ejs");
});

app.post("/view", requireAuth, async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      author: req.session.user.username,
      authorId: req.session.user.id,
      content: req.body.content
    });
    await post.save();
    res.redirect("/view");
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Error creating post");
  }
});

// View a single blog
app.get("/view/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      res.render("single-post", { post: post });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.error("Error fetching single post:", err);
    res.status(500).send("Error retrieving post");
  }
});

// Edit blog (GET)
app.get("/edit/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // Check ownership
    if (post.authorId.toString() !== req.session.user.id) {
      return res.status(403).send("Unauthorized: You can only edit your own posts.");
    }
    res.render("edit", { post: post });
  } catch (err) {
    console.error("Error rendering edit page:", err);
    res.status(500).send("Error retrieving post");
  }
});

// Edit blog (POST)
app.post("/edit/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // Check ownership
    if (post.authorId.toString() !== req.session.user.id) {
      return res.status(403).send("Unauthorized: You can only update your own posts.");
    }
    post.title = req.body.title;
    post.content = req.body.content;
    await post.save();
    res.redirect("/view");
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send("Error updating post");
  }
});

// Delete blog
app.post("/delete/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // Check ownership
    if (post.authorId.toString() !== req.session.user.id) {
      return res.status(403).send("Unauthorized: You can only delete your own posts.");
    }
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/view");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Error deleting post");
  }
});

