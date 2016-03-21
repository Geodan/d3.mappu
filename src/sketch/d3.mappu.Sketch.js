d3.mappu = d3.mappu || {};

d3.mappu.Sketch = function(id, config) {
    return d3_mappu_Sketch(id, config);
};

d3_mappu_Sketch = function(id, config) {
	var sketch = {};
	var map = null;
	var svg = null;
	var path = null;
	var project = null;
	var coords = [];
	var type = null;
	var activeFeature = null;
	var selection = null;
	var presstimer;
	var clickCount = 0;
	
	/* NEW DRAWING */
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
		.style('fill-opacity', 0.4);
		
	}
	
	function addPoint(e){
		var m = d3.mouse(this);
		coords.push(map.projection.invert(m));
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		build();
	}
	
	function finishPoint(){
		var m = d3.mouse(this);
		coords = project.invert(m);
		//stamp out new id for feature
		activeFeature.id = new Date().getTime().toString();
		activeFeature.geometry.coordinates = coords;
		build();
		featureCreated();
	}
	
	function finishLineString(){
		//addPoint();
		coords.pop();
		coords.pop();//FIXME ..ugly
		activeFeature.geometry.type = 'LineString';
		activeFeature.geometry.coordinates = coords;
		//stamp out new id for feature
		activeFeature.id = new Date().getTime().toString();
		build();
		featureCreated();
	}
	
	function finishPolygon(){
		//addPoint();
		activeFeature.geometry.type = 'Polygon';
		coords.pop();
		coords.pop();//FIXME ..ugly
		coords.push(coords[0]);
		activeFeature.geometry.coordinates = [coords];
		//stamp out new id for feature
		activeFeature.id = new Date().getTime().toString();
		build();
		featureCreated();
	}
	
	function movePointer(){
		var i = activeFeature.geometry.coordinates.length;
		var m = d3.mouse(this);
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
		svg = d3.select(map.mapdiv).append('svg')
			.attr( 'id', 'sketch' )
			.style( 'position', 'absolute' )
			.attr('width',map.mapdiv.clientWidth)
			.attr('height',map.mapdiv.clientHeight)
			.append('g');
			
		return new Promise(function(resolve, reject){
			this.resolve = resolve;
			activeFeature = {
				id: null,
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
				d3.select(map.mapdiv).on('click',finishPoint);
			}
			else if (type == 'LineString'){
				//some defaults
				activeFeature.style.fill = 'none';
				activeFeature.style.stroke = 'blue';
				activeFeature.style['stroke-width'] = "4";
				activeFeature.style['stroke-linecap'] = "round";
				d3.select(map.mapdiv).on('mousedown', addPoint);
				d3.select(map.mapdiv).on('mousemove',movePointer);
				d3.select(map.mapdiv).on('mousedown.doublemousedown',function(e){
					clickCount++;
					if (clickCount >1){
						finishLineString(e);
					}
					window.setTimeout(function() {
						clickCount = 0;
					},300);
				});
			}
			else if (type == 'Polygon'){
				//some defaults
				activeFeature.style.fill = 'blue';
				activeFeature.style.stroke = 'blue';
				d3.select(map.mapdiv).on('mousedown',addPoint); 
				d3.select(map.mapdiv).on('mousemove',movePointer);
				d3.select(map.mapdiv).on('mousedown.doublemousedown',function(e){
					clickCount++;
					if (clickCount >1){
						finishPolygon(e);
					}
					window.setTimeout(function() {
						clickCount = 0;
					},300);
				});
				d3.select(map.mapdiv).on('touchstart', function(e){
					pressTimer = window.setTimeout(function() {
						finishPolygon();
					},500);
				})
				.on('touchmove',function(e,d){
					console.log(e,d);
				})
				.on('touchend', function(){
					clearTimeout(pressTimer);
				});
			}
		});
	};
	
	/**	featureCreated emits the newly created feature **/
	var featureCreated = function(){
		self.resolve(activeFeature);
		//_layer.addFeature(activeFeature);
		//var event = new CustomEvent('featureCreated', {detail: activeFeature});
		//map.mapdiv.dispatchEvent(event);
		finish();
		
	};
	
	
/** EDIT EXISTING FEATURE */
	function dragstarted(d) {
	  d3.event.sourceEvent.stopPropagation();
	  d3.select(this).classed("dragging", true);
	}
	
	function dragged(d) {
	  var loc = d3.mouse(map.mapdiv);	
	  d3.select(this).attr("cx", loc[0]).attr("cy", loc[1]);
	  if (type == 'Polygon'){
	  	  //Check if we have to add this point to the geometry
	  	  if (d3.select(this).classed('sketchPointInter')){
	  	  	  	d3.select(this).classed('sketchPointInter',false).classed('sketchPoint',true);
	  	  	  	//add extra vertice
				if (d.index +1 == activeFeature.geometry.coordinates[0].length){
					activeFeature.geometry.coordinates[0].splice(1,0,d);
				}
				else {
					activeFeature.geometry.coordinates[0].splice(d.index +1,0,d);
				}
	  	  }
	  	  else {
			  activeFeature.geometry.coordinates[0][d.index] = project.invert(loc);
			  //When dragging the closing point of the polygon, there's a twin point that should be dragged as well
			  if (d.index === 0){
				  activeFeature.geometry.coordinates[0].pop();
				  activeFeature.geometry.coordinates[0].push(project.invert(loc));
			  }
			  if (d.index + 1 == activeFeature.geometry.coordinates[0].length){
				  activeFeature.geometry.coordinates[0][0] = project.invert(loc);
			  }
		  }
	  }
	  else if (type == 'LineString'){
	  	  //Check if we have to add this point to the geometry
	  	  if (d3.select(this).classed('sketchPointInter')){
	  	  	  d3.select(this).classed('sketchPointInter',false).classed('sketchPoint',true);
	  	  	  activeFeature.geometry.coordinates.splice(d.index +1,0,d);
	  	  }
	  	  else {
	  	  	  activeFeature.geometry.coordinates[d.index] = project.invert(loc);
	  	  }
	  }
	  else if (type == 'Point'){
	  	  activeFeature.geometry.coordinates = project.invert(loc);
	  }
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
		//Remove existing sketch features
		svg.selectAll('.sketch').remove();
		//Build feature in sketch
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
		//Prepare points to add vertices (interdata)
		if (type == 'Point'){
				var data = [activeFeature.geometry.coordinates];
				var interdata = [];
		}
		else {
			switch (type){
			case 'Polygon':
				var data = activeFeature.geometry.coordinates[0];
				break;
			case 'LineString':
				var data = activeFeature.geometry.coordinates;
				break;
			default:
				console.warn(type,' not supported');
			}
			data.forEach(function(d,i){
				d.index = i;
				d.fid = d.id;
			});
			//TODO: this may be written shorter, interdata can be part of data and d3 can draw every even point as an interPoint
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
			.attr('r', 10)
			.style('stroke', 'steelBlue')
			.style('fill', 'steelBlue')
			.style('opacity', 0.5)
			.call(drag);

		svg.selectAll('.sketchPoint').remove();
		svg.selectAll('.sketchPoint').data(data).enter().append('circle')
			.classed('sketchPoint',true)
			.attr('cx', function(d){return project(d)[0];})
			.attr('cy', function(d){return project(d)[1];})
			.attr('r', 10)
			.style('stroke', 'steelBlue')
			.style('fill', 'steelBlue')
			.style('fillOpacity', 0.5)
			.call(drag);
	}
	
	/**
		edit()
		Start editing a specific feature
	**/
	var edit = function(feature){
		svg = d3.select(map.mapdiv).append('svg')
			.attr( 'id', 'sketch' )
			.style( 'position', 'absolute' )
			.attr('width',map.mapdiv.clientWidth)
			.attr('height',map.mapdiv.clientHeight)
			.append('g');
		return new Promise(function(resolve, reject){
			self.resolve = resolve;
			event.stopPropagation();
			d3.select(map.mapdiv).on('click', function(){
				buildEdit();
				featureChanged();
			});
			activeFeature = feature;
			type = feature.geometry.type;
			buildEdit();
		});
	};
	
	/**
		startEdit()
		adds a listener to the entities to edit them
	**/
	var startEdit = function(){
		//_layer.drawboard.selectAll('.entity').select('path').on('click', edit);
	};
	
	/**	featureChanged emits the newly created feature **/
	var featureChanged = function(){
		self.resolve(activeFeature);
		//_layer.addFeature(activeFeature);
		//var event = new CustomEvent('featureChanged', {detail: activeFeature});
		//map.mapdiv.dispatchEvent(event);
		finish();
	};

	
	
	/** REMOVE FEATURE **/
	var remove = function(feature){
		return new Promise(function(resolve, reject){
			resolve(feature);
			finish();
		});
		//_layer.removeFeature(feature);
		//var event = new CustomEvent('featureRemoved', {detail: feature});
		//map.mapdiv.dispatchEvent(event);
		
	};
	/**
		startRemove()
		adds a listener to the entities to remove them
	**/
	var startRemove = function(){
		//_layer.drawboard.selectAll('.entity').select('path').on('click', remove);
	};

	
	/** FINISH **/	
	/** 
		finish()
		finish puts an end to the drawing or editing mode and removes listeners 
	**/
	
	var finish = function(){
		if (svg){
			svg.selectAll('.sketch').remove();
			svg.selectAll('.sketchPoint').remove();
			svg.selectAll('.sketchPointInter').remove();
			d3.select(map.mapdiv).select('#sketch').remove();
			//_layer.drawboard.selectAll('.entity').select('path').on('click', null);
			activeFeature = null;
			coords = [];
			d3.select(map.mapdiv).on('mousemove',null);
			d3.select(map.mapdiv).on('click', null);
			d3.select(map.mapdiv).on('mousedown',null);
			d3.select(map.mapdiv).on('doublemousedown',null);
			d3.select(map.mapdiv).on('touchstart',null);
			d3.select(map.mapdiv).on('touchend',null);
			//_layer.draw(true);
		}
	};
	
	/**
		addTo(mapObject)
		Attach a map to the sketch object
	**/
	function addTo(m){
		map = m;
		map.sketch = sketch;
		
		project = map.projection;
		path = d3.geo.path()
			.projection(map.projection)
			.pointRadius(4.5);
		return sketch;
	}
	
	//Export functions
	sketch.draw  = draw;
	sketch.startEdit = startEdit;
	sketch.startRemove = startRemove;
	sketch.remove = remove;
	sketch.finish = finish;
	sketch.edit = edit;
	sketch.addTo = addTo;
	return sketch;
};

//                                                                          マップ
