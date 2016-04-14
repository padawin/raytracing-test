(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		grid, cellWidth, cellHeight, lights = [],
		colorDark = 'black';
		colorVisible = 'white';
		colorLight = 'yellow';
		colorObstacle = 'red',
		actions = ['light', 'obstacle'],
		selectedAction = 'light';

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
					isVisible: false,
					isObstacle: false,
					lightIndex: null
				});
			}
		}

		return grid;
	}

	function mainLoop () {
		requestAnimationFrame(mainLoop);
		drawGrid(grid);
		drawControls();
	}

	function drawGrid (grid) {
		var i, cell;

		for (i = 0; i < grid.height * grid.width; i++) {
			var color = colorDark;
			cell = grid.elements[i];
			if (cell.isLight) {
				color = colorLight;
			}
			else if (cell.isVisible) {
				if (cell.isObstacle) {
					color = colorObstacle;
				}
				else {
					color = colorVisible;
				}
			}
			canvasContext.fillStyle = color;
			canvasContext.fillRect(
				cell.x * cellWidth,
				cell.y * cellHeight,
				cellWidth,
				cellWidth
			);
		}
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

		spreadLight();
	}

	function makeCellVisible (x, y) {
		var cellIndex = y * grid.width + x;
		grid.elements[cellIndex].isVisible = true;
	}

	function spreadLight () {
		var i, nbLights = lights.length;

		if (nbLights < 2) {
			return;
		}

		for (i = 0; i < nbLights - 1; i++) {
			drawLine(grid.elements[lights[i]], grid.elements[lights[i + 1]]);
		}

		if (nbLights > 2) {
			drawLine(grid.elements[lights[nbLights - 1]], grid.elements[lights[0]]);
		}
	}

	function drawLine (start, end) {
		var x0 = start.x,
			y0 = start.y,
			x1 = end.x,
			y1 = end.y,
			deltaX = x1 - x0,
			deltaY = y1 - y0,
			error = 0,
			// Assume deltax != 0 (line is not vertical),
			deltaErr = Math.abs(deltaY / deltaX),

			y = y0;

		function sign (n) {
			return n < 0 ? -1 : 1;
		}

		makeCellVisible(x0, y0);
		for (var x = x0; x < x1; x++) {
			error = error + deltaErr;
			while (error >= 0.5) {
				y = y + sign(y1 - y0);
				error = error - 1.0;
				makeCellVisible(x, y);
			}
		}
	}

	grid = createGrid(50, 50);
	setGridCellSize();
	mainLoop();

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
