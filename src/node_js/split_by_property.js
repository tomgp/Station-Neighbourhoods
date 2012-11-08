//go through a geo json feature set and create a new bunch of feature sets based on a propery value
fs = require ("fs");
fillGenerator = require('./fill_generator');
lineData = require('./line_data');


var out_path = '';

var geoJSON_splits = {};

split_data('data/stations.geojson', 'lines', 'data/split/');

var faded = true;

function split_data(in_path, property_name, output){
	if(faded){
		lineData = lineData.map(function(l){
			console.log(l);
			lineData[l].fill = lineData[l].faded;
		})
	}
	console.log(lineData);
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
			var station_name = station["properties"]["name"];
			if(!slices[line]){
				slices[line] = {
    				"type": "FeatureCollection",
    				"features": []
				}
				style_sheet += createStyle(line,station_name);
			}
			slices[line]["features"].push(station);
		}
	}
	//multi line slices (always sort the line arrays so we don't get different keys)
	for (var i =0; i<json["features"].length; i++){
		var station = json["features"][i];
		station["properties"]["lines"].sort();

		var line_group = station["properties"]["lines"].join('_');
		var station_name = station["properties"]["name"];
		if(!slices[line_group]){
			createFill(line_group);
			style_sheet += createStyle(line_group,station_name);
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

function createStyle(line_string, station){
	console.log(line_string);
	var style = '';
	if(line_string!=''){
		style = "\n#station_polygons[name = " + station + "]{";
		if(line_string.indexOf("_") != -1){
			style += "\n\tpolygon-pattern-file:url('img/" + line_string + ".png');";
			style += "\n\tpolygon-pattern-clip:false;"
			//style += "\n\tpolygon-pattern-alignment:global;";
		}else if(lineData[line_string]){
			style += "\n\tpolygon-fill:" + lineData[line_string]['fill'] + ";";
			style += "\n\tline-color:" + lineData[line_string]['stroke'] + ";";
		}else{
		}
		style += '\n}';
	}
	return style;
}

function toIDName(s){
	var id_name = s.replace(/ /g,"").toLowerCase();
	var bits = id_name.split('_');
	if(bits.length>1){ //multi line classes are the first 3 letters of each linejoined by an underscore
		var short_bits = bits.map(function(line){
			return line.substr(0,3); //todo_ substring of the first 3 chars
		});
		id_name = short_bits.join('_');
	}
	return id_name
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