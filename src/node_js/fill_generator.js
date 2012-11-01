var Canvas = require('canvas');
var fs = require('fs');

function drawFill(colours, strip_width, file){
	//create a canavs based on how many stripes we need
	canavs_dim = strip_width * colours.length
	
	var first = true;
	var canvas = new Canvas(canavs_dim, canavs_dim);
	var ctx = canvas.getContext('2d');
	//draw the first half of the stripes
	for (var i in colours){
		if(first){
			ctx.fillStyle = colours[i];
			ctx.fillRect(0,0,canavs_dim,canavs_dim);
			first = false;
		}else{
			//start width * i down 
		}
	}
	var out = fs.createWriteStream(file);
  	var stream = canvas.createPNGStream();

	stream.on('data', function(chunk){
	  out.write(chunk);
	});
}

drawFill(['#ff0000','#00ff00'], 20, "file_name.png");