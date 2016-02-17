var width = Math.min(window.innerWidth, window.innerHeight) - 20;
var height = width;

var innerRadius = width / 10;
var outerRadius = width / 2 - 60;
var divRadius = (outerRadius - innerRadius);

var startAngle = -90;
var endAngle = 180;
var divAngle = (endAngle - startAngle);

var color = (function() {
  var colors = [];
  colors.push(d3.interpolateHsl("#000066", "#0066ff"));
  colors.push(d3.interpolateHsl("#0066ff", "#ffffff"));
  colors.push(d3.interpolateHsl("#ffffff", "#ff6600"));
  colors.push(d3.interpolateHsl("#ff6600", "#cc3300"));

  return function(v) {
    if (!v)
      return "none";
    var v1 = parseFloat(d3.select("#tick1").attr("x")) / divRadius;
    var v2 = parseFloat(d3.select("#tick2").attr("x")) / divRadius;
    var minv = Math.min(v1, v2);
    var maxv = Math.max(v1, v2);
    if (v < minv) {
      v = 0;
    } else if (v > maxv) {
      v = 1.0;
    } else {
      v = (v - minv) / (maxv - minv);
    }
    var i = Math.min(colors.length - 1, Math.floor(v * colors.length));
    var j = v * colors.length - i;
    return (colors[i])(j);
  };
})();

d3.select("svg").attr("width", width).attr("height", height);
d3.select("#main").attr("transform", function() {
  return "translate(" + [ width / 2, height / 2 ].join(",") + ")";
});
d3.select("#histgram").attr("transform", function() {
  return "translate(" + [ width / 2 - outerRadius, height / 2 - innerRadius ].join(",") + ")";
});
d3.select("#tick1").attr("x", 0);
d3.select("#tick2").attr("x", divRadius);

var drag = d3.behavior.drag();
d3.select("#tick1").call(drag);
d3.select("#tick2").call(drag);

drag.on('drag', function(d) {
  var x = d3.event.x;
  x = Math.max(x, 0);
  x = Math.min(x, divRadius);
  d3.select(this).attr("x", x);
}).on('dragend', function(d) {

  var v1 = parseFloat(d3.select("#tick1").attr("x")) / divRadius;
  var v2 = parseFloat(d3.select("#tick2").attr("x")) / divRadius;

  var s = "#"
  s += Math.floor(Math.min(v1, v2) * 100);
  s += ",";
  s += Math.floor(Math.max(v1, v2) * 100);

  console.log(s);
  update();
});

var arc = d3.svg.arc().innerRadius(function(d, i) {
  return divRadius * d.minYearScore + innerRadius;
}).outerRadius(function(d, i) {
  return divRadius * d.maxYearScore + innerRadius;
}).startAngle(function(d, i) {
  return Math.PI / 180 * (divAngle * d.minAreaScore + startAngle + 90);
}).endAngle(function(d, i) {
  return Math.PI / 180 * (divAngle * d.maxAreaScore + startAngle + 90);
});

function onhashchange() {

  var condition = [];

  location.hash.replace("#", "").split("&").forEach(function(v) {
    if (v.match(/^([0-9]{1,3}),([0-9]{1,3})$/)) {
      var x1 = parseInt(RegExp.$1);
      var x2 = parseInt(RegExp.$2);
      x1 = Math.min(100, Math.max(x1, 0));
      x2 = Math.min(100, Math.max(x2, 0));
      d3.select("#tick1").attr("x", x1 / 100 * divRadius);
      d3.select("#tick2").attr("x", x2 / 100 * divRadius);
    } else if (v.match(/^[0-9]{4}$/)) {
      condition.push({
        year : v
      });
    } else if (v.match(/^([0-9]{4})-([0-9]{4})$/)) {
      var v1 = parseInt(RegExp.$1);
      var v2 = parseInt(RegExp.$2);
      for (var i = Math.min(v1, v2); i <= Math.max(v1, v2); i++)
        condition.push({
          year : i
        });
    } else if (v.match(/^([0-9]{4}),(.+)$/)) {
      condition.push({
        year : RegExp.$1,
        area : "http://geonames.jp/resource/" + RegExp.$2
      });
    } else if (v.match(/^.+$/)) {
      condition.push({
        area : "http://geonames.jp/resource/" + v
      });
    }
  });

  d3.selectAll("path.cell").attr({
    "opacity" : function(d, i) {
      var opacity = 0.5;
      condition.forEach(function(c) {
        if (c.year && d.year && c.year != d.year)
          return;
        if (c.area && d.area && c.area != d.area)
          return;
        opacity = 1.0;
      });
      return condition.length == 0 ? 1.0 : opacity;
    }
  });

  update();
}

(function() {
  if (!location.search.match(/^\?(.+)$/)) {
    location.search = "_A06601";
  }
  var notation = RegExp.$1;
  d3.json("00.json", function(areas) {
    d3.json("http://qbjs.blob.core.windows.net/ssds/" + notation + ".jsonld", function(data) {
      init(shape(areas, data));
      window.addEventListener("hashchange", onhashchange);
      onhashchange();
    });
  });

  d3.text("http://ind.geonames.jp/ssds/" + notation + "/about").header("Accept", "text/turtle").get(function(err, txt) {
    txt.split("\n").forEach(function(line) {
      if (line.match(/.*rdfs:label\s+"(.+)".+$/)) {
        var label = RegExp.$1;
        document.title = label;
        d3.select("footer").append("span").text("社会人口統計体系 " + notation);
        d3.select("footer").append("br");
        d3.select("footer").append("span").text(label);
      }
    });
  });

})();

function shape(areas, data) {
  // Step1 : filter
  var body = [];
  data.body.forEach(function(a) {
    areas.forEach(function(area) {
      if (a.area == area.href)
        body.push(a);
    });
  });
  // Step2 : values
  var minValue = Number.POSITIVE_INFINITY;
  var maxValue = Number.NEGATIVE_INFINITY;
  body.forEach(function(a) {
    var value = parseFloat(a.value);
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  });

  body.forEach(function(a) {
    var value = parseFloat(a.value);
    a.score = (value - minValue) / (maxValue - minValue);
  });

  // Step3 : years
  var years = [];
  body.forEach(function(a) {
    var year = parseInt(a.year);
    if (years.indexOf(year) == -1)
      years.push(year);
  });
  years.sort();
  var minStep = (years.length < 2 ? 1 : Number.POSITIVE_INFINITY);
  for (var i = 1; i < years.length; i++)
    minStep = Math.min(minStep, years[i] - years[i - 1]);
  var mod = [];
  for (var i = years[0]; i <= years[years.length - 1]; i += minStep)
    mod.push(i);

  years = mod;

  // Step4 : reshape
  var core = {
    data : [],
    areas : areas,
    years : years,
    histgram : [],
    maxHistgram : 0,
    minValue : minValue,
    maxValue : maxValue
  };

  for (var i = 0; i < 100; i++)
    core.histgram.push(0);

  body.forEach(function(a) {
    for (var i = 0; i < core.histgram.length; i++)
      if (a.score < i / core.histgram.length) {
        core.histgram[i]++;
        core.maxHistgram = Math.max(core.histgram[i], core.maxHistgram);
        return;
      }
  });

  areas.forEach(function(area, i) {
    var obj = {};
    obj.href = area.href;
    obj.name = area.label;
    obj.minAreaScore = i / areas.length;
    obj.maxAreaScore = (i + 1) / areas.length;
    obj.data = [];
    years.forEach(function(year, j) {
      var a = {};
      body.forEach(function(b) {
        if (b.area == area.href && b.year == year)
          a = b;
      });
      a.minAreaScore = i / areas.length;
      a.maxAreaScore = (i + 1) / areas.length;
      a.minYearScore = j / years.length;
      a.maxYearScore = (j + 1) / years.length;
      obj.data.push(a);
    });
    core.data.push(obj);
  });
  return core;
}

// 描画

function update() {
  d3.selectAll("rect.sample").transition().attr({
    "fill" : function(d, i) {
      return color(i / 100);
    }
  });
  d3.selectAll("path.cell").transition().attr({
    "fill" : function(d, i) {
      return d ? color(d.score) : "none";
    }
  });
}

var tmpl = "select distinct * where {?s dbpedia-owl:wikiPageWikiLink/owl:sameAs <$1> ; dcterms:subject/skos:broader category-ja:$2年の日本 .}";

function init(core) {
  var unitRadius = divRadius / core.years.length;
  var unitAngle = divAngle / core.areas.length;

  d3.select("#histgram").selectAll("rect.sample").data(core.histgram).enter().append("rect").attr("class", "sample");
  d3.selectAll("rect.sample").attr({
    "height" : function(d) {
      return d / core.maxHistgram * divRadius;
    },
    "width" : divRadius / core.histgram.length + 1,
    "y" : function(d) {
      return -d / core.maxHistgram * divRadius;
    },
    "x" : function(d, i) {
      return i / core.histgram.length * divRadius;
    },
    "fill" : "black"
  });

  d3.select("#min").text(core.minValue);
  d3.select("#max").attr("x", divRadius).text(core.maxValue);

  d3.select("#main").selectAll("g.area").data(core.data).enter().append("g").attr({
    "class" : "area"
  });

  d3.selectAll("g.area").each(function(d, i) {
    d3.select(this).selectAll("path.cell").data(d.data).enter().append("path").attr({
      "class" : "cell",
      "d" : arc,
      "fill" : "black"
    }).append("title").text(function(d, i) {
      return d ? JSON.stringify(d, null, "  ") : "none";
    });
  });

  d3.selectAll("path.cell").on("click", function() {
    var a = d3.select(this).datum();
    var url = "http://ja.dbpedia.org/sparql?query=";
    url += encodeURIComponent(tmpl.replace("$1", a.area).replace("$2", a.year));
    d3.xhr(url).header("Accept", "application/sparql-results+json").get(function(e, x, t) {
      var json = JSON.parse(x.responseText);
      d3.selectAll("li").remove();
      json.results.bindings.sort(function(a, b) {
        return b.s.value.length - a.s.value.length;
      }).forEach(function(d) {
        var t = d.s.value.replace("http://ja.dbpedia.org/resource/", "");
        d3.select("#list").append("li").append("a").attr({
          "href" : "https://ja.wikipedia.org/wiki/" + t,
          "target" : "_blank"
        }).text(t);
      });
    });

  });

  d3.select("#main").selectAll("text.area").data(core.areas).enter().append("text").attr({
    "class" : "area",
    "x" : outerRadius + 5,
    "y" : 0,
    "transform" : function(d, i) {
      var rotate = (unitAngle * (i + 0.5) + startAngle);
      return "rotate(" + rotate + ")";
    }
  }).text(function(d, i) {
    return d.label;
  });

  d3.select("#main").selectAll("text.year").data(core.years).enter().append("text").attr({
    x : -5,
    y : function(d, i) {
      return -(innerRadius + unitRadius * (i + 0.4));
    },
    "text-anchor" : "end",
    "class" : "year"
  }).text(function(d, i) {
    return d;
  });

}