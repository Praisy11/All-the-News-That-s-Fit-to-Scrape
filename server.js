var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 7000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Set Handlebars.

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/Mongoscraper", { useNewUrlParser: true });

// Routes
app.get("/", function(req, res) {
  db.Article.find({saved:false},
    function (error, dbArticle){
      if(error){
        console.log(error);
      }else{
     // Grab every document in the Articles collection
      //.then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index",{
        articles:dbArticle
      });
    }
  })
      //res.json(dbArticle);
    //})
    //.catch(function(err) {
      // If an error occurred, send it to the client
    //res.json(err);
   // });
});


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/section/technology").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("li a").each(function(i, element) {
      // Save an empty result object
      var result = {};

                       // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h2")
        .text();
        console.log(result.title);
      result.link = $(this)
        .attr("href");
        console.log(result.link);
      result.summary = $(this)
      .children("p")
      .text();
      console.log(result.summary);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", { dbArticle } )
      console.log(dbArticle);/*view added note*/
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
     //res.render("Articleswithnotes",{Article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id },{$push: { Note: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
/* for viewing all saved articles*/
app.get("/saved", function(req, res) {
  db.Article.find({
      saved: true
    })
    .then(function(dbArticle) {
            res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
        res.json(err);
    })

});
/* for article to be saved*/
app.put("/saved/:id", function(req, res) {
  db.Article.findByIdAndUpdate(
      req.params.id, {
        $set: req.body
      }, {
        new: true
      })
    .then(function(dbArticle) {
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      res.json(err);
    });
});


app.get("/notes/article/:id", function(req, res) {
  db.Article.findOne({"_id":req.params.id})
    .populate("notes")
    .exec (function (error, data) {
        if (error) {
            console.log(error);
        } else {
          res.json(data);
        }
    });        
});

app.get("/notes/:id", function(req, res) {

  db.Note.findOneAndRemove({_id:req.params.id}, function (error, data) {
      if (error) {
          console.log(error);
      } else {
      }
      res.json(data);
  });
});
/************************************************* */

// Delete from the DB
app.delete("/articles/:id", function(req, res) {
  // Remove a comment using the objectID
  db.Note.remove(
    {
      _id: req.params.id
    },
    function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.json(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
                console.log(removed);
        res.json(removed);
      }
    }
  );
  });
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
