"use strict";

$(document).ready(function() {

  // connect-livereload via Gulp autorefreshes the site.
  $("body").append('<script src="http://localhost:35729/livereload.js?snipver=1"></script>');

  // hide loadin + show app
  $("#loading").out()
  $("#app").in("fadeIn")

  // refresh the site every minute
  setTimeout(function(){
    location.reload();
  }, 60000);

  function clearApp(){
    addPost.out()
    onePost.out()
    onePost.empty()
    listPosts.out()
    logIn.out()
    e404.out()

    $('html,body').scrollTop(0)
  }

  // VIEWS
  // Front page view
  var listPostsView = function () {
    clearApp()
    listPosts.in('fadeIn')
    listPostsController()
  }

  var addPostView = function () {
    clearApp()
    isUser(function(){ // is a user
      addPost.in('fadeIn');
    }, function() { // is not a user
      window.location = "#/login";
    });
    addPostController();
  }

  // turned off since not in use currently
  /*
  var onePostView = function (id) {
    clearApp()
    onePost.in('fadeIn');
    onePostController(id);
  } */

  var logInView = function() {
    clearApp()
    logIn.in();
    logInController()
  }

  // MODEL
  // Set up routes
  crossroads.addRoute('/', listPostsView);
  crossroads.addRoute('/add', addPostView);
  crossroads.addRoute('/login', logInView);
  //crossroads.addRoute('/p/{id}', onePostView);   // turned off since not in use currently


  // that's a 404 if the route structure is not matched
  crossroads.bypassed.add(function(request){
    clearApp()
    e404.in()
  })

  // start routing
  route(crossroads);

  // CONTROLLERS
  // Controller, "/"
  function listPostsController() {
    get("Posts", 20).then(function(data){
      if(data.error === "No such post") {
        e404.in()
      } else {
        var d = data;
        for(var i=0; i<d.length; i++) {
          // add image
          if(d[i].addImage && d[i].addImage.url) { var image = d[i].addImage.url }
          else { var image = "" }

          // add title
          if(d[i].title) { var title = d[i].title }
          else {var title = ""}

          // draw together
          listPosts.append("<div class='full frame hidden' id='frame_"+i+"' style='background-image: url("+image+")'><h1>"+title+"</h1></div>")
        }

        // jumpstart
        $("#frame_0").in();
        var pointer = 0;

        // start timer
        var timer = setInterval(function(){ myTimer() }, 5000);
        function myTimer() {
          if(pointer === 0) { var last = d.length}
          else if(pointer >= d.length) { pointer = 0; var last = d.length }
          else {last = pointer-1}
          $("#frame_"+last).out()
          $("#frame_"+pointer).in()
          pointer ++;
        }

      }
    })
  }

  // Controller, "/add"
  function addPostController() {

    // reset form
    title.val("")
    addImage.val("")

    addPostSubmit.on('click', function(event) {
      event.preventDefault();
      addPostForm.submit();
    });

    var clicked = false;
    addPostForm.on("submit", function(event) {
      event.preventDefault();
      if(clicked === false) {
        pleaseWait.in()
        addPostSubmit.attr('disabled','disabled')
        save('Posts', 'addPostForm').then(function(resp){
          addPostSubmit.removeAttr('disabled');
          pleaseWait.out()
          window.location = "#"
        })
        clicked = true;
      }
    })
  }

  function logInController(){
    fbLogin.on('click', function(){
      FB.login(function(response) {
        if (response.authResponse) {
          FB.api('/me', function(response) {
            J.userId = response.id;
            checkIn()
          });
        } else {
          J.userId = false;
          window.location = "#/login"
        }
      });
    })
  }

  // Controller, "/p/{id}"
  // turned off cause currently not in use
  /*
  function onePostController(id) {
    get("Posts", 1,  id).then(function(data_0) {
      var data = data_0[0]
      if(data_0.error === "No such post" || data_0.error === "Query is confused") {
        e404.in()
      } else {
        if(typeof data.titles === "string") {
          data.titles = JSON.parse(data.titles);
        }
        onePost.empty();
        $.each(data, function(key, value) {
          if(key == "updatedAt" || key == "createdAt" || key == "objectId") {}
          else {
            if(value.length>0) {
              onePost.append("<h4>"+data.titles[key]+"<h4>");
              onePost.append(value);
            }
            // if it's a parse url
            if(value.url) {
              onePost.append("<h4>"+data.titles[key]+"<h4>");
              onePost.append("<img src='"+value.url+"' style='width: 300px; height: auto;'>");
            }
          }
        })
      }
    });
  } */
});
