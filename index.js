const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const { validateUserInput } = require("./util/validators");
require("dotenv").config();
const User = require("./models/user.model");
const Answer = require("./models/answer.model");

const app = express();

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(express.static("public"));
// mongo_uri="mongodb+srv://admin-ieeecas:ieeecasmongodb@cluster0.yozy1.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(
  "mongodb+srv://admin-ieeecas:ieeecasmongodb@cluster0.yozy1.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.connection.once("open", () => {
  console.log("connected to MONGO");
});
var link = "";
var ques = [
  "What are CMS? Elaborate on one primary advantage of having locally developed application over Moodle-based software.",
  "Nodemon is a package to be installed by npm. What is the primary use of 'nodemon'?",
  "What is the primary code to establish connection between MySQL database and PHP script?",
  "What are regex expressions? Write a basic regex expression for VIT Registration Number verification/validation.",
  "What is the difference between GET and POST requests?",
  "Name any frontend framework that doesn't use Javascript.",
  "Why should one prefer NodeJS over Apache servers?",
];

app.get("/smarty", (req, res) => {
  res.render("smarty");
});

app.get("/", (req, res, next) => {
  res.render("login");
});

app.post("/", (req, res) => {
  let { errors, valid } = validateUserInput(
    req.body.username,
    req.body.password
  );
  if (valid) {
    User.findOne(
      {
        username: req.body.username,
      },
      function (err, user) {
        try {
          if (user.password == req.body.password) {
            logU = true;
            message = "";
            res.cookie("username", req.body.username);
            res.cookie("password", req.body.password);
            console.log(req.cookies);
            res.redirect("/test");
          } else {
            res.redirect("/");
            message = "Invalid Password";
            console.log(message);
          }
        } catch (err) {
          res.redirect("/");
          message = "Invalid Username";
          console.log(message);
        }
      }
    );
  } else {
    console.log(errors);
    res.redirect('/');
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
    User.create(req.body.user, function (err, user) {
      console.log(user);
      try {
        console.log(user);
        logU = true;
        res.redirect("/");
      } catch (err) {
        console.log(err);
      }
    });
});

app.get("/test", (req, res) => {
  /*console.log(req.cookies['username']);*/
  if (
    req.cookies["username"] !== undefined &&
    req.cookies["password"] !== undefined
  ) {
    res.render("test", {
      userid: req.cookies["username"],
      pass: req.cookies["password"],
      link: link,
    });
  } else {
    res.redirect("/smarty");
  }

  /*userid = userid;
  pass = pass;*/
});

app.get("/test/invalid", (req, res) => {
  res.render("invalid");
});

app.get("/test/domain", (req, res) => {
  if (
    req.cookies["username"] !== undefined &&
    req.cookies["password"] !== undefined
  ) {
    var now = new Date().getTime();
    var activ= new Date("July 27, 2021 12:48:00").getTime();
    if(now >= activ){
      console.log(now);
      res.render("domtest", {
        ques: ques,
      });
    }
    else{
      res.redirect("/test/invalid");
    }
    
  } else {
    res.redirect("/smarty");
  }
});

app.post("/test/domain", (req, res) => {
  var answers = req.body.a;
  link = " ";
  Answer.create(
    {
      username: req.cookies["username"],
      password: req.cookies["password"],
      question: ques,
      answer: req.body.a,
    },
    function (err, user) {
      console.log(user);
      res.clearCookie("username");
      res.clearCookie("password");
      try {
        console.log(user);
        res.redirect("/");
      } catch (err) {
        console.log(err);
      }
    }
  );
});



app.get("/admin-login", (req, res) => {
  res.render("admin-login");
});

app.post("/admin-login", (req, res) => {
  let admin_user = req.body.username;
  let admin_pass = req.body.password;
  if (admin_user === "admin" && admin_pass === "Tr9dasAQ4I") {
    res.cookie("adminPass", admin_pass);
    res.cookie("adminID", admin_user);
    res.redirect("/answers");
  } else {
    res.redirect("/admin-login");
  }
});

app.get("/answers", async (req, res) => {
  let admin_user = req.cookies["adminID"];
  let admin_pass = req.cookies["adminPass"];
  console.log(admin_user,admin_pass);
  if (admin_user !== undefined && admin_pass !== undefined) {
    const adminRegisterNumber = req.cookies["password"];
    const users = await User.find({});
    const usernames = users.map((value) => value.name);
    const passwordsArray = users.map((value) => value.password);
    res.render("answers", {
      username: adminRegisterNumber,
      users: usernames,
      passwords: passwordsArray,
    });
  } else {
    res.redirect("/smarty");
  }
});

app.post("/answers", (req, res) => {
  let pass = req.body.users;
  Answer.findOne(
    {
      password: pass,
    },
    (err, user) => {
      if (!err) {
        let d = user._id.getTimestamp();
        let dt =
          d.getFullYear() +
          "-" +
          (d.getMonth() + 1) +
          "-" +
          d.getDate() +
          " " +
          (d.getHours() + 5) +
          ":" +
          (d.getMinutes() + 30) +
          ":" +
          d.getSeconds();
        if (d.getMinutes() >= 30) {
          dt =
            d.getFullYear() +
            "-" +
            (d.getMonth() + 1) +
            "-" +
            d.getDate() +
            " " +
            (d.getHours() + 6) +
            ":" +
            (d.getMinutes() - 30) +
            ":" +
            d.getSeconds();
        }
        res.cookie("answers", user);
        res.cookie("datetime", dt);
        res.redirect("/answers/show");
      } else {
        console.error(err);
        res.redirect("/answers");
      }
    }
  );
});

app.get("/answers/show", (req, res) => {
  let admin_user = req.cookies["adminID"];
  let admin_pass = req.cookies["adminPass"];
  if (admin_user != undefined && admin_pass != undefined){
    let datetime = req.cookies["datetime"];
    let answers = req.cookies["answers"];
    if (answers.answer === null) {
      answers.answer = ["Not Attempted"];
      answers.question = [""];
    }
    res.render("result", {
      questions: answers["question"],
      answers: answers["answer"],
      datetime: datetime,
    });
  } else {
    res.redirect("/smarty");
  }
});

app.post("/answers/show", (req, res) => {
  res.redirect("/answers");
});

const port = process.env.PORT || 3000;
app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Server started successfully at http://localhost:${port}`);
});