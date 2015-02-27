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
	var svg = layer.map.svg;
	var path = d3.geo.path()
		.projection(layer.map.projection)
		.pointRadius(4.5);
	var project = map.projection;
	var coords = [];
	var type = null;
	var activeFeature = null;
	var selection = null;
	
	function build(){
		svg.selectAll('.sketch').remove();
		svg.append('path').attr("d", function(){
				return path(activeFeature);
		}).classed('sketch', true)
		.style('stroke', 'blue')
		.style('fill', function(){
				if (type == 'LineString'){
					return 'none';
				}
				else {
					return 'blue';
				}
		})
		.style('fill-opacity', 0.4)
		.on('dblclick',function(){ //TODO: this should be working on the dblclick on the svg (see below)
			if (type == 'LineString'){
				finishLineString();
			}
			if (type == 'Polygon'){
				finishPolygon();
			}
		});
	}
	
	function addPoint(){
		var e = d3.event;
		var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
		var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
		coords.push(map.projection.invert([x, y]));
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		build();
	}
	
	function finishPoint(){
		var e = d3.event;
		var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
		var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
		coords = project.invert([x,y]);
		activeFeature.geometry.coordinates = coords;
		build();
		done();
	}
	
	function finishLineString(){
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		build();
		done();
	}
	
	function finishPolygon(){
		activeFeature.geometry.type = 'Polygon';
		activeFeature.geometry.coordinates = [coords];
		build();
		done();
	}
	
	function movePointer(){
		var i = activeFeature.geometry.coordinates.length;
		var e = d3.event;
		var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
		var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
		var newpoint = map.projection.invert([x,y]);
		if (i >= 1){
			if (i == 1){
				coords[i] = newpoint;
			}
			else {
				coords[i-1] = newpoint;
			}
			activeFeature.geometry.coordinates = coords;
			build();
		}
	}
	
	var draw = function(geomtype){
		activeFeature = {
			id: 1,
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
        	map.svg.on('dblclick',finishLineString); //TODO: event is not caught
		}
		else if (type == 'Polygon'){
			activeFeature.style.fill = 'blue';
			map.svg.on('click',addPoint); 
			map.svg.on('mousemove',movePointer);
        	map.svg.on('dblclick',finishPolygon); //TODO: event is not caught
		}
	};
	var edit = function(){
		//TODO
	};
	var remove = function(){
		//TODO
	};
	
	var done = function(){
		var event = new CustomEvent('featureReady', {detail: activeFeature});
		map.mapdiv.dispatchEvent(event);
		cancel();
	};
	
	var cancel = function(){
		svg.selectAll('.sketch').remove();
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
	
	return sketch;
};

//                                                                          マップ
