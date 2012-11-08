//create style
fs = require ("fs");
fillGenerator = require('./fill_generator');
lineData = require('./line_data');


var StyleMaker = {};
module.exports = StyleMaker;

StyleMaker.makeStyle = function (geoJSON, outdir){
	console.log(outdir);
	//for each feature create a style object for its line(s) if none exists
	var styles = {};
	for(f in geoJSON.features){
		var properties = geoJSON.features[f].properties;
		if(!styles[properties.lines_id]){
			var style = "\n#station_polygon[lines_id = '" + properties.lines_id + "']{";
			if(properties.lines.length>1){
				var colours = properties.lines.map(function(line){
					var colour = {fill:'#FFFFFF',stroke:'#000000',faded:'#666666'};
					if(lineData[line]){
						colour = lineData[line]
					}else{
						console.log('no colour found for ' + line);
					}
					return colour;
				});
				var style_image = 'img/' + properties.lines_id + '.png';
				var slim_style_image = 'img/slim_' + properties.lines_id + '.png';
				fillGenerator.drawFill(colours, 20, outdir +'/'+ style_image);
				fillGenerator.drawFill(colours, 10, outdir +'/'+ slim_style_image);
				style += "\n\tpolygon-pattern-file:url('" + style_image + "');";
				style += "\n\tline-color:" + colours[0].stroke + ";";
				style += "\n\t[zoom < 13]{";
				style += "\n\t\tpolygon-pattern-file:url('" + slim_style_image + "');";

				style += "\n\t}";
			}else{
				var line_name = properties.lines[0];
				style += "\n\tpolygon-fill:" + lineData[line_name]['fill'] + ";";
				style += "\n\tline-color:" + lineData[line_name]['stroke'] + ";";
			}
			style += "\n\tpolygon-opacity:0.5;";
			style += "\n}";
			styles[properties.lines_id] = style;
		}
	}
	var style_string = '';
	for (var style in styles){
		style_string += styles[style];
	}
	fs.writeFile(outdir + "/stations.mss", style_string, 'UTF-8', function(){console.log("written stations.mss")});
}