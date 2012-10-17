//requirements
var d3 = require("d3");
var fs = require("fs");

//config
var data_path = 'data/tube_stations.csv';
var scale_factor = 10000; //a scaling factor to hopefully increase the accuracy of the resulting polygons
// Greater London polygon for clipping. Points defined clockwise http://www.openstreetmap.org/?minlon=-0.489&minlat=51.28&maxlon=0.236&maxlat=51.686&box=yes
var london_bounds = d3.geom.polygon([[-0.489*scale_factor, 51.686*scale_factor],[0.236*scale_factor,51.686*scale_factor],[0.236*scale_factor,51.686*scale_factor],[-0.489*scale_factor,51.28*scale_factor]]);
// clipping docs are missing so usage: var clipped_polygon = london_bounds.clip(unclipped_polygon) (I think);

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
	//console.log(output);
}

/*
	{ 
		"type": "Polygon",
		"station_name":"Kilburn",
		"station_point":[long,lat]
		"lines":["jubilee","hammersmith & city"],
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

function create_output(original_data, polygons,adjust_for_tilemill){
	var geoJSON = { 	
			"type": "FeatureCollection",
			"features": [
    			//...
      		]
      	};
	for(var i = 0; i<original_data.length; i++){
		var lines_array = original_data[i]["Lines"].split(',');
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
				"lines": lines_array
			}
		};
		geoJSON.features.push(station);
	}
	return geoJSON;
}
