var express = require("express");
var multer = require("multer");


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage });
var app = module.exports = express();

app.set('views', './src/views')
app.set("view engine", "ejs");

app.use(express.static("src"));
app.use(express.static("../mkm-contract/build/contracts"));

app.get("/", function (req, res) {
  res.render("index");
});

app.post('/', upload.single('image'), function(req, res, next) {
  // req.file is the 'image' file
  // req.body will hold the text fields, if there are any
  
  return res.redirect('/');
})

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});

app.locals.dict = {};