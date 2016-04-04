(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		grid, lights = [];

	function createGrid (width, height) {
		var grid = {width: width, height: height, elements: []}, x, y;

		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				grid.elements.push({
					x: x,
					y: y,
					isLight: false,
					isVisible: false,
					isObstacle: false
				});
			}
		}

		return grid;
	}

	function mainLoop () {
		requestAnimationFrame(mainLoop);
		drawGrid(grid);

	}

	function drawGrid (grid) {
		var canvasWidth, canvasHeight;
		if (canvas.width > canvas.height) {
			canvasWidth = canvas.width - 20;
			canvasHeight = canvas.height;
		}
		else {
			canvasWidth = canvas.width;
			canvasHeight = canvas.height - 20;
		}
		var i, cellWidth = canvasWidth / grid.width,
			cellHeight = canvasHeight / grid.height,
			cell;
		for (i = 0; i < grid.height * grid.width; i++) {
			var color = 'black';
			cell = grid.elements[i];
			if (cell.isLight) {
				color = 'yellow';
			}
			else if (cell.isVisible) {
				if (cell.isObstacle) {
					color = 'red';
				}
				else {
					color = 'white';
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

	grid = createGrid(50, 50);
	mainLoop();
})();
