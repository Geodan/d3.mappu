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
	
	function finishPoint(e){
		coords = project.invert([e.offsetX, e.offsetY]);
		var feature = {
			type: "Feature",
			geometry: {
				type: 'Point',
				coordinates: coords
			},
			style: {},
			properties: {}
		};
		map.mapdiv.removeEventListener('click', finishPoint);
	}
	
	function addPoint(e){
		coords.push(map.projection.invert([e.offsetX, e.offsetY]));
	}
	
	function finishLineString(e){
		var feature = {
			type: "Feature",
			geometry: {
				type: 'LineString',
				coordinates: coords
			},
			style: {fill: 'none'},
			properties: {fill: 'none'}
		};
		map.mapdiv.removeEventListener('click', addPoint);
		map.mapdiv.removeEventListener('dblclick', finishLineString);
	}
	
	function finishPolygon(e){
		coords.push(coords[0]);
		var feature = {
			type: "Feature",
			geometry: {
				type: 'Polygon',
				coordinates: coords
			},
			style: {opacity: 0.5},
			properties: {opacity: 0.5}
		};
		map.mapdiv.removeEventListener('click', addPoint);
		map.mapdiv.removeEventListener('dblclick', finishPolygon);
	}
	
	var draw = function(type){
		if (type == 'Point'){
			map.mapdiv.addEventListener('click',finishPoint);
		}
		else if (type == 'LineString'){
			map.mapdiv.addEventListener('click',addpoint); 
        	map.mapdiv.addEventListener('dblclick',finishLineString);
		}
		else if (type == 'Polygon'){
			map.mapdiv.addEventListener('click',addpoint); 
        	map.mapdiv.addEventListener('dblclick',finishPolygon);
		}
	};
	var edit = function(){
	};
	var remove = function(){
	};
	
	var cancel = function(){
		map.mapdiv.removeEventListener('click', addPoint);
		map.mapdiv.removeEventListener('click', finishPoint);
		map.mapdiv.removeEventListener('dblclick', finishLineString);
		map.mapdiv.removeEventListener('dblclick', finishPolygon);
	};
	
	//Export functions
	sketch.draw  = draw;
	sketch.edit = edit;
	sketch.remove = remove;
	
	return sketch;
};

//                                                                          マップ
