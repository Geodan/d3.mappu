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
	var presstimer;
	
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
		var m = d3.mouse(this);
		//var e = d3.event;
		//var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
		//var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
		coords.push(map.projection.invert(m));
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		build();
	}
	
	function finishPoint(){
		var m = d3.mouse(this);
		//var e = d3.event;
		//var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
		//var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
		coords = project.invert(m);
		activeFeature.geometry.coordinates = coords;
		build();
		done();
	}
	
	function finishLineString(){
		//addPoint();
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		build();
		done();
	}
	
	function finishPolygon(){
		//addPoint();
		activeFeature.geometry.type = 'Polygon';
		coords.pop();
		coords.pop();//FIXME ..ugly
		coords.push(coords[0]);
		activeFeature.geometry.coordinates = [coords];
		build();
		done();
	}
	
	function movePointer(){
		var i = activeFeature.geometry.coordinates.length;
		var m = d3.mouse(this);
		//var e = d3.event;
		//var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
		//var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
		var newpoint = map.projection.invert(m);
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
			id: new Date().getTime().toString(),
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
        	map.svg.on('touchstart', function(e){
				pressTimer = window.setTimeout(function() {
					alert('long press!');
					finishPolygon();
				},500);
			})
			.on('touchend', function(){
				clearTimeout(pressTimer);
			});
		}
	};
	
	/* EDIT PART */
	function dragstarted(d) {
	  d3.event.sourceEvent.stopPropagation();
	  d3.select(this).classed("dragging", true);
	}
	
	function dragged(d) {
	  var loc = d3.mouse(map.mapdiv);	
	  d3.select(this).attr("cx", loc[0]).attr("cy", loc[1]);
	  activeFeature.geometry.coordinates[0][d.index] = project.invert(loc);
	  buildEdit();
	}
	
	function dragended(d) {
	  d3.select(this).classed("dragging", false);
	  buildEdit();
	}
	
	var drag = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);
		
	function buildEdit(){
		svg.selectAll('.sketch').remove();
		
		svg.append('path').attr("d", function(){
				return path(activeFeature);
		}).classed('sketch', true)
		.style('stroke', 'red')
		.style('fill', function(){
				if (type == 'LineString'){
					return 'none';
				}
				else {
					return 'red';
				}
		})
		.style('fill-opacity', 0.4);
		
		if (activeFeature.geometry.type == 'Polygon'){
			var data = activeFeature.geometry.coordinates[0];
			data.forEach(function(d,i){
					d.index = i;
					d.fid = d.id;
			});
			var interdata = data.map(function(d,i){
				if (i+1 < data.length){
					var obj = [];
					obj[0] = (d[0] + data[i+1][0])/2;
					obj[1] = (d[1] + data[i+1][1])/2;
					obj.index = d.index;
					return obj;
				}
			});
			interdata.pop();
			
		}
		
		svg.selectAll('.sketchPointInter').remove();
		svg.selectAll('.sketchPointInter').data(interdata).enter().append('circle')
			.classed('sketchPointInter',true)
			.attr('cx', function(d){return project(d)[0];})
			.attr('cy', function(d){return project(d)[1];})
			.attr('r', 40)
			.style('stroke', 'steelBlue')
			.style('fill', 'steelBlue')
			.style('opacity', 0.5)
			.on('click', function(d){
				if (activeFeature.geometry.type == 'Polygon'){
					//add extra vertice
					if (d.index +1 == activeFeature.geometry.coordinates[0].length){
						activeFeature.geometry.coordinates[0].splice(1,0,d);
					}
					else {
						activeFeature.geometry.coordinates[0].splice(d.index +1,0,d);
					}
					buildEdit();
				}
			});
		svg.selectAll('.sketchPoint').remove();
		svg.selectAll('.sketchPoint').data(data).enter().append('circle')
			.classed('sketchPoint',true)
			.attr('cx', function(d){return project(d)[0];})
			.attr('cy', function(d){return project(d)[1];})
			.attr('r', 40)
			.style('stroke', 'steelBlue')
			.style('fill', 'steelBlue')
			.style('fillOpacity', 0.5)
			//kindly copied from http://bl.ocks.org/mbostock/6123708
			.call(drag);
	}
	
	function edit(feature){
		activeFeature = feature;
		buildEdit();
	}
	
	
	var startEdit = function(){
		layer.drawboard.selectAll('.entity').select('path').on('click', edit);
	};
	/* END OF EDIT PART */
	
	var remove = function(feature){
		layer.removeFeature(feature);
	};
	
	var startRemove = function(){
		layer.drawboard.selectAll('.entity').select('path').on('click', remove);
	};
	
	
	var done = function(){
		var event = new CustomEvent('featureReady', {detail: activeFeature});
		map.mapdiv.dispatchEvent(event);
		cancel();
	};
	
	var cancel = function(){
		svg.selectAll('.sketch').remove();
		svg.selectAll('.sketchPoint').remove();
		svg.selectAll('.sketchPointInter').remove();
		layer.drawboard.selectAll('.entity').select('path').on('click', null);
		activeFeature = null;
		map.svg.on('mousemove',null);
		map.svg.on('click', null);
		map.svg.on('click', null);
		map.svg.on('dblclick', null);
		map.svg.on('dblclick', null);
		map.svg.on('touchstart',null);
		map.svg.on('touchend',null);
		map.redraw();
	};
	
	//Export functions
	sketch.draw  = draw;
	sketch.startEdit = startEdit;
	sketch.startRemove = startRemove;
	sketch.cancel = cancel;
	
	return sketch;
};

//                                                                          マップ
