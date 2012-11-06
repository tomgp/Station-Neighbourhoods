//go through a geo json feature set and create a new bunch of feature sets based on a propery value
fs = require ("fs");
fillGenerator = require('./fill_generator');
lineData = require('./line_data');

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
	var style_sheet = "";
//single line slices
	for (var i =0; i<json["features"].length; i++){
		var station = json["features"][i];
		for(var j=0; j<station["properties"]["lines"].length; j++){
			var line = station["properties"]["lines"][j];
			if(!slices[line]){
				slices[line] = {
    				"type": "FeatureCollection",
    				"features": []
				}
				style_sheet += createStyle(line);
			}
			slices[line]["features"].push(station);
		}
	}
	//multi line slices (always sort the line arrays so we don't get different keys)
	for (var i =0; i<json["features"].length; i++){
		var station = json["features"][i];
		station["properties"]["lines"].sort();

		var line_group = station["properties"]["lines"].join('_');
		if(!slices[line_group]){
			createFill(line_group);
			style_sheet += createStyle(line_group);
			slices[line_group] = {
				"type": "FeatureCollection",
				"features": []
			}
		}
		slices[line_group]["features"].push(station);
	}
	write_files(slices);
	fs.writeFileSync( "style/tube_line_styles.mss", style_sheet, 'UTF-8');
	console.log("written style/tube_line_styles.mss");
}

function createStyle(line_string){
	console.log(line_string);
	var style = "\n#" + toIDName(line_string) + '{';
	if(line_string.indexOf("_") != -1){
		style += "\n\tpolygon-pattern-file:url('img/" + line_string + ".png');";
	}else if(lineData[line_string]){
		style += "\n\tpolygon-fill:" + lineData[line_string]['fill'] + ";";
		style += "\n\tline-color:" + lineData[line_string]['stroke'] + ";";
	}else{
	}
	style += '\n}';
	return style;
}

function toIDName(s){
	return s.replace(/ /g,"").toLowerCase();

}

function createFill(line_string){
	var lines = line_string.split('_');
	var colours = lines.map(function(line){
		var colour = {fill:'#FFFFFF',stroke:'#000000',faded:'#666666'};
		if(lineData[line]){
			colour = lineData[line]
		}else{
			console.log('no colour found for ' + line);
		}
		return colour;
	});
	fillGenerator.drawFill(colours, 20, 'style/img/'+line_string+'.png');
}


function write_files(contents){
	console.log('--- WRITING GEOJSON ---');
	for(var line in contents){
		fs.writeFileSync( out_path + line + ".geojson", JSON.stringify(contents[line]), 'UTF-8');
		console.log("written " +  out_path + line + ".geojson");
	}
}