//requirements
var d3 = require("d3");
var fs = require("fs");
var styleMaker = require('./create_style');

//user input
if(process.argv[2]){
	var data_path = process.argv[2];
}else{
	data_path = 'data/tube_stations.csv';
}
console.log("working with " + data_path)
console.log("--")

var scale_factor = 10000; //a scaling factor to hopefully increase the accuracy of the resulting polygons
var map_box_project = '/Users/tompearson/Documents/MapBox/project/stations-2';


//GO!
fs.readFile(data_path, 'UTF-8', got_data);

function got_data(err, data){
	if(err){
		console.log(err); 
		return;
	}
	var data_struct = d3.csv.parse(data); 
	var tube_station_vertices = build_vertex_array(data_struct)
	var polygons = d3.geom.voronoi(tube_station_vertices);
	var output = create_output(data_struct, polygons,true);//last argument says adjust for tile mill i.e. add an extra duplicate coord at the end so it renders properly... :(
	fs.writeFile("data/stations.geojson", JSON.stringify(output), 'UTF-8', function(){console.log("written stations.geojson")})
	styleMaker.makeStyle(output, map_box_project)
	//console.log(output);
}

/*
	{ 
		"type": "Polygon",
		"station_name":"Kilburn",
		"station_point":[long,lat]
		"lines":["jubilee","hammersmith & city"],
		"lines_id":"jub_ham",
	  	"coordinates": [[ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]]
 	}
*/

//in d3 a vertex is a simple array of form [x,y]
function build_vertex_array(tube_stations){
	var vertices = tube_stations.map(function(station){
		return [station.Longitude * scale_factor, station.Latitude * scale_factor];
	});
	console.log(vertices);
	return vertices;
}

function removeDuplicates(a){	
	var result = a.filter(function(elem, pos) {
    	return a.indexOf(elem) == pos;
	});
	return result;
}

function createLineID(line_array){
	line_array.sort();
	var short_bits = line_array.map(function(line){
		return line.substr(0, 3); //todo_ substring of the first 3 chars
	});
	id_name = short_bits.join('_').toLowerCase();
	return id_name;
}

function create_output(original_data, polygons,adjust_for_tilemill){
	var geoJSON = { 	
			"type": "FeatureCollection",
			"features": [
    			//...
      		]
      	};
	for(var i = 0; i<original_data.length; i++){
		var lines_array = removeDuplicates(original_data[i]["Lines"].split(','));
		var coords = [[]];
		var last_coord;
		for(var j = 0; j<polygons[i].length; j++){
			var x = Number(polygons[i][j][0])/scale_factor;
			var y = Number(polygons[i][j][1])/scale_factor;
			last_coord = [x , y]
			coords[0][j] = last_coord;
		}
		if(adjust_for_tilemill){ //add a duplicate last coord to keep tile mill happy
			coords[0].push(last_coord);
		}
		var station = { 
			"type": "Feature",
			"geometry":{
					"type": "Polygon", 
					"coordinates": coords
			},
			"properties":{
				"name": original_data[i]["Name"],
				"lines": lines_array,
				"lines_id": createLineID(lines_array)
			}
		};
		geoJSON.features.push(station);
	}
	return geoJSON;
}
