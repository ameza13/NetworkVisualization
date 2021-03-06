
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

//@ameza: To define malicious apps
function defineComponent(MaliciousComponent){
	if(MaliciousComponent){
		return "#A52A2A"; //Red: is a malicious component
	}else{
		return "#8FBC8F";} //Green: is a vulnerable component
}

//@ameza: definition of zoom scale
var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on("zoom", redraw);
/* g: is a container used to group other SVG elements.
 * Transformations applied to the <g> element are performed on all of its child elements.*/

/* d3.selcect: select an element in the page, in this case the <div> con id=chart */
var vis = d3.select("#chart")
  .append("svg:svg") //agrega un svg a div element called chart
    .attr("width", w)
    .attr("height", h)
    .attr("pointer-events", "all")
  .append('svg:g')
    //.call(d3.behavior.zoom().on("zoom", redraw)) //OLD
    .call(zoom)
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


// elahe: Menu Toggle Script
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//elahe: contains mal apps info
var malApps = [];
//elahe: contains all the uploded xml files info
var xmlDoc = [];
//elahe: contains all the permissions based on their ID
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


//elahe: this function's interface is changed to pass nodes and links data in splitted json objetcs
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
  //  .on ("mouseover",moverLink) //@ameza: mouse over changed for onclick
  //  .on ("mouseout",moutLink)
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
      .style("stroke", function(d){ return defineComponent(d.malApp)})
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

	function clickLink(d) {
    //elahe: get the ul from html, first clear it and then show the new info
    var malList = document.getElementById('sidebarDisplayAreaMal');
    malList.innerHTML = "";
    var list = document.getElementById('sidebarDisplayArea');
    list.innerHTML = "";
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode("Communication: " + d.type));
    list.appendChild(entry);

    entry = document.createElement('li');
    entry.appendChild(document.createTextNode("Source: " + d.source.Package));
    list.appendChild(entry);

    entry = document.createElement('li');
    entry.appendChild(document.createTextNode("Target: " + d.target.Package));
    list.appendChild(entry);

	}
    //@ameza:on click event for nodes
	function clickNode(d) {
    //elahe: get the ul from html, first clear it and then show the new info
    var malList = document.getElementById('sidebarDisplayAreaMal');
    malList.innerHTML = "";
    var list = document.getElementById('sidebarDisplayArea');
    list.innerHTML = "";

    var entry = document.createElement('h5');
    entry.style.cssText = 'margin-left: -25px;';
    entry.appendChild(document.createTextNode("Component Information"));
    list.appendChild(entry);

    entry = document.createElement('li');
    entry.appendChild(document.createTextNode("ID: " + d.ID));
    list.appendChild(entry);
    entry = document.createElement('li');
    entry.appendChild(document.createTextNode("Package: " + d.Package));
    list.appendChild(entry);
    entry = document.createElement('li');
    entry.appendChild(document.createTextNode("Component: " + d.Component));
    list.appendChild(entry);

    //elahe: search through all the permissions and find info based on ID
    //elahe: permissions are parsed from permission csv files in function findPermissions
    for (var i = 0; i < permissionResults.length; i++) {
      if (permissionResults[i].id === Number(d.ID)) {
        entry = document.createElement('li');
        entry.appendChild(document.createTextNode(permissionResults[i].fileName + ": " + permissionResults[i].permissions));
        list.appendChild(entry);
      }
    }

    //elahe: serach through xml files and find node's info based on package name
    var xml = xmlDoc.filter(function(obj) {
      return (obj.getElementsByTagName("packageName")[0].childNodes[0].nodeValue === d.Package);
    });

    // elahe: following are the codes to parse the xml files and show their available contents dynamically by adding ul and li
    var components = xml[0].getElementsByTagName("component");
    for(var i = 0; i < components.length; i++) {
      if(components[i].getElementsByTagName("dsmIdx")[0].childNodes[0].nodeValue === d.ID) {
        entry = document.createElement('li');
        entry.appendChild(document.createTextNode("Type: " + components[i].getElementsByTagName("type")[0].childNodes[0].nodeValue));
        list.appendChild(entry);

        entry = document.createElement('li');
        entry.appendChild(document.createTextNode("Exported: " + components[i].getElementsByTagName("exported")[0].childNodes[0].nodeValue));
        list.appendChild(entry);

        if(components[i].getElementsByTagName("compRequiredPermissions")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
          entry = document.createElement('li');
          entry.appendChild(document.createTextNode("Component required permission: " + components[i].getElementsByTagName("compRequiredPermissions")[0].childNodes[0].nodeValue));
          list.appendChild(entry);
        }

        if(components[i].getElementsByTagName("compActuallyUsedPermissions")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
          entry = document.createElement('li');
          entry.appendChild(document.createTextNode("Component actually used permission: " + components[i].getElementsByTagName("compActuallyUsedPermissions")[0].childNodes[0].nodeValue));
          list.appendChild(entry);
        }

        if(components[i].getElementsByTagName("intentFilters")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
          entry = document.createElement('li');
          entry.appendChild(document.createTextNode("Intent Filter:"));
          list.appendChild(entry);
          var ul = document.createElement('ul');

          var intentFilters = components[i].getElementsByTagName("intentFilters");
          for(var j = 0; j < intentFilters.length; j++) {
            entry = ul.appendChild(document.createElement('li'));
            entry.appendChild(document.createTextNode("ID: " + intentFilters[j].getElementsByTagName("ifID")[0].childNodes[0].nodeValue));
            list.appendChild(ul);

            if(intentFilters[j].getElementsByTagName("actions")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
              var actions = intentFilters[j].getElementsByTagName("action");

              for(var k = 0; k < actions.length; k++) {
                entry = ul.appendChild(document.createElement('li'));
                entry.appendChild(document.createTextNode("Action " + (k+1) + ": " + actions[k].textContent));
                list.appendChild(ul);
              }
            } //Actions

            if(intentFilters[j].getElementsByTagName("categories")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
              var categories = intentFilters[j].getElementsByTagName("category");

              for(var m = 0; m < categories.length; m++) {
                entry = ul.appendChild(document.createElement('li'));
                entry.appendChild(document.createTextNode("Category " + (m+1) + ": " + categories[m].textContent));
                list.appendChild(ul);
              }
            } //categories

            if(intentFilters[j].getElementsByTagName("data")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
              entry = ul.appendChild(document.createElement('li'));
              entry.appendChild(document.createTextNode("Data: " + intentFilters[j].getElementsByTagName("data")[0].childNodes[0].nodeValue));
              list.appendChild(ul);
            }

            if(intentFilters[j].getElementsByTagName("dataPath")[0].childNodes.length !== 0) { //elahe: most of the time they are empty
              entry = ul.appendChild(document.createElement('li'));
              entry.appendChild(document.createTextNode("Data path: " + intentFilters[j].getElementsByTagName("dataPath")[0].childNodes[0].nodeValue));
              list.appendChild(ul);
            }

          } //intentFilters

      } //intentFilters

      }
    }

    // elahe: if the App is malicious, show its info
    for (var k = 0; k < malApps.length; k++) {
      if(d.ID === malApps[k].malID) {
        var malEntry = document.createElement('h5');
        malEntry.style.cssText = 'margin-left: -25px;margin-top: 40px;';
        malEntry.appendChild(document.createTextNode("Malicious Component"));
        malList.appendChild(malEntry);

        malEntry = document.createElement('li');
        malEntry.appendChild(document.createTextNode("Type: " + malApps[k].type));
        malList.appendChild(malEntry);

        var malEntry = document.createElement('li');
        malEntry.appendChild(document.createTextNode("Vulnerable Component: " + malApps[k].vulComp));
        malList.appendChild(malEntry);

        malEntry = document.createElement('li');
        malEntry.appendChild(document.createTextNode("Resource: " + malApps[k].resource));
        malList.appendChild(malEntry);

      }
    }

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
    // function moverLink(d) {
    //     $("#pop-up-link").fadeOut(100,function () {
    //     	    var cType = "Permission: ";
    //     	    if ((d.type =="Implicit") || (d.type=="Explicit")) {
    //     	    		cType = "Communication: ";
    //     	    }
    //           //elahe: should show the source and target
    //     	    $("#pop-up-link-type").html(cType+d.type);
    //           var popLeft = (d.source.x); //TO DO: Improve to display pop-up next to the line
    //           var popTop = (d.source.y);
    //           $("#pop-up-link").css({"left":popLeft,"top":popTop});
    //           $("#pop-up-link").fadeIn(100);
    //     });
    //
    // }
    //@ameza: on mouseout the pop-up disappears
    //elahe: sometimes it does not
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

//elahe: find the nodes from csv info
function findNodes(object) { //add parameter with the xml file
  var file = object.files;
  var lines=file.split("\n");
  var nodes = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){
    var obj = {};
    var currentline=lines[i].split(",");

    for(var j=0;j<3;j++){ //elahe:only need the first 3: package, component, ID
      obj[headers[j]] = currentline[j];
    }
    obj["malApp"] = false;

    for(var j=0;j<malApps.length;j++) { //elahe: checks if the the app is malicious
      if(obj.ID === malApps[j].malID) {
        obj["malApp"] = true;
      }
    }
    nodes.push(obj);
  }

  return nodes;
}

//elahe: find the links from csv
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
              type: (links[i].name.includes("implicit") ? "Implicit" : "Explicit") //elahe: passes the type of communication
            }
          );
      }
    }
  }
    return linkResults;
}

//elahe: gets the permission from csv files: granted, usage, enforcement
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

//elahe: this function parses the analysis result xml file and returns the mal apps and their related info
function parseXml(analysisResult) {
  var privileges = analysisResult.getElementsByTagName("privilegeEscalationInstance");
  for(var i = 0; i < privileges.length; i++) {
    malApps.push({
      malID: privileges[i].getElementsByTagName("malCompDsmIdx")[0].childNodes[0].nodeValue,
      vulID: privileges[i].getElementsByTagName("vulCompDsmIdx")[0].childNodes[0].nodeValue,
      vulComp: privileges[i].getElementsByTagName("vulComp")[0].childNodes[0].nodeValue,
      resource: privileges[i].getElementsByTagName("resource")[0].childNodes[0].nodeValue,
      type: "Privilege Escalation Instance"
    });
  }
  var spoofing = analysisResult.getElementsByTagName("intentSpoofingInstance");
  for(var j = 0; j < spoofing.length; j++) {
    malApps.push({
      malID: spoofing[j].getElementsByTagName("malCompDsmIdx")[0].childNodes[0].nodeValue,
      vulID: spoofing[j].getElementsByTagName("vulCompDsmIdx")[0].childNodes[0].nodeValue,
      vulComp: spoofing[j].getElementsByTagName("vulComp")[0].childNodes[0].nodeValue,
      resource: "Does not apply",
      type: "Intent Spoofing Instance"
    });
  }
  var receipt = analysisResult.getElementsByTagName("unauthorizedIntentReceiptInstance");
  for(var k = 0; k < receipt.length; k++) {
    malApps.push({
      malID: receipt[k].getElementsByTagName("malCompDsmIdx")[0].childNodes[0].nodeValue,
      vulID: receipt[k].getElementsByTagName("vulCompDsmIdx")[0].childNodes[0].nodeValue,
      vulComp: receipt[k].getElementsByTagName("vulComp")[0].childNodes[0].nodeValue,
      resource: "Does not apply",
      type: "Unauthorized Intent Receipt Instance"
    });
  }
}

//elahe: find the type of files and act upon them
function selectFiles(files) {

    //elahe: xml files
    var xmls = files.filter(function(obj) {
      return (obj.fileType.includes("xml"));
    });
    for(var i = 0; i < xmls.length; i++) {
      var parser = new DOMParser();
      if(xmls[i].fileName.includes("analysisResult")) { //elahe:get the analysis result
        var analysisResult = parser.parseFromString(xmls[i].files,"text/xml")
      }
      else {
        xmlDoc.push(parser.parseFromString(xmls[i].files,"text/xml"));
      }
    }
    parseXml(analysisResult);

    //elahe:csv files
    var csvs = files.filter(function(obj) {
      return (obj.fileName.includes("csv"));
    });
    //elahe: selecting the communication files
    var communications = csvs.filter(function(obj) {
      return (obj.fileName.includes("implicit") || obj.fileName.includes("explicit"));
    });
    if(communications.length !== 0) {
      var nodeResults = findNodes(communications[0]);
      var linkResults = findLinks(communications);
      draw(nodeResults, linkResults);
    }

    //elahe: selecting the permission files
    var permissions = csvs.filter(function(obj) {
      return (obj.fileName.includes("permission"));
    });
    if(permissions.length !== 0) {
      findPermissions(permissions);
    }

}


//elahe: function to convert csv to json file and parse it data for nodes and links
var fileInput = document.getElementById('fileInput'); //@ameza: Line added to make it work
fileInput.addEventListener('change', function(e) {
  var files = fileInput.files;
  var csv=[];


  for (var i = 0; i < files.length; i++) { //elahe: for multiple files - this loop helps receving the files after it is loaded and check their type
      (function(file) {
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
      })(files[i]);
  }

  setTimeout(function () {
    selectFiles(csv);
  }, 1000);


});
