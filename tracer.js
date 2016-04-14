(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		grid, cellWidth, cellHeight, lights = [],
		colorDark = 'black';
		colorVisible = 'white';
		colorLight = 'yellow';
		colorObstacle = 'red',
		actions = ['light', 'obstacle'],
		selectedAction = 'light',
		radius = 7;

	function setGridCellSize () {
		var canvasWidth, canvasHeight;
		canvasWidth = canvas.width - 20;
		canvasHeight = canvas.height;

		cellWidth = canvasWidth / grid.width;
		cellHeight = canvasHeight / grid.height;
	}

	function createGrid (width, height) {
		var grid = {width: width, height: height, elements: []}, x, y;

		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				grid.elements.push({
					x: x,
					y: y,
					isLight: false,
					isObstacle: false,
					lightIndex: null
				});
			}
		}

		return grid;
	}

	function colorCell (color, cell) {
		var x = 0,
			y = 0,
			w = cellWidth * grid.width,
			h = cellHeight * grid.height;
		if (cell != null) {
			x = cell.x * cellWidth;
			y = cell.y * cellHeight;
			w = cellWidth;
			h = cellHeight;
		}

		canvasContext.fillStyle = color;
		canvasContext.fillRect(x, y, w, h);
	}

	function drawGrid (grid) {
		var i, cell, nbLights = lights.length;
		colorCell(colorDark);
		spreadLight();
	}

	function drawControls () {
		canvasContext.fillStyle = colorLight;
		canvasContext.fillRect(canvas.width - 20, 0, 20, 20);
		canvasContext.fillStyle = colorObstacle;
		canvasContext.fillRect(canvas.width - 20, 20, 20, 20);
		canvasContext.fillStyle = selectedAction == 'light' ? colorLight : colorObstacle;
		canvasContext.fillRect(canvas.width - 20, 40, 20, 20);
		canvasContext.strokeStyle = 'black';
		canvasContext.strokeRect(canvas.width - 20, 40, 20, 20);
	}

	function detectAction (x, y) {
		if (x < canvas.width - 20 || x > canvas.width || y < 0 || y > actions.length * 20) {
			return null;
		}

		return actions[0 | (y / 20)];
	}

	function detectClickedCell (x, y) {
		if (x < 0 || x > canvas.width - 20 || y < 0 || y > canvas.height) {
			return null;
		}

		x = 0 | (x / cellWidth);
		y = 0 | (y / cellHeight);
		return y * grid.width + x;
	}

	function alterCell (affectedCellIndex) {
		if (selectedAction == 'light') {
			grid.elements[affectedCellIndex].isLight = true;
			grid.elements[affectedCellIndex].isObstacle = false;
			lights.push(affectedCellIndex);
			grid.elements[affectedCellIndex].lightIndex = lights.length - 1;
		}
		else if (selectedAction == 'obstacle') {
			grid.elements[affectedCellIndex].isLight = false;
			grid.elements[affectedCellIndex].isObstacle = true;

			if (grid.elements[affectedCellIndex].lightIndex !== null) {
				lights.splice(grid.elements[affectedCellIndex].lightIndex, 1);
				grid.elements[affectedCellIndex].lightIndex = null;
			}
		}

		drawGrid(grid);
	}

	function makeCellVisible (x, y) {
		var cellIndex = y * grid.width + x, color = colorVisible;
		if (grid.elements[cellIndex].isObstacle) {
			color = colorObstacle;
		}
		else if (grid.elements[cellIndex].isLight) {
			color = colorLight
		}
		colorCell(color, grid.elements[cellIndex]);
	}

	function distance (p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	}

	function spreadLight () {
		var i, x, y, nbLights = lights.length, light, dest;

		for (i = 0; i < nbLights; i++) {
			light = grid.elements[lights[i]];
			for (x = light.x - radius; x <= light.x + radius; x++) {
				for (y = light.y - radius; y <= light.y + radius; y++) {
					dest = {x:x, y:y};
					if (distance(light, dest) <= radius) {
						drawLine(getLine(light, dest), light, dest);
					}
				}
			}
		}
	}

	function getLine (start, end) {
		var x0 = start.x, x1 = end.x, y0 = start.y, y1 = end.y,
			pts = [],
			swapXY = Math.abs( y1 - y0 ) > Math.abs( x1 - x0 ),
			tmp,
			deltaX, deltaY, error, y, ySign;

		if (swapXY) {
			// swap x and y
			tmp = x0; x0 = y0; y0 = tmp; // swap x0 and y0
			tmp = x1; x1 = y1; y1 = tmp; // swap x1 and y1
		}

		if (x0 > x1) {
			// make sure x0 < x1
			tmp = x0; x0 = x1; x1 = tmp; // swap x0 and x1
			tmp = y0; y0 = y1; y1 = tmp; // swap y0 and y1
		}

		deltaX = x1 - x0;
		deltaY = Math.floor( Math.abs( y1 - y0 ) );
		error = Math.floor( deltaX / 2 );
		y = y0;
		ySign = ( y0 < y1 ) ? 1 : -1;

		if (swapXY) {
			// Y / X
			for (var x = x0; x < x1 + 1; x++) {
				pts.push({x:y, y:x});
				error -= deltaY;
				if ( error < 0 ) {
					y = y + ySign;
					error = error + deltaX;
				}
			}
		}
		else {
			// X / Y
			for (var x = x0; x < x1 + 1; x++) {
				pts.push({x:x, y:y});
				error -= deltaY;
				if ( error < 0 ) {
					y = y + ySign;
					error = error + deltaX;
				}
			}
		}
		return pts;
	}

	function isObstacle (x, y) {
		var cellIndex = y * grid.width + x;
		return grid.elements[cellIndex].isObstacle;
	}

	function isInGrid (x, y) {
		return (x >= 0 && x < grid.width && y >= 0 && y < grid.height);
	}

	function drawLine (line, start, end) {
		if (line[0].x == end.x && line[0].y == end.y) {
			for (var i = line.length - 1; i >= 0; i--) {
				if (!isInGrid(line[i].x, line[i].y)) {
					break;
				}

				makeCellVisible(line[i].x, line[i].y);
				if (isObstacle(line[i].x, line[i].y)) {
					break;
				}
			}
		}
		else {
			for (var i = 0; i < line.length; i++) {
				if (!isInGrid(line[i].x, line[i].y)) {
					break;
				}

				makeCellVisible(line[i].x, line[i].y);
				if (isObstacle(line[i].x, line[i].y)) {
					break;
				}
			}
		}
	}

	grid = createGrid(50, 50);
	setGridCellSize();
	drawGrid(grid);
	drawControls();

	canvas.onclick = function (event) {
		var rect = canvas.getBoundingClientRect(),
			root = document.documentElement,
			mouseX = event.clientX - rect.left - root.scrollLeft,
			mouseY = event.clientY - rect.top - root.scrollTop,
			newAction = detectAction(mouseX, mouseY),
			affectedCellIndex = detectClickedCell(mouseX, mouseY);

		if (newAction !== null) {
			selectedAction = newAction;
		}
		else if (affectedCellIndex !== null) {
			alterCell(affectedCellIndex);
		}
	};
})();
