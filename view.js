$(function() {

  var tmpl = "select distinct * where {<http://ja.dbpedia.org/resource/@> ?p ?o.}";

  var json = JSON.parse($("script[type='application/json']").text());
  var main = $("<div/>").attr("id", "main").appendTo("body");
  var menu = $("<div/>").attr("id", "menu").appendTo("body");
  var iframe = $("<iframe/>").attr({
    "id" : "iframe",
    "name" : "iframe",
    "width" : "100%",
    "height" : "100%",
    "src" : "svg.html?" + json.indicator + "#" + json.range
  }).appendTo(main);

  menu.append($("<h1/>").text(json.title));
  if (json.description) {
    menu.append($("<p/>").text(json.description));
  }
  iframe.on("mouseover", function() {
    $("#iframe")[0].contentDocument.location.hash = "#" + json.range;
  });

  menu.append($("<div id='buttons'/>"));

  json.children.forEach(function(a, i) {
    var id = "children" + i;
    $("#buttons").append($("<div/>").attr({
      "class" : "button",
      "data-href" : id
    }).on("click", function() {
      var key = $(this).attr("data-href");
      $(".on").removeClass("on");
      $(this).addClass("on");
      $(".cell").hide();
      $("#" + key).fadeIn();
      $("#iframe")[0].contentDocument.location.hash = a.hash + "&" + json.range;
    }));

    var div = $("<div class='cell'/>").attr("id", id);
    if (a.dbpedia) {
      div.append($("<h2/>").text(a.dbpedia));

      $.ajax({
        url : 'http://ja.dbpedia.org/sparql',
        data : {
          query : tmpl.replace("@", a.dbpedia)
        },
        headers : {
          "Accept" : "application/sparql-results+json"
        }
      }).then(function(json) {
        json.results.bindings.forEach(function(v) {
          if (v.p.value == "http://www.w3.org/2000/01/rdf-schema#comment") {
            div.append($("<p2/>").text(v.o.value));
          } else if (v.p.value == "http://xmlns.com/foaf/0.1/depiction") {
            div.append($("<img/>").attr("src", v.o.value));
          }
        });
      });

    } else {
      div.append($("<h2/>").text(a.title));
    }
    if (a.comment)
      div.append($("<p/>").text(a.comment));
    div.on("mouseover", function() {
      $("#iframe")[0].contentDocument.location.hash = a.hash + "&" + json.range;
      return false;
    });
    div.hide();
    menu.append(div);
  });

});