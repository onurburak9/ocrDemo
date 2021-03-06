$(document).ready(function() {

  //Input button listener
  $('input[type="file"]').on('change', function(e) {
    if ($(this).prop('files') && $(this).prop('files').length > 0) {
      files = $(this).prop('files');

      for (var i = 0; i < files.length; i++) {
        var img = files[i];
        //Get URL of the image synchronously and upload
        reader(img).then(function(reader) {
          uploadPhoto(reader.result, img.name);
        }).catch(function(error) {
          console.error("Error reading document: ", error);
        })
      }
    } else {
      console.log("No files selected.");
    }
  })

  function uploadPhoto(src, filename) {
    filename = "static/images/" + filename;
    console.log(filename);
    return $.ajax({
      url: "/ocr",
      method: "POST",
      data: {
        name: filename
      }
    }).done(function(response) {
      var data = {}

      for (var i = 0; i < response.data.length; i++) {
        data[i] = {
          description: response.data[i].description,
          boundingPoly: response.data[i].boundingPoly
        };
      }
      appendHTML(data);
      setUpMenu(data);
      img = $("<figure/>").addClass("image").append($("<img/>").attr("src", src));
      $(".image-cont").append(img)
    });
  }

  function appendHTML(data) {
    jsonStr = JSON.stringify(data, undefined, 4);

    regeStr = syntaxHighlight(jsonStr);
    $("pre").append(regeStr);
  }

  function setUpMenu(data) {
    var x, y, maxX, maxY;
    x = y = maxX = maxY = 0;
    console.log(maxX, maxY);
    var vertices = data["0"].boundingPoly.vertices
    for (var i = 0; i < vertices.length; i++) {
      x = vertices[i]["x"];
      y = vertices[i]["y"];
      if (x > maxX)
        maxX = x;
      if (y > maxY)
        maxY = y
    }

    console.log("Max X : ", maxX);
    console.log("Max Y : ", maxY);
    console.log();

    var canvas = document.getElementById("canvas");
    canvas.height = maxY;
    canvas.width = maxX;
    var ctx = canvas.getContext("2d");
    for (var i = 1; i < Object.keys(data).length; i++) {
      var txt = data[i].description;
      var verticeArray = data[i].boundingPoly.vertices;
      var x = data[i].boundingPoly.vertices[0].x
      var y = data[i].boundingPoly.vertices[0].y
      var max = 0;
      for (var z = 0; z < verticeArray.length; z++) {
        xTemp = verticeArray[z]["x"];
        if (xTemp > max)
          max = xTemp;
      }
      width = max - x ;
      ctx.font ="11px Arial"
      ctx.fillStyle ="black"
      console.log(txt,x,y,width);
      ctx.fillText(txt,x,y,width);

    }

  }

  function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
      var cls = 'numbers';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }
  //Read and extract URL function
  function reader(file, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      let reader = new FileReader();

      reader.onloadend = function() {
        resolve(reader);
      };
      reader.onerror = reject;

      if (options.accept && !new RegExp(options.accept).test(file.type)) {
        reject({
          code: 1,
          msg: 'wrong file type'
        });
      }

      if (!file.type || /^text\//i.test(file.type)) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

});
