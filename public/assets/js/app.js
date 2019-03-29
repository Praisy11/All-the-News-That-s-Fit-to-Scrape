$(document).ready(function() {

// Grab the articles as a json
/*$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});
/*scarpe a new article when the button is clicke*/
$(".scrape-new").on("click", function(event) {
  event.preventDefault();
  $.get("/scrape", function(data) {
    window.location.reload();
  });
});

/* when the save button is clicked, get the article ID and set its saved property to true*/
$(".save-btn").on("click", function(event) {
  var newSavedArticle = $(this).data();
  newSavedArticle.saved = true;
  console.log("saved was clicked");
  var id = $(this).attr("data-articleId");
  $.ajax("/saved/" + id, {
    type: "PUT",
    data: newSavedArticle
  }).then(
    function(data) {
      location.reload();
    }
  );
});
/* when the button to removed a saved article from the saved list, get the article ID and set its saved property back to false*/
$(".unsave-btn").on("click", function(event) {
  var newUnsavedArticle = $(this).data();
  var id = $(this).attr("data-articleId");
  newUnsavedArticle.saved = false;
  $.ajax("/saved/" + id, {
    type: "PUT",
    data: newUnsavedArticle
  }).then(
    function(data) {
      location.reload();
    }
  );
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");
      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

/*When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
/*********************************************delete a note for the liked article burger** */
$(document).on("click", ".delete-note-modal", function(event) {
  var noteID = $(this).attr("data-noteId");

  $.ajax("/notes/" + noteID, {
    type: "GET"
  }).then(
    function(data) {
      $("#" + noteID).remove();
    })
});

/***************************************************************** */

/* save a note into DB*/
  
  $(".note-save-btn").on("click", function(event) {
    event.preventDefault();
    var articleId = $("#add-note-modal").attr("data-articleId")
    var newNote = {
      body: $("#note-body").val().trim()
    }
    console.log(newNote);
    $.ajax("/submit/" + articleId, {
      type: "POST",
      data: newNote
    }).then(
      function(data) {}
    );
  });
  /* when the add note button is clicked on the saved articles page and show the  modal.=>copied from bootstrap modal templte */
  $(".note-modal-btn").on("click", function(event) {
    var articleId = $(this).attr("data-articleId");
    $("#add-note-modal").attr("data-articleId", articleId);
    $(".notes-list").empty();
    $("#note-body").val("");
    $("#note-modal-title").empty();
    $.ajax("/notes/article/" + articleId, {
      type: "GET"
    }).then(
      function(data) {
        createModalHTML(data);
      }
    );

     $("#add-note-modal").modal("toggle");
  });

  /* generate the text inside the notes modal*/
  function createModalHTML(data) {
    var modalText = data.title;
    $("#note-modal-title").text("Notes for article: " + data.title);
    var noteItem;
    var noteDeleteBtn;
    console.log("data notes legnth ", data.notes.length)
    for (var i = 0; i < data.notes.length; i++) {
      noteItem = $("<li>").text(data.notes[i].body);
      noteItem.addClass("note-item-list");
      noteItem.attr("id", data.notes[i]._id);
      //  noteItem.data("id", data.notes[i]._id);
      noteDeleteBtn = $("<button> Delete </button>").addClass("btn btn-danger delete-note-modal");
      noteDeleteBtn.attr("data-noteId", data.notes[i]._id);
      noteItem.prepend(noteDeleteBtn, " ");
      $(".notes-list").append(noteItem);
    }
  }
});