var Canvas = require('canvas');
var fs = require('fs');

function drawFill(colours, strip_width, file){
	//create a canavs based on how many stripes we need
	canvas_dim = strip_width * colours.length
	
	var first = true;
	var canvas = new Canvas(canvas_dim, canvas_dim);
	var ctx = canvas.getContext('2d');
	//draw the first half of the stripes
	for (var i = 0;i < colours.length; i++){
		i = Number(i);
		var points = [
			{x:0, y:(strip_width * i)},
			{x:0, y:strip_width * (i+1)},
			{x:strip_width * (i+1),y:0},
			{x:strip_width * i,y:0}];
		drawShape(ctx, points,  colours[i].fill,  colours[i].stroke);
	}
	for (var i = 0;i < colours.length; i++){
		i = Number(i);
		var points = [
			{x:(strip_width * i), y:canvas_dim},
			{x:strip_width * (i+1), y:canvas_dim},
			{x:canvas_dim, y:strip_width * (i+1)},
			{x:canvas_dim, y:strip_width * i}];
		drawShape(ctx, points,  colours[i].fill,  colours[i].stroke);
	}

	var out = fs.createWriteStream(file);
  	var stream = canvas.createPNGStream();

	stream.on('data', function(chunk){
		console.log('writing chunk');
		out.write(chunk);
	});
}

function drawShape(context, points, fill, stroke){
	console.log("drawing shape with " + points.length + " points");
	console.log(points);
	context.beginPath();
	context.fillStyle = fill;
	context.strokeStyle = stroke;
	//move to the last point
	context.moveTo(points[points.length-1].x, points[points.length-1].y );
	for(var i = 0; i<points.length; i++){
		console.log('line ' + points[i].x +", " + points[i].y);
		context.lineTo(points[i].x, points[i].y);
	}
	context.stroke();
	context.fill();
}

var c = [{fill:'#aaa',stroke:'#aaa'},
		{fill:'#000',stroke:'#000'}];

drawFill(c, 20, "test/tile.png");