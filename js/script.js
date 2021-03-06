//"use strict";

$(document).ready(function() {

  // connect-livereload via Gulp autorefreshes the site.
  $("body").append('<script src="http://localhost:35729/livereload.js?snipver=1"></script>');

  // hide loadin + show app
  $("#loading").out()
  $("#app").in()

  // refresh the site every minute
  setTimeout(function(){
    location.reload();
  }, 1200000);

  function clearApp(){
    addPost.out()
    onePost.out()
    onePost.empty()
    listPosts.out()
    logIn.out()
    e404.out()
    addEvent.out()
    help.out()
    calendar.out()

    $('html,body').scrollTop(0)
  }

  // VIEWS
  // Front page view
  var listPostsView = function () {
    clearApp()
    listPosts.in()
    help.in()
    calendar.in()
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

  var addEventView = function () {
    clearApp()
    isUser(function(){ // is a user
      addEvent.in('fadeIn');
    }, function() { // is not a user
      window.location = "#/login";
    });
    addEventController();
  }

  var logInView = function() {
    clearApp()
    logIn.in();
    logInController()
  }

  // MODEL
  // Set up routes
  crossroads.addRoute('/', listPostsView);
  crossroads.addRoute('/add', addPostView);
  crossroads.addRoute('/post/add', addPostView);
  crossroads.addRoute('/event/add', addEventView);
  crossroads.addRoute('/login', logInView);

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
          $("#frame_"+pointer).in('fadeIn')
          pointer ++;
        }

      }
    })

    get("Events", 10).then(function(d){
      eventsToday.empty()
      eventsTomorrow.empty()
      for(var i=0; i < d.length ; i++) {
        var now = moment();
        var activeDate = moment(d[i].eventDate, "DD/MM/YYYY");
        if(d[i].eventTitle) { var title = d[i].eventTitle }
        else {var title = ""}
        if(d[i].eventTime) { var time = d[i].eventTime }
        else {var time = ""}
        if (now.startOf('day').isSame(activeDate.startOf('day'))) {
            // Is today
            eventsToday.append(time + " - " + title + "<br />");
        } else {
            // is tomorrow
            var tomorrow = now.add(1, 'days')
            if (tomorrow.startOf('day').isSame(activeDate.startOf('day'))) {
              eventsTomorrow.append(time + " - " + title + "<br />");
            } else {
              // don't print
            }
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
      addPostSubmit.prepend("<input type='hidden' name='userName' value='"+J.userName+"'>")
      addPostSubmit.prepend("<input type='hidden' name='userId' value='"+J.userId+"'>")
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

  function addEventController() {
    eventDate.datepicker({
      autoclose: 'enabled',
      format: 'dd/mm/yyyy',
      todayHighlight: true
    })

    // reset form
    eventTime.val("")
    eventTitle.val("")
    eventDate.val("")

    addEventSubmit.on('click', function(event) {
      event.preventDefault();
      addEventForm.submit();
    });

    var clicked = false;
    addEventForm.on("submit", function(event) {
      event.preventDefault();
      addEventSubmit.prepend("<input type='hidden' name='userName' value='"+J.userName+"'>")
      addEventSubmit.prepend("<input type='hidden' name='userId' value='"+J.userId+"'>")
      if(clicked === false) {
        pleaseWait.in()
        addEventSubmit.attr('disabled','disabled')
        save('Events', 'addEventForm').then(function(resp){
          addEventSubmit.removeAttr('disabled');
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
});
