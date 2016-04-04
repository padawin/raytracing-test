(function () {
	var canvas = document.getElementById('myCanvas'),
		canvasContext = canvas.getContext('2d'),
		grid, lights = [],
		colorDark = 'black';
		colorVisible = 'white';
		colorLight = 'yellow';
		colorObstacle = 'red';

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
		drawControls(canvas.width > canvas.height ? 'right' : 'bottom');
	}

	function drawGrid (grid) {
		var canvasWidth, canvasHeight, i, cellWidth, cellHeight, cell;
		if (canvas.width > canvas.height) {
			canvasWidth = canvas.width - 20;
			canvasHeight = canvas.height;
		}
		else {
			canvasWidth = canvas.width;
			canvasHeight = canvas.height - 20;
		}

		cellWidth = canvasWidth / grid.width;
		cellHeight = canvasHeight / grid.height;
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

	function drawControls (position) {
		switch (position) {
			case 'right':
				canvasContext.fillStyle = colorLight;
				canvasContext.fillRect(canvas.width - 20, 0, 20, 20);
				canvasContext.fillStyle = colorObstacle;
				canvasContext.fillRect(canvas.width - 20, 20, 20, 20);
				break;
			case 'bottom':
				canvasContext.fillStyle = colorLight;
				canvasContext.fillRect(0, canvas.height - 20, 20, 20);
				canvasContext.fillStyle = colorObstacle;
				canvasContext.fillRect(20, canvas.height - 20, 20, 20);
			default:

		}
	}

	grid = createGrid(50, 50);
	mainLoop();
})();
