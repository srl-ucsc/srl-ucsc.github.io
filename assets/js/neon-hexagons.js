/*
 * Neon Hexagon-froming particles
 * Initial code from https://codepen.io/towc/pen/mJzOWJ
 * Modifications by GramThanos
 */

const NeonHexagons = (function() {
	var opts = {
		fps: 20,

		len: 20,
		count: 100,
		baseTime: 10,
		addedTime: 10,
		dieChance: .05,
		spawnChance: 1,
		sparkChance: .1,
		sparkDist: 10,
		sparkSize: 2,
		prefarm: 33, // 33
		
		color: 'hsl(hue,100%,light%)',
		baseLight: 50,
		addedLight: 10,
		shadowToTimePropMult: 6,
		baseLightInputMultiplier: .01,
		addedLightInputMultiplier: .01,

		repaintAlpha: .04,
		hueChange: .1,
		hueStatic: 210
	};
		
	var tick = 0;
	var lines = [];
	const baseRad = Math.PI * 2 / 6;
	var w, h, ctx;
	var dieX, dieY;
	var canvas;

	function init(_canvas) {
		canvas = _canvas;
		// Get canvas size
		changeSize(canvas.getBoundingClientRect());
		ctx = canvas.getContext('2d');

		// Calculate FPS variables
		opts.fpsInterval = 1000 / opts.fps;
	    opts.fpsTick = Date.now();

	    // Calculate colors
		opts.calculated_repaintAlpha = 'rgba(0,0,0,alp)'.replace('alp', opts.repaintAlpha);
		opts.calculated_background = 'black';
		if (opts.hueStatic) {
			opts.calculated_hueStatic = opts.color.replace('hue', opts.hueStatic);
			opts.calculated_background = opts.color.replace('100%', '0%').replace('hue', opts.hueStatic).replace('light', '5');
		}

		// Prepare canvas
		ctx.fillStyle = opts.calculated_background;
		ctx.fillRect( 0, 0, w, h );

		// Pre render and populate cavas
		opts.prerender_timeout = null;
		preRender();

		// Detect resize and recalculate values
		window.addEventListener('resize', function(){
			changeSize(canvas.getBoundingClientRect());

			ctx.fillStyle = opts.calculated_background;
			ctx.fillRect( 0, 0, w, h );

			preRender(true);
		});

		// Start
		loop();
	}

	function changeSize(size) {
		w = canvas.width = size.width;
		h = canvas.height = size.height;

		opts.count = Math.ceil(w / 15);
		
		opts.cx = w / 2;
		opts.cy = h / 2;
		
		dieX = w / 2 / opts.len;
		dieY = h / 2 / opts.len;
	}

	function preRender(buffer) {
		let func = function() {
			for (var i = opts.prefarm - 1; i >= 0; i--) {
				loopTick();
			}
		}
		if (buffer) {
			func();
		}
		else {
			clearTimeout(opts.prerender_timeout);
			opts.prerender_timeout = setTimeout(() => {func();}, 20);
		}
	}

	function loop(prefarm) {
		window.requestAnimationFrame(loop);

		// Limit FPS
		now = Date.now();
		elapsed = now - opts.fpsTick;
		if (elapsed <= opts.fpsInterval) return;
		opts.fpsTick = now - (elapsed % opts.fpsInterval);

		loopTick();
	}

	function loopTick() {
		++tick;

		ctx.globalCompositeOperation = 'source-over';
		ctx.shadowBlur = 0;
		ctx.fillStyle = opts.calculated_repaintAlpha;
		ctx.fillRect(0, 0, w, h);
		ctx.globalCompositeOperation = 'lighter';
		
		if (lines.length < opts.count && Math.random() < opts.spawnChance){
			lines.push(new Line);
		}
		
		lines.map(function(line){
			line.step();
		});
	}

	function Line(){	
		this.reset();
	}

	Line.prototype.reset = function(){
		this.x = w/2 * Math.random() - w/4;
		this.y = 0;
		this.addedX = 0;
		this.addedY = 0;
		
		this.rad = 0;
		
		this.lightInputMultiplier = opts.baseLightInputMultiplier + opts.addedLightInputMultiplier * Math.random();
		
		this.color = opts.hueStatic ? opts.calculated_hueStatic : opts.color.replace('hue', opts.hueStatic  || tick * opts.hueChange);
		this.cumulativeTime = 0;
		
		this.beginPhase();
	}

	Line.prototype.beginPhase = function(){
		this.x += this.addedX;
		this.y += this.addedY;
		
		this.time = 0;
		this.targetTime = (opts.baseTime + opts.addedTime * Math.random()) |0;
		
		this.rad += baseRad * (Math.random() < .5 ? 1 : -1);
		this.addedX = Math.cos(this.rad);
		this.addedY = Math.sin(this.rad);
		
		if (Math.random() < opts.dieChance || this.x > dieX || this.x < -dieX || this.y > dieY || this.y < -dieY) {
			this.reset();
		}
	}

	Line.prototype.step = function(){	
		++this.time;
		++this.cumulativeTime;
		
		if (this.time >= this.targetTime) {
			this.beginPhase();
		}
		
		var prop = this.time / this.targetTime,
			wave = Math.sin(prop * Math.PI / 2),
			x = this.addedX * wave,
			y = this.addedY * wave;
		
		ctx.shadowBlur = prop * opts.shadowToTimePropMult;
		ctx.fillStyle = ctx.shadowColor = this.color.replace('light', opts.baseLight + opts.addedLight * Math.sin(this.cumulativeTime * this.lightInputMultiplier));
		ctx.fillRect(opts.cx + (this.x + x) * opts.len, opts.cy + (this.y + y) * opts.len, 2, 2);
		
		if (Math.random() < opts.sparkChance) {
			ctx.fillRect(opts.cx + (this.x + x) * opts.len + Math.random() * opts.sparkDist * (Math.random() < .5 ? 1 : -1) - opts.sparkSize / 2, opts.cy + (this.y + y) * opts.len + Math.random() * opts.sparkDist * (Math.random() < .5 ? 1 : -1) - opts.sparkSize / 2, opts.sparkSize, opts.sparkSize)
		}
	}

	return {opts, init, loop, loopTick}
})();


