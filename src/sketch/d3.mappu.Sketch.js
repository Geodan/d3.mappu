d3.mappu = d3.mappu || {};

d3.mappu.Sketch = function(id, config) {
    return d3_mappu_Sketch(id, config);
};

d3_mappu_Sketch = function(id, config) {
	var sketch = {};
	var layer = config.layer; //Layer to edit
	if (layer.type != 'vector'){
		console.warn('Can\'t edit. Not a vector layer');
		return null;
	}
	var map = layer.map;
	var project = map.projection;
	var coords = [];
	var type = null;
	var activeFeature = null;
	
	function addPoint(){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		coords.push(map.projection.invert([d3.event.offsetX, d3.event.offsetY]));
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		layer.data = [activeFeature];
	}
	
	function finishPoint(e){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		coords = project.invert([d3.event.offsetX, d3.event.offsetY]);
		activeFeature.geometry.coordinates = coords;
		sketch.feature = activeFeature;
		layer.data = [activeFeature]; //TODO: only replace the active feature, not the whole dataset
		done();
	}
	
	function finishLineString(e){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		activeFeature.geometry.coordinates = coords;
		activeFeature.style = {fill: 'none'};
		activeFeature.properties = {fill: 'none'};
		sketch.feature = activeFeature;
		layer.data = [activeFeature];
		done();
	}
	
	function finishPolygon(e){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		activeFeature.geometry.type = 'Polygon';
		activeFeature.geometry.coordinates = [coords];
		activeFeature.style = {fill: 'blue'};
		activeFeature.properties = {fill: 'blue', opacity: 0.5};
		sketch.feature = activeFeature;
		layer.data = [activeFeature];
		done();
	}
	
	function movePointer(e){
		var i = activeFeature.geometry.coordinates.length;
		var newpoint = map.projection.invert([d3.event.offsetX, d3.event.offsetY]);
		if (i >= 1){
			if (i == 1){
				coords[i] = newpoint;
			}
			else {
				coords[i-1] = newpoint;
			}
			activeFeature.geometry.coordinates = coords;
			layer.data = [activeFeature];
		}
	}
	
	var draw = function(geomtype){
		activeFeature = {
			type: "Feature",
			geometry: {
				type: geomtype,
				coordinates: []
			},
			style: {opacity: 0.7},
			properties: {}
		};
		type = geomtype;
		if (type == 'Point'){
			map.svg.on('click',finishPoint);
		}
		else if (type == 'LineString'){
			activeFeature.style.fill = 'none';
			map.svg.on('click', addPoint);
			map.svg.on('mousemove',movePointer);
        	map.svg.on('dblclick',finishLineString);
		}
		else if (type == 'Polygon'){
			activeFeature.style.fill = 'blue';
			map.svg.on('click',addPoint); 
			map.svg.on('mousemove',movePointer);
        	map.svg.on('dblclick',finishPolygon);
		}
	};
	var edit = function(){
		//TODO
	};
	var remove = function(){
		//TODO
	};
	
	var done = function(){
		var event = new Event('featureReady');
		map.mapdiv.dispatchEvent(event);
		cancel();
	};
	
	var cancel = function(){
		activeFeature = null;
		map.svg.on('mousemove',null);
		map.svg.on('click', null);
		map.svg.on('click', null);
		map.svg.on('dblclick', null);
		map.svg.on('dblclick', null);
	};
	
	//Export functions
	sketch.draw  = draw;
	sketch.edit = edit;
	sketch.remove = remove;
	sketch.cancel = cancel;
	
	sketch.feature = activeFeature;
	
	return sketch;
};

//                                                                          マップ
