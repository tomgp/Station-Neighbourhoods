//go through a geo json feature set and create a new bunch of feature sets based on a propery value
fs = require ("fs");

var out_path = '';

var geoJSON_splits = {};

split_data('data/stations.geojson', 'lines', 'data/split/');

function split_data(in_path, property_name, output){
	out_path = output;
	fs.readFile(in_path, 'UTF-8', got_data);
}

function got_data(err, data){
	var json = JSON.parse(data);
	var slices = {};
//single line slices
	for (var i =0; i<json["features"].length; i++){
		var station = json["features"][i];
		for(var j=0; j<station["properties"]["lines"].length; j++){
			var line = station["properties"]["lines"][j];
			if(!slices[line]){
				console.log('creating ' + line)
				slices[line] = {
    				"type": "FeatureCollection",
    				"features": []
				}
			}
			slices[line]["features"].push(station);
		}
	}
//multi line slices (always sort the line arrays so we don't get different keys)

	write_files(slices);
}

function write_files(contents){
	for(var line in contents){
		fs.writeFileSync( out_path + line + ".geojson", JSON.stringify(contents[line]), 'UTF-8');
		console.log("written " +  out_path + line + ".geojson");
	}
}