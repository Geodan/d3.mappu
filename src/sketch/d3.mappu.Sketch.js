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
	
	function addPoint(e){
		coords.push(map.projection.invert([e.offsetX, e.offsetY]));
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		layer.data = [activeFeature];
	}
	
	function finishPoint(e){
		coords = project.invert([e.offsetX, e.offsetY]);
		activeFeature.geometry.coordinates = coords;
		sketch.feature = activeFeature;
		layer.data = [activeFeature];
		done();
	}
	
	function finishLineString(e){
		activeFeature.geometry.coordinates = coords;
		activeFeature.style = {fill: 'none'};
		activeFeature.properties = {fill: 'none'};
		sketch.feature = activeFeature;
		layer.data = [activeFeature];
		done();
	}
	
	function finishPolygon(e){
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
		var newpoint = map.projection.invert([e.offsetX, e.offsetY]);
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
			map.mapdiv.addEventListener('click',finishPoint);
		}
		else if (type == 'LineString'){
			activeFeature.style.fill = 'none';
			map.mapdiv.addEventListener('click',addPoint);
			map.mapdiv.addEventListener('mousemove',movePointer);
        	map.mapdiv.addEventListener('dblclick',finishLineString);
		}
		else if (type == 'Polygon'){
			activeFeature.style.fill = 'blue';
			map.mapdiv.addEventListener('click',addPoint); 
			map.mapdiv.addEventListener('mousemove',movePointer);
        	map.mapdiv.addEventListener('dblclick',finishPolygon);
		}
	};
	var edit = function(){
	};
	var remove = function(){
	};
	
	var done = function(){
		var event = new Event('featureReady');
		map.mapdiv.dispatchEvent(event);
		cancel();
	};
	
	var cancel = function(){
		activeFeature = null;
		map.mapdiv.removeEventListener('mousemove',movePointer);
		map.mapdiv.removeEventListener('click', addPoint);
		map.mapdiv.removeEventListener('click', finishPoint);
		map.mapdiv.removeEventListener('dblclick', finishLineString);
		map.mapdiv.removeEventListener('dblclick', finishPolygon);
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
