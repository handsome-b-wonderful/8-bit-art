// 8 Bit Art
var x, y, width, height;
var r, g, b;
var ias; // image crop
var pre_pixel, pre_context, post_pixel, post_context;
var target_magnify, target_width, target_height;
var xoffset, yoffset;
var pixels_per_x, pixels_per_y;
var sampleSize, imageData, mapColor;
var average_colors;


var palette=[
	{ 
		id : "palette-color-01"
		, name : "red"
		, color : {r:255,g:0,b:0}
	}
	, { 
		id : "palette-color-02"
		, name : "green"
		, color : {r:0,g:255,b:0}
	}
	, {
		id : "palette-color-03"
		, name : "blue"
		, color : {r:0,g:0,b:255}
	}
	, {
		id : "palette-color-04"
		, name : "black"
		, color : {r:0,g:0,b:0}
	}
	, {
		id : "palette-color-05"
		, name : "white"
		, color : {r:255,g:255,b:255}
	}
	, {
		id : "palette-color-06"
		, name : "cyan"
		, color : {r:0,g:255,b:255}
	}
	, {
		id : "palette-color-07"
		, name : "magenta"
		, color : {r:255,g:0,b:255}
	}
	, {
		id : "palette-color-08"
		, name : "yellow"
		, color : {r:255,g:255,b:0}
	}
	, {
		id : "palette-color-09"
		, name : "purple"
		, color : {r:128,g:0,b:128}
	}
	, {
		id : "palette-color-10"
		, name : "brown"
		, color : {r:101,g:67,b:33}
	}
	, {
		id : "palette-color-11"
		, name : "burgundy"
		, color : {r:128,g:0,b:32}
	}
	, {
		id : "palette-color-12"
		, name : "navy blue"
		, color : {r:0,g:0,b:128}
	}
	, {
		id : "palette-color-13"
		, name : "forest green"
		, color : {r:34,g:139,b:34}
	}
	, {
		id : "palette-color-14"
		, name : "orange"
		, color : {r:255,g:165,b:0}
	}
	, {
		id : "palette-color-15"
		, name : "teal"
		, color : {r:0,g:128,b:128}
	}
];


// use Euclidian distance to find closest color. Send in the rgb of the pixel to be substituted
function mapColorToPalette(red, green, blue) {
	var color, diffR, diffG, diffB, diffDistance, mappedColor;
	var distance = Number.MAX_VALUE;
	for (var i = 0; i < palette.length; i++) {
		color = palette[i].color;
		diffR = (color.r - red);
		diffG = (color.g - green);
		diffB = (color.b - blue);
		diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
		if (diffDistance < distance) {
			distance = diffDistance;
			mappedColor = palette[i];
		};
	}
	if (mappedColor === undefined) { // prevent sending back undefined color
		mappedColor = palette[0];
	}

	return (mappedColor);

}

// convert color component to hex
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

// convert an RGB color to a hex color
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// jump to somewhere on the page
function jumpTo(h) {
	var top = document.getElementById(h).offsetTop;
	window.scrollTo(0, top);
}

// read the image selected from the client
function selectImage(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			$('#photo').attr('src', e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}
}

// set params once the crop is completed
function cropDone(img, selection) {
	x = selection.x1;
	y = selection.y1;
	width = selection.width;
	height = selection.height;

	$('#x').text(x);
	$('#y').text(y);
	$('#width').text(width);
	$('#height').text(height);
	$('#pixelate').show();
	jumpTo("pixelate");
}


$(document).ready(function () {

	// draw the palette
	for (var pCount = 0; pCount < palette.length; pCount++) {
		var swatch = document.createElement("span");
		swatch.id = palette[pCount].id;
		swatch.className = "palette-color";
		swatch.style.cssText = "border-color:" + rgbToHex(palette[pCount].color.r, palette[pCount].color.g, palette[pCount].color.b) + ";";
		swatch.innerHTML = palette[pCount].name;
		$("#palette").append(swatch);
	}

	// show the crop once an image is selected
	$("#imgInp").change(function () {
		$("#cropper").show();
		jumpTo("cropper");
		selectImage(this);
	});


	// define a crop for the user's image
	ias = $('#photo').imgAreaSelect({ instance: true });
	ias.setOptions({
		show: true
		, handles: true
		, movable: true
		, onSelectEnd: cropDone
	});
	ias.update();

	// set the initial crop of the image to zero dimensions
	$('#photo').on('load', function () {
		ias.setSelection(0, 0, 0, 0, true);
		ias.update();
	});

	// complete pixelation and color mapping
	$('#pixelization').click(function (event) {
		event.preventDefault();
		pre_pixel = document.getElementById('pre_pixel');
		pre_pixel.width = width;
		pre_pixel.height = height;
		pre_context = pre_pixel.getContext('2d');
		pre_context.drawImage(document.getElementById('photo'), x, y, width, height, 0, 0, width, height);

		target_magnify = Number($('#target_magnify').val());
		post_pixel = document.getElementById('post_pixel');
		target_width = Number($('#target_width').val());
		target_height = Number($('#target_height').val());
		post_pixel.width = target_width * target_magnify;
		post_pixel.height = target_height * target_magnify;
		post_context = post_pixel.getContext('2d');

		pixels_per_x = width / target_width;
		pixels_per_y = height / target_height;
		xoffset = 0;
		yoffset = 0;
		sampleSize;
		imageData;
		mapColor;

		if ($('input[name=sample_type]:checked').val() === "average") {
			average_colors = true;
		} else {
			average_colors = false;
		}

		// each row of pixelated
		for (var row = 0; row < target_width * target_magnify; row += target_magnify) {
			// each column of pixelated
			for (var col = 0; col < target_height * target_magnify; col += target_magnify) {
				imageData = pre_context.getImageData(xoffset, yoffset, pixels_per_x, pixels_per_y);
				// note: ignore alpha channel - just use full opaque (1.0)
				if (average_colors) {
					// find the average of all pixels in group
					r = 0;
					g = 0;
					b = 0;
					sampleSize = imageData.height * imageData.width;
					for (var sampleCount = 0; sampleCount < sampleSize * 4; sampleCount += 4) {
						r += imageData.data[sampleCount];
						g += imageData.data[sampleCount + 1];
						b += imageData.data[sampleCount + 2];
					}
					mapColor = mapColorToPalette(Math.round(r / sampleSize), Math.round(g / sampleSize), Math.round(b / sampleSize));
				}
				else { // just use the top-left pixel in group
					mapColor = mapColorToPalette(imageData.data[0], imageData.data[1], imageData.data[2]);
				}
				// using mapColor.name
				post_context.fillStyle = "rgba(" + mapColor.color.r + "," + mapColor.color.g + "," + mapColor.color.b + ", 1.0 )";
				post_context.fillRect(row, col, target_magnify, target_magnify);
				yoffset += pixels_per_y;
			}
			yoffset = 0;
			xoffset += pixels_per_x;

			$('#mapper').show();
			jumpTo("mapper");
		}
	});

	// TODO: generate build sheets 
	$('#buildit').click(function (event) {
		event.preventDefault();

		$('#supplies').empty()
		$('#pattern').empty()

		var pixelated = document.getElementById('post_pixel');
		var pixelatedContext = pixelated.getContext('2d');
		var pix = pixelatedContext.getImageData(0, 0, pixelated.width, pixelated.height).data;
		var pattern = [];

		for (var i = 0; i < palette.length; i++) {
			palette[i].count = 0;
		}

		for (var r = 0; r < pixelated.height; r++) {
			var xOffset = r * 4 * pixelated.width;
			var rowColor = [];
			var colorCount = 0;
			var prevColorId = null;
			for (var c = 0; c < pixelated.width; c++) {
				mapColor = mapColorToPalette(pix[xOffset + c * 4], pix[xOffset + c * 4 + 1], pix[xOffset + c * 4 + 2]);
				// c+3 is alpha (the fourth element)
				palette.find(p => p.id == mapColor.id).count++;
				if (prevColorId != mapColor.id) {
					if (colorCount > 0) {
						rowColor.push({ color: palette.find(p => p.id == prevColorId).name, count: colorCount });
						colorCount = 0;
					}
					prevColorId = mapColor.id;
				}
				colorCount++;
			}
			if (colorCount > 0) {
				rowColor.push({ color: palette.find(p => p.id == prevColorId).name, count: colorCount });
			}
			pattern.push(rowColor);
		}

		for (var i = 0; i < palette.length; i++) {
			$("#supplies").append(`<li>${palette[i].name}: ${palette[i].count}</li>`);
		}

		for (var r = 0; r < pattern.length; r++) {
			var pRow = pattern[r]
			var output = `${r+1}:`;
			for(var c = 0; c < pRow.length; c++) {
				output += ` ${pRow[c].count} ${pRow[c].color}`;
			}
			$("#pattern").append(`<li>${output}</li>`);
		}

		$('#buildsheets').show();
		jumpTo("buildsheets");
	});
});