$(document).ready(function () {
  $(".next").on("click", function () {
    var currentDiv = $(".active");
    var nextDiv = currentDiv.next();
    var first = $(".dateField").first();
    // first.animate({ opacity: "0", width: "0px" }, function () {
    first
      .appendTo(".carousel_wrapper__inner")
      .css({ opacity: "1", width: "15%" });
    // });
    if (nextDiv.length) {
      currentDiv.removeClass("active");
      nextDiv.addClass("active");
    }
  });

  $(".prev").on("click", function () {
    var currentDiv = $(".active");
    var prevDiv = currentDiv.prev();
    var last = $(".dateField").last();
    last
      .prependTo(".carousel_wrapper__inner")
      .css({ opacity: "1", width: "15%" });
    // });;
    // last.animate({ opacity: "1", width: "15%" });
    if (prevDiv.length) {
      currentDiv.removeClass("active");
      prevDiv.addClass("active");
    }
  });
});
