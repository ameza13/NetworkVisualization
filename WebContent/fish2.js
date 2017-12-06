
var w = 1600,
    h = 800,
    /**
     * d3.scale: provides a new instance of the scale
     * category20: is a scale of colors
     *  0   #1f77b4
		1   #aec7e8
		2   #ff7f0e
		3   #ffbb78
		4   #2ca02c
		5   #98df8a
		6   #d62728
		7   #ff9896
		8   #9467bd
		9   #c5b0d5
		10  #8c564b
		11  #c49c94
		12  #e377c2
		13  #f7b6d2
		14  #7f7f7f
		15  #c7c7c7
		16  #bcbd22
		17  #dbdb8d
		18  #17becf
		19  #9edae5
     */
    fill = d3.scale.category20()
    trans=[0,0]
    scale=1;

var fisheye = d3.fisheye()
    .radius(100)
    .power(3);

/* g: is a container used to group other SVG elements.
 * Transformations applied to the <g> element are performed on all of its child elements.*/

/* d3.selcect: select an element in the page, in this case the <div> con id=chart */
var vis = d3.select("#chart")
  .append("svg:svg") //agrega un svg a div element called chart
    .attr("width", w)
    .attr("height", h)
    .attr("pointer-events", "all")
  .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", redraw))
  .append('svg:g');

//Notation: the notation above is the same that:
/*
 * var vis = d3.select("#chart");
 * append("svg:svg");
 * attr("width", w);
 * etc...
 *
 * If a value is passed as parameter, it is a setter function
 * If none value is passed as parameter, it is a getter function
 * */

vis.append('svg:rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'white');  //fill is a scale of colors

//@elahe: contains all the uploded xml files info
var xmlDoc = [];
//@elahe: contains all the permissions based on their ID
var permissionResults = [];

//Function called when zoom change
function redraw() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");

  /*TEST*/
  console.log("redraw=" + "transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}


//@elahe: this function's interface is changed to pass nodes and links data in splitted json objetcs
var draw = function(nodesResults, linkResults) {

  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .nodes(nodesResults)
      .links(linkResults)
      .size([w, h]);
      //.start();

  //@ameza: to configure links
  var link = vis.selectAll("line.link") //CSS class
      .data(linkResults)
    .enter().append("svg:line") //Add link to the svg container
      .attr("class", "link") //CSS class
      //.style("stroke-width", function(d) { return Math.sqrt(d.value); }) //OLD
      //.style("stroke-width", 1)
      //Declare link's attributes: source and target coordinates
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      //Assign events to the link
    .on("click", clickLink)
    .on ("mouseover",moverLink) //TO DO: Not working right
    .on ("mouseout",moutLink)
    ;

  //@ameza: to configure nodes
  var node = vis.selectAll("circle.node") //CSS class
      .data(nodesResults)
    .enter().append("svg:circle") //Add node to the svg container
      .attr("class", "node") //CSS class
      //Declare node's attributes
      .attr("cx", function(d) { return d.x; }) //center position
      .attr("cy", function(d) { return d.y; })
      .attr("r", 5) //radious length
      //.attr("component", function(d) { return d.Component;}) //To delete
      .style("fill", function(d) { return fill(d.Package); }) //Assign the color to each node based on the app name
    //Assign events to the node
	.on("click", clickNode)
    .on ("mouseover",moverNode)
    .on ("mouseout",moutNode)
    ;
//      .call(force.drag);

    //var n = data.nodes.length;//OLD
    var n = nodesResults.length; //@ameza: correction to make the other functionalities work correctly.
    console.log("n="+n);

  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);

    force.start();
    for (var i = n; i > 0; --i) force.tick();
    force.stop();

    //@ameza:on click event for link
    var displayArea = document.getElementById('displayArea');
	function clickLink(d) {
		//TO DO: Display it on the sidebar
		console.log("Communication/Permission: "+d.type);
		displayArea.innerText = "click on communication/permission of type "+d.type;
	}
    //@ameza:on click event for nodes
	function clickNode(d) {debugger;
    //@elahe: serach through xml files and find node's info based on package name
    var xml = xmlDoc.filter(function(obj) {
      return (obj.getElementsByTagName("packageName")[0].childNodes[0].nodeValue === d.Package);
    });
    //@elahe: search through all the permissions and find info based on ID
    //@elahe: permissions are parsed from permission csv files in function findPermissions
    var permission = [];
    for (var i = 0; i < permissionResults.length; i++) {
      if (permissionResults[i].id === Number(d.ID)) {
        permission.push(permissionResults[i].fileName + ": " + permissionResults[i].permissions);
      }
    }

    var list = document.getElementById('sidebarDisplayArea');
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode(permission));
    list.appendChild(entry);


    //@show the info in sidebar: should be better presented!
		// displayArea.innerText = "<pre> Package Name: " + xml[0].getElementsByTagName("packageName")[0].childNodes[0].nodeValue
    //                         + "\nApp ID: " + xml[0].getElementsByTagName("appId")[0].childNodes[0].nodeValue + " "
    //                         + permission
    //                         + "</pre>";
	}

	//@ameza: on mouse over event this method paints the pop-up next to the node manipulating the CSS of the div object
    function moverNode(d) {
        $("#pop-up").fadeOut(100,function () {
        	    $("#pop-up-title").html("Package: "+d.Package);
        	    $("#pop-up-subtitle").html("Component: "+d.Component);
            /*$("#pop-img").html("23");
            $("#pop-desc").html("M+T: text text test"); */ //TO DO: Method to get the component info from the app XML file

            // Popup position
        	    console.log(scale);
        	    console.log("trans[0]="+trans[0]);
        	    console.log("d.x="+d.x);
        	    console.log("trans[1]="+trans[1]);
        	    console.log("d.y="+d.y);

            var popLeft = (d.x*scale)+trans[0]+20;//lE.cL[0] + 20;
            var popTop = (d.y*scale)+trans[1]+20;//lE.cL[1] + 70;
            $("#pop-up").css({"left":popLeft,"top":popTop});
            $("#pop-up").fadeIn(100);
        });

    }
    //@ameza: on mouse over event this method paints the pop-up next to the link manipulating the CSS of the div object
    function moverLink(d) {debugger;
        $("#pop-up-link").fadeOut(100,function () {
        	    var cType = "Permission: ";
        	    if ((d.type =="Implicit") || (d.type=="Explicit")) {
        	    		cType = "Communication: ";
        	    }
              //@elahe: should show the source and target
        	    $("#pop-up-link-type").html(cType+d.type);
              var popLeft = (d.source.x); //TO DO: Improve to display pop-up next to the line
              var popTop = (d.source.y);
              $("#pop-up-link").css({"left":popLeft,"top":popTop});
              $("#pop-up-link").fadeIn(100);
        });

    }
    //@ameza: on mouseout the pop-up disappears
    //@elahe: sometimes it does not
    function moutNode(d) {
        $("#pop-up").fadeOut(50);
        d3.select(this).attr("fill","url(#ten1)");
    }
    //@ameza: on mouseout the pop-up disappears
    function moutLink(d) {
        $("#pop-up-link").fadeOut(50);
        d3.select(this).attr("fill","url(#ten1)");
    }
   //This on mousemove event is for the vis object. It applies the fisheye effect
   vis.on("mousemove", function() {

       fisheye.center(d3.mouse(this));
       //To get data from the node us "d"
       node
           .each(function(d) { d.display = fisheye(d); })
           .attr("cx", function(d) { return d.display.x; }) //center x coordinate does not change
           .attr("cy", function(d) { return d.display.y; }) //center y coordinate does not change
           .attr("r", function(d) { return d.display.z * 4.5; }); //circle radious does change, thus the point size change

       link
           .attr("x1", function(d) { return d.source.display.x; }) //start point x coordinate does not change
           .attr("y1", function(d) { return d.source.display.y; }) //start point y coordinate does not change
           .attr("x2", function(d) { return d.target.display.x; }) //end point x coordinate does not change
           .attr("y2", function(d) { return d.target.display.y; });//end point y coordinate does not change
    });
};

//@elahe: find the nodes from csv info
function findNodes(object) {
  var file = object.files;
  var lines=file.split("\n");
  var nodes = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){
    var obj = {};
    var currentline=lines[i].split(",");

    for(var j=0;j<3;j++){ //@elahe:only need the first 3: package, component, ID
      obj[headers[j]] = currentline[j];
    }

    nodes.push(obj);
  }
  return nodes;
}

//@elahe: find the links from csv
function findLinks(files) {
  var links = [];
  var linkResults = [];
  //extract all the links first
  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var lines=file.files.split("\n");
      var headers=lines[0].split(",");
      for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=2;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
        }
        obj["name"] = file.fileName;
        links.push(obj);
      }

    })(files[i]);
  }
  //selects the ones with value 1
  for (var i=0 ; i < links.length ; i++) {
    for (var j=0 ; j < links.length ; j++) {
      if (links[i][j] === "1") {
          linkResults.push(
            {
              source: Number(links[i].ID),
              target:j,
              type: (links[i].name.includes("implicit") ? "Implicit" : "Explicit") //@elahe: passes the type of communication
            }
          );
      }
    }
  }
    return linkResults;
}

//@elahe: gets the permission from csv files: granted, usage, enforcement
function findPermissions(files) {
  var links = [];

  //extract all the links first
  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var lines=file.files.split("\n");
      var headers=lines[0].split(",");
      for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=2;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
        }
        obj["name"] = file.fileName;
        links.push(obj);
      }

    })(files[i]);
  }

  //selects the ones with value 1
  for (var i=0 ; i < links.length ; i++) {
    for(key in links[i]) {
      if(key !=="ID" && links[i][key] === "1") {
        permissionResults.push(
        {
          id: Number(links[i].ID),
          fileName: (links[i].name.includes("granted") ? "Granted" : (links[i].name.includes("usage") ? "Usage" : "Enforcement")),
          permissions:key
        });
      }
    }
  }
}

//@elahe: find the type of files and act upon them
function selectFiles(files) {
  //@elahe:csv files
  var csvs = files.filter(function(obj) {
    return (obj.fileName.includes("csv"));
  });
  //@elahe: selecting the communication files
  var communications = csvs.filter(function(obj) {
    return (obj.fileName.includes("implicit") || obj.fileName.includes("explicit"));
  });
  if(communications.length !== 0) {
    var nodeResults = findNodes(communications[0]);
    var linkResults = findLinks(communications);
    draw(nodeResults, linkResults);
  }

  //@elahe: selecting the permission files
  var permissions = csvs.filter(function(obj) {
    return (obj.fileName.includes("permission"));
  });
  if(permissions.length !== 0) {
    findPermissions(permissions);
  }

//@elahe: xml files
  var xmls = files.filter(function(obj) {
    return (obj.fileType.includes("xml"));
  });

  for(var i = 0; i < xmls.length; i++) {
    var parser = new DOMParser();
    xmlDoc.push(parser.parseFromString(xmls[i].files,"text/xml"));
  }

}

//@elahe: function to convert csv to json file and parse it data for nodes and links
var fileInput = document.getElementById('fileInput'); //@ameza: Line added to make it work
fileInput.addEventListener('change', function(e) {
  var files = fileInput.files;
  var textType = /text.*/;
  var csv=[];

  for (var i = 0; i < files.length; i++) { //@elahe: for multiple files - this loop helps receving the files after it is loaded and check their type
      (function(file) {
        if (file.type.match(textType)) {
          var reader = new FileReader();
          reader.onload = function(e) {
              // get file content
              csv.push(
                {
                  fileName:file.name,
                  fileType: file.type,
                  files: reader.result
                });
          }
          reader.readAsText(file);
        } else {
          alert("File not supported!")
        }
      })(files[i]);
  }

  setTimeout(function () {
    selectFiles(csv);
  }, 10);


});
