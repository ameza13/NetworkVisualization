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

var jsonNodes = {}; //JSON
var jsonLinks = {}; //JSON

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
	function clickNode(d) {
		console.log("click on node: "+d.ID+ " package: "+d.Package); 
		//TO DO: Method to get the component info from the app XML file. To find XML file use package name
		//TO DO: Method to display the result on the sidebar
		displayArea.innerText = "click on component: "+d.ID+ " from package: "+d.Package;
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
    function moverLink(d) {
        $("#pop-up-link").fadeOut(100,function () {
        	    var cType = "Permission: ";
        	    if ((d.type =="implicit") || (d.type=="explicit")) {
        	    		cType = "Communication: ";
        	    }
        	    
        	    $("#pop-up-link-type").html(cType+d.type); 
            var popLeft = (d.source.x); //TO DO: Improve to display pop-up next to the line
            var popTop = (d.source.y);
            $("#pop-up-link").css({"left":popLeft,"top":popTop});
            $("#pop-up-link").fadeIn(100);
        });

    }
    //@ameza: on mouseout the pop-up disappears
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

//@elahe: function to convert csv to json file and parse it data for nodes and links
var fileInput = document.getElementById('fileInput'); //@ameza: Line added to make it work
fileInput.addEventListener('change', function(e) {
  var file = fileInput.files[0];
  var textType = /text.*/;

  if (file.type.match(textType)) {
    var reader = new FileReader();

    reader.onload = function(e) {
      var csv = reader.result;

      var lines=csv.split("\n");

      var nodes = [];
      var links = [];
      var linkResults = [];

      var headers=lines[0].split(",");

      for(var i=1;i<lines.length;i++){

        var obj = {};
        var obj1 = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<3;j++){ //only need the first 3: package, component, ID
          obj[headers[j]] = currentline[j];
        }

        nodes.push(obj);

        for(var j=3;j<headers.length;j++){
          obj1[headers[j]] = currentline[j];
        }
        links.push(obj1);
      }

      for (var i=0 ; i < links.length ; i++)
      {
        for (var j=0 ; j < links.length ; j++) {
          if (links[i][j] === "1") {
              linkResults.push(
                {
                  source: i,
                  target:j,
                  type: file.name.substring(0,file.name.lastIndexOf(".")) //TO DO: Make function to take works: explicit, implicit, enforcement, granted or usage
                }
              );
          }
        }

      }
      
      /*TEST*/
      console.log(nodes);
      console.log(linkResults);
      
      draw(nodes, linkResults)
    }

    reader.readAsText(file);
  }
});

//@ameza: This is an array of objects structure for testing
/*var data = {"nodes":[{"Component":"LevelUp", "Package": "edu.uci.seal.fungame", "ID":0},	//TO DO: Assign the JSON parsing function to data.
	                 {"Component":"Main", "Package": "edu.uci.seal.fungame", "ID":1},		    
	                 {"Component":"ListMsgs", "Package": "edu.uci.seal.messaging", "ID":2},	
	                 {"Component":"Composer", "Package": "edu.uci.seal.messaging", "ID":3},   
	                 {"Component":"Sender", "Package": "edu.uci.seal.messaging", "ID":4},     
	                 {"Component":"SystemService", "Package": "system", "ID":5}],             
	        "links":[{"source":0,"target":1, "type":"explicit"}]};*/

//draw(data); //OLD
