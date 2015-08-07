d3.mappu = d3.mappu || {};
d3.mappu.util = {};

//create a uniqueID for layers etc.
var _ctr = 0;   
d3.mappu.util.createID = function(){
    var id = "ッ-"+_ctr;
    _ctr++;
    return id;
};

//                                                                          マップ
;d3.mappu = d3.mappu || {};
/*
 * d3.mappu.Map is the central class of the API - it is used to create a map.
 */
 
/* d3.mappu.Map(element, config)

element = dom object
options: 
center: [long,lat]                  default = [0,0]
zoom: zoomlevel                     default = 0.0
layers: [layer]                     default = null
minZoom: zoomlevel                  default = 0.0
maxZoom: zoomlevel                  default = 13.0
maxView: [[long,lat],[long,lat]]    default = [[-180,90],[180,-90]]
projection: projection              default = d3.geo.mercator()
*/


d3.mappu.Map = function(id, config) {
    return d3_mappu_Map(id, config);
};

d3_mappu_Map = function(id, config) {
    
    var map = {};
	var _layers = [];
	var _mapdiv;
	
	
	//check if elem is a dom-element or an identifier
	if (typeof(id) == 'object'){
	    _mapdiv = id;
	}
	else {
	    _mapdiv = document.getElementById(id);
	}
	
	window.onresize = function(){
		resize();
	};
	
	//TODO: how to get the size of the map
	var _width = _mapdiv.clientWidth || 2024;
	var _height = _mapdiv.clientHeight || window.innerHeight || 768;
	var _ratio = 1;
	
	/* Experimental
	var _canvasdiv = d3.select(_mapdiv)
		.style("width", _width + 'px')
		.style("height", _height + 'px')
	  .append("div")
		.style("transform", "scale(" + 1 / _ratio + ")")
		.style("transform-origin", "0 0 0");
	*/
	
	
	var _extent = [[0,0],[1,1]];
	var _center = config.center || [0,0];
	var _projection = config.projection || d3.geo.mercator();
	var _zoom = config.zoom || 22;
	var _maxZoom = config.maxZoom || 24;
	var _minZoom = config.minZoom || 15;
	var _maxView = config.maxView || [[-180,90],[180,-90]];

	var dispatch = d3.dispatch("loaded","zoomend");
	
    var redraw = function(){
    	//Calculate projection, so we can find out coordinates
    	_projection
           .scale(_zoombehaviour.scale() / 2 / Math.PI)
           .translate(_zoombehaviour.translate());
    	//Set internal zoom
    	_zoom = Math.log(_zoombehaviour.scale())/Math.log(2);
    	
    	//Set internal center
    	var pixcenter = [_width/2,_height/2];
        _center =  _projection.invert(pixcenter);
        
        //Calculate tile set
        _tiles = _tile.scale(_zoombehaviour.scale())
          .translate(_zoombehaviour.translate())();
        
        /* EXPERIMENTAL */
        //layer.call(raster);
        
        _layers.forEach(function(d){
            d.refresh(0);
        });
        
        //Update extent value
    	var lb = _projection.invert([0, _mapdiv.clientHeight]);
		var rt = _projection.invert([_mapdiv.clientWidth, 0]);
		map.extent = [lb, rt];
		
		dispatch.zoomend();
    };
    
    var resize = function(){
		_width = _mapdiv.clientWidth;
		_height = _mapdiv.clientHeight;
		d3.select(_mapdiv).select('svg')
			.attr("width", _width)
			.attr("height", _height);
		_tile.size([_width,_height]);
		redraw();
	};
	
	function zoomcenter(zoomval, centerval){
   	   	var scale = (1 << zoomval);
		_zoombehaviour.scale(scale);
		_projection
		   .scale(_zoombehaviour.scale() / 2 / Math.PI)
		   .translate(_zoombehaviour.translate());
		
		//Adapt projection based on new zoomlevel
		var pixcenter = _projection(centerval);
		var curtranslate = _zoombehaviour.translate();
		var translate = [
			curtranslate[0] + (_width - pixcenter[0]) - (_width/2), 
			curtranslate[1] + (_height - pixcenter[1]) - (_height/2)
		];
		_zoombehaviour.translate(translate);
		_zoombehaviour.event(_svg.transition()); //Trigger zoombehaviour
   }
	
	var _svg = d3.select(_mapdiv).append('svg')
	    .style('position', 'absolute');
    
    //var p = .5 * _ratio;
	_projection
		.scale(( 1 << _zoom || 1 << 12) / 2 / Math.PI)
        .translate([_width / 2, _height / 2]);
	    //.center(_center)
        //.clipExtent([[p, p], [_width - p, _height - p]]);
     
    var _projcenter = _projection(_center);     
    
	var _zoombehaviour = d3.behavior.zoom()
	    .scale(_projection.scale() * 2 * Math.PI)
        .scaleExtent([1 << _minZoom, 1 << _maxZoom])
        .translate([_width - _projcenter[0], _height - _projcenter[1]])
        .on("zoom", redraw);
	d3.select(_mapdiv).call(_zoombehaviour);
	/*Obs?
    _projection
        .scale(1 / 2 / Math.PI)
        .translate([0, 0]);
    */
    var _tile = d3.geo.tile()
        .size([_width,_height]);

    var _tiles = _tile.scale(_zoombehaviour.scale())
          .translate(_zoombehaviour.translate())();
    //Do an initial zoomcenter
    zoomcenter(_zoom, _center);
    resize();
    
    /*
    var raster = d3.geo.raster(_projection)
        .scaleExtent([0, 10])
        //.url("//{subdomain}.tiles.mapbox.com/v3/mapbox.natural-earth-2/{z}/{x}/{y}.png");
        .url("//{subdomain}.tiles.mapbox.com/v3/examples.map-i86nkdio/{z}/{x}/{y}.png");
    
    var layer = _canvasdiv
      .append("div")
        .style("transform-origin", "0 0 0")
        .call(raster);
   */
// exposed functions

////getter/setter functions
	 Object.defineProperty(map, 'svg', {
        get: function() {
            return _svg;
        },
        set: function() {
            console.log("do not touch the svg");
        }
    });
    
    Object.defineProperty(map, 'mapdiv', {
        get: function() {
            return _mapdiv;
        },
        set: function() {
            console.log("do not touch the mapdiv");
        }
    });
    
    Object.defineProperty(map, 'canvasdiv', {
        get: function() {
            return _canvasdiv;
        },
        set: function() {
            console.log("do not touch the canvasdiv");
        }
    }); 
    
// .center : ([long,lat])
    Object.defineProperty(map, 'center', {
        get: function() {
            return _center;
        },
        set: function(val) {
        	//zoomcenter will move to and set the center in some steps
			zoomcenter(_zoom, val);
        }
    });   
// .zoom : (zoomlevel)
//http://truongtx.me/2014/03/13/working-with-zoom-behavior-in-d3js-and-some-notes/
    Object.defineProperty(map, 'zoom', {
        get: function() {
            return _zoom;
        },
        set: function(val) {
        	if (val <= _maxZoom && val >= _minZoom){
        		//zoomcenter will move to and set the zoomlevel in some steps
				zoomcenter(val, _center);
			}
			else {
				console.log('Zoomlevel exceeded',val , 'Min:',_minZoom ,'Max:', _maxZoom);
			}
        }
    });

// .minZoom : (zoomlevel)
    Object.defineProperty(map, 'minZoom', {
        get: function() {
            return _minZoom;
        },
        set: function(val) {
            _minZoom = val;
            this.zoombehaviour.scaleExtent([1 << _minZoom, 1 << _maxZoom]);
        }
    });
// .maxZoom : (zoomlevel)
    Object.defineProperty(map, 'maxZoom', {
        get: function() {
            return _maxZoom;
        },
        set: function(val) {
            _maxZoom = val;
            this.zoombehaviour.scaleExtent([1 << _minZoom, 1 << _maxZoom]);
        }
    });
// .maxView : ([[long,lat],[long,lat]])
    Object.defineProperty(map, 'maxView', {
        get: function() {
            return _maxView;
        },
        set: function(val) {
            _maxView = val;
        }
    });
// .projection : ({projection})
    Object.defineProperty(map, 'projection', {
        get: function() {
            return _projection;
        },
        set: function(obj) {
          _projection = obj;
          //TODO: redraw
        }
    });
// .extent : returns current map extent in latlon    
    Object.defineProperty(map, 'extent', {
		get: function(){
			return _extent;
		},
		set: function(value){
			_extent = value;
		}
    });
    
    Object.defineProperty(map, 'tiles', {
		get: function(){return _tiles;},
		set: function(){console.warn('No setting allowed for tile');}
    });
    
    Object.defineProperty(map, 'zoombehaviour', {
		get: function(){return _zoombehaviour;},
		set: function(){console.warn('No setting allowed for zoombehaviour');}
    });
    
    Object.defineProperty(map, 'layers', {
		get: function(){return _layers;},
		set: function(){console.warn('No setting allowed for layers');}
    });
    
    
    
	
////singular functions

	var zoomToFeature = function(d){
		//TODO 
		//see: http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
		console.warn('Not implemented yet');
	};

    var addLayer = function(layer){
        if (!layer.id){
            console.warn('Not a valid layer. (No ID)');
            return false;
        }
        //Replace existing ID
        /*
        _layers.forEach(function(d){
            if (d.id == layer.id){
            	console.log('Replacing ',d.id);
                d = layer; //TODO: can you replace an array item like this?
                return map;
            }
        });*/
        var idx = _layers.indexOf(layer);
        if (idx > -1){
        	_layers.splice(idx,1);
        }
        _layers.push(layer);
        layer._onAdd(map);
        return map;
    };
    var removeLayer = function(layer){
    	var idx = _layers.indexOf(layer);
    	if (idx > -1){
    		//remove layer
    		_layers.splice(idx,1);
   		}
    	orderLayers();
        return map;
    };
    //Arrange the drawboards
	var orderLayers = function(){
		var drawboards = _svg.selectAll('.drawboard').data(_layers, function(d){return d.id;});
		drawboards.enter().append('g').attr('id', function(d){return d.id;}).classed('drawboard',true)
			.each(function(d){
				d.drawboard = d3.select(this);
				//Experimental!!
				var filter = d.drawboard.append('defs')
					.append('filter').attr('id','glow');
				filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur');
				var merge = filter.append('feMerge');
				merge.append('feMergeNode').attr('in', 'coloredBlur');
				merge.append('feMergeNode').attr('in', 'SourceGraphic');
				//End of experiment
			});
		drawboards.exit().remove();
		drawboards.sort(function (a, b) {
		  return a.zindex - b.zindex;
		});
	};

// .removeLayers([{layer}])

// .refresh()
    
    map.zoomToFeature = zoomToFeature;
    map.addLayer = addLayer;
    map.removeLayer = removeLayer;
    map.orderLayers = orderLayers;
    //map.getLayersByName = getLayersByName;
    map.redraw = redraw;
    map.resize = resize;
    map.dispatch = dispatch;
    return map;
};

//                                                                          マップ
;d3.mappu = d3.mappu || {};

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
			map.svg.on('click',finishPoint);
		}
		else if (type == 'LineString'){
			//some defaults
			activeFeature.style.fill = 'none';
			activeFeature.style.stroke = 'blue';
			activeFeature.style['stroke-width'] = "4";
			activeFeature.style['stroke-linecap'] = "round";
			map.svg.on('click', addPoint);
			map.svg.on('mousemove',movePointer);
        	map.svg.on('dblclick',finishLineString); //TODO: event is not caught
		}
		else if (type == 'Polygon'){
			//some defaults
			activeFeature.style.fill = 'blue';
			activeFeature.style.stroke = 'blue';
			map.svg.on('click',addPoint); 
			map.svg.on('mousemove',movePointer);
        	map.svg.on('dblclick',finishPolygon); //TODO: event is not caught
        	map.svg.on('touchstart', function(e){
				pressTimer = window.setTimeout(function() {
					console.log('long press!');
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
	};
	
	/**	featureCreated emits the newly created feature **/
	var featureCreated = function(){
		layer.addFeature(activeFeature);
		var event = new CustomEvent('featureCreated', {detail: activeFeature});
		map.mapdiv.dispatchEvent(event);
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
			//kindly copied from http://bl.ocks.org/mbostock/6123708
			.call(drag);
	}
	
	/**
		edit()
		Start editing a specific feature
	**/
	var edit = function(feature){
		event.stopPropagation();
		map.svg.on('click', function(){
				buildEdit();
				featureChanged();
		});
		activeFeature = feature;
		type = feature.geometry.type;
		buildEdit();
	};
	
	/**
		startEdit()
		adds a listener to the entities to edit them
	**/
	var startEdit = function(){
		layer.drawboard.selectAll('.entity').select('path').on('click', edit);
	};
	
	/**	featureChanged emits the newly created feature **/
	var featureChanged = function(){
		layer.addFeature(activeFeature);
		var event = new CustomEvent('featureChanged', {detail: activeFeature});
		map.mapdiv.dispatchEvent(event);
		finish();
	};

	
	
/** REMOVE FEATURE **/
	var remove = function(feature){
		layer.removeFeature(feature);
		var event = new CustomEvent('featureRemoved', {detail: feature});
		map.mapdiv.dispatchEvent(event);
		finish();
	};
	/**
		startRemove()
		adds a listener to the entities to remove them
	**/
	var startRemove = function(){
		layer.drawboard.selectAll('.entity').select('path').on('click', remove);
	};

	
/** FINISH **/	
	/** 
		finish()
		finish puts an end to the drawing or editing mode and removes listeners 
	**/
	
	var finish = function(){
		svg.selectAll('.sketch').remove();
		svg.selectAll('.sketchPoint').remove();
		svg.selectAll('.sketchPointInter').remove();
		layer.drawboard.selectAll('.entity').select('path').on('click', null);
		activeFeature = null;
		coords = [];
		map.svg.on('mousemove',null);
		map.svg.on('click', null);
		map.svg.on('dblclick', null);
		map.svg.on('touchstart',null);
		map.svg.on('touchend',null);
		layer.draw(true);
	};
	
	//Export functions
	sketch.draw  = draw;
	sketch.startEdit = startEdit;
	sketch.startRemove = startRemove;
	sketch.finish = finish;
	sketch.edit = edit;
	sketch.layer = layer;
	return sketch;
};

//                                                                          マップ
;/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
	config = config || {};
    var layer = {};
    var _map;
    var _id = d3.mappu.util.createID();
    var _name = name;
    //TODO: parse config
    var _opacity = 1;
    _opacity = config.opacity || 1;
    
    var _visible = true;
    if (typeof(config.visible) == 'boolean' || config.visible == 'true' || config.visible == 'false'){
    	_visible = config.visible;
    }
    
	var _display = 'block';
	var _zindex = 0;
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    
    var setZIndex = function(i){
    	layer.zindex = i;
    };
    
    var addTo = function(map){
        map.addLayer(layer);
        return layer;
    };
    
    Object.defineProperty(layer, 'id', {
        get: function() {return _id;},
        set: function() {console.warn('setting ID not allowed for layer');}
    });
    
    Object.defineProperty(layer, 'name', {
        get: function() {
            return _name;
        },
        set: function(val) {
            _name = val;
        }
    });
    
    Object.defineProperty(layer, 'map', {
        get: function() {
            return _map;
        },
        set: function(val) {
            _map = val;
        }
    });
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return _opacity;
        },
        set: function(val) {
            _opacity = val;
            layer.refresh(0);
        }
    });
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return _visible;
        },
        set: function(val) {
            _visible = val;
            layer.draw(true);
            layer.refresh(0);
        }
    });
    
    Object.defineProperty(layer, 'zindex', {
        get: function() {
            return _zindex;
        },
        set: function(val) {
            _zindex = val;
            if (layer.map){
            	layer.map.orderLayers();
            }
        }
    });
    
    /* exposed: */
    layer.refresh = refresh;  
    layer.moveUp = moveUp;
    layer.moveDown = moveDown;
    layer.addTo = addTo;
    layer.setZIndex = setZIndex;

    /* private: */
    layer._onAdd =  function(map){ //Adds the layer to the given map object
        _map = map;
        map.orderLayers();
        layer.draw();
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    };
    
    
    return layer;
};
//                                                                          マップ
;  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
  	  /*Work in progress for webworker
  	  var builder = new Worker("../src/layer/builder.js");
  	  builder.onmessage = function(e) {
		  console.log('Message received from worker', e.data.aap);
	  };
	  var obj = {project:'noot'}; 
  	  builder.postMessage(obj);
  	  console.log('Message posted to worker');
  	  */
  	  config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _data = [];                         
	  layer.zindex = 100; //vectors always on top
	  var _duration = config.duration || 0;
	  var _path;
	  var _projection;
	  var style = config.style || {};
	  var labelStyle = config.labelStyle || {};
	  var _events = config.events;   
	  
      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) {
            _data = array;
            draw(false);
        }
      });
      
      Object.defineProperty(layer, 'events', {
        get: function() {
            return _events;
        },
        set: function(array) {
            _events = array;
        }
      });
      
      
      
      //Function taken from terraformer
      function ringIsClockwise(ringToTest) {
		var total = 0,i = 0;
		var rLength = ringToTest.length;
		var pt1 = ringToTest[i];
		var pt2;
		for (i; i < rLength - 1; i++) {
		  pt2 = ringToTest[i + 1];
		  total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
		  pt1 = pt2;
		}
		return (total >= 0);
	  }
      
      function setStyle(d){
      	  var entity = d3.select(this);
      	  //Do generic layer style
      	  if (style){
      	  	  for (var key in style) { 
      	  	  	  entity.select('path').style(key, style[key]);
      	  	  }
      	  }
      	  
      	  //Now use per-feature styling
      	  if (d.style){
      	  	  for (var key in d.style) { 
      	  	  	  entity.select('path').style(key, d.style[key]);
      	  	  }
      	  }
      	  if (d._selected){
      	  	  //make halo around entity to show as selected
      	  	  entity
      	  	  	.append('path').attr("d", _path)
      	  	  	.style('stroke', 'none')
      	  	  	.style('fill', 'red')
      	  	  	.classed('halo', true);
      	  }
      	  else {
      	  	  entity.selectAll('.halo').remove();
      	  }
      }
      
      function build(d){
      	  var project = _projection;
      	  if (d.geometry.type == 'Point' && d.style && d.style['marker-url']){
      	  	  var x = project(d.geometry.coordinates)[0];
              var y = project(d.geometry.coordinates)[1];
              var img = d3.select(this).append("image")
              	.attr("width", 32)
                .attr("height", 37)
              	//.attr("x",x-12.5) //No need setting x and y, since it's reset later
				//.attr("y",y-25)
				.attr("xlink:href", function(d){
					return d.style['marker-url'];
				});
      	  }
      	  else {
			  if (d.geometry.type == 'Polygon' && !ringIsClockwise(d.geometry.coordinates[0])){
				  d.geometry.coordinates[0].reverse(); 
			  }
			  d3.select(this).append('path').attr("d", _path)
				.classed(name, true);
		  }
		  d3.select(this).append('text')
		  	.classed('shadowtext',true)
		  	.attr('text-anchor',"middle");
		  d3.select(this).append('text')
		  	.classed('vectorLabel',true)
		  	.attr('text-anchor',"middle");
		  
      }
      
      var draw = function(rebuild){
      	  if (config.reproject){
				_projection = layer.map.projection;
				_path = d3.geo.path()
					.projection(_projection)
					.pointRadius(function(d) {
						if (d.style && d.style.radius){
							return d.style.radius;
						}
						else {
							return 4.5;
						}
					});
		  }
		  else {
				_projection = d3.geo.mercator()
					.scale(1 / 2 / Math.PI)
					.translate([0, 0]);
				_path = d3.geo.path()
					.projection(_projection);
		  }
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data, function(d){
          	return d.id;
          });
          
          var newentity = entities.enter().append('g')
          	.classed('entity',true)
          	.attr('id',function(d){
                    return 'entity'+ d.id;
            });
          newentity.each(build);
          newentity.each(setStyle);
            
          entities.exit().remove();
          
          // Add events from config
          if (_events){
              _events.forEach(function(d){
                 newentity.select('path').on(d.event, d.action);
                 newentity.select('image').on(d.event, d.action);
              });
          }
          layer.refresh(rebuild?0:_duration);
      };
      
      var calcwidth = d3.scale.linear().range([5,5,32,32]).domain([0,21,24,30]);
      var calcheight = d3.scale.linear().range([5,5,37,37]).domain([0,21,24,30]);
      
      var refresh = function(duration){
          var drawboard = layer.drawboard;
          drawboard.style('opacity', this.opacity).style('display',this.visible ? 'block':'none');
          if (layer.visible){
          	  var entities = drawboard.selectAll('.entity');
			  if (config.reproject){//the slow way
			  	  var project = layer.map.projection;
				  entities.select('path').transition().duration(duration).attr("d", _path);
				  entities.select('image').transition().duration(duration)
				  	.attr('x',function(d){return project(d.geometry.coordinates)[0] - 12.5;})
				  	.attr('y',function(d){return project(d.geometry.coordinates)[1] - 15;})
				  	//Smaller markers when zooming out
				  	.attr("width", calcwidth(layer.map.zoom))
				  	.attr("height", calcheight(layer.map.zoom));
				  if (config.labelfield){
				  	  //no text beyond zoom 22
				  	  if (layer.map.zoom < 22){
				  	  	  entities.selectAll('text').text('');
				  	  }
				  	  else {
						  entities.each(function(d){
							var loc = _path.centroid(d);
							var text = d.properties[config.labelfield];
							d3.select(this).selectAll('text')
								.attr('x',loc[0])
								.attr('y', loc[1] -20)
								.text(text);
							//Style text
							for (var key in labelStyle) { 
								  d3.select(this).selectAll('text').style(key, labelStyle[key]);
							}
							//Add shadow text for halo
							d3.select(this).select('.shadowtext')
								.style('stroke-width','2.5px')
								.style('stroke','white')
								.style('opacity', 0.8);
						  });
				  	  }
				  }
				  entities.each(setStyle);
			  }
			  else {
				//based on: http://bl.ocks.org/mbostock/5914438
				var zoombehaviour = layer.map.zoombehaviour;
				//FIXME: bug in chrome? When zoomed in too much, browser tab stalls on zooming. Probably to do with rounding floats or something..
				drawboard
				  .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
				  .style("stroke-width", 1 / zoombehaviour.scale());
			  }
          }
          else {
          	  drawboard.selectAll('.entity').remove();
          }
      };
      
      var addFeature = function(feature){
      	  var replaced = false;
		  //Testing with d3.map to make it faster      	  
      	  var _datamap = d3.map(_data, function(d) { return d.id; });
      	  _datamap.set(feature.id, feature);
      	  _data = _datamap.values();
      	  //TODO: this is an expensive iteration when the amount of data increases
      	  //Make it cheaper.
      	  /*
      	  _data.forEach(function(d){
			  if (d.id == feature.id){
				  d = feature;
				  layer.draw();
				  replaced = true;
				  return;
			  }
      	  });
      	  if (!replaced){
      	  	  _data.push(feature);
      	  }*/
      	  layer.draw(true);
      };
      
      var removeFeature = function(feature){
      	  var idx = null;
      	  _data.forEach(function(d,i){
			  if (d.id == feature.id){
				  idx = i;
			  }
      	  });
      	  _data.splice(idx,1);
      	  layer.draw();
      };
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      layer.addFeature = addFeature;
      layer.removeFeature = removeFeature;
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  ;  /**
	 
  **/
  d3.mappu.VectorTileLayer = function(name, config){
      return d3_mappu_VectorTileLayer(name, config);
  };
  
  d3_mappu_VectorTileLayer = function(name, config) {
  	  
  	  config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vectortile';
      var _url = config.url;
                               
	  var _duration = config.duration || 0;
	  var _path;
	  var _projection;
	  var style = config.style || {};
      
	  Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      	
      //each tile can be considered it's own drawboard, on which we build
      function build(d){
      	var tile = d3.select(this);
		var url = "http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-highroad/" + d[2] + "/" + d[0] + "/" + d[1] + ".json";
		_projection = d3.geo.mercator();
		_path = d3.geo.path().projection(_projection);
		this._xhr = d3.json(url, function(error, json) {
			
			//TODO: okay... now how to get this geometry aligned correctly in the tile....
			//all coordinates have to end up between 0 and 1
			var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
			_path.projection()
			  	.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0�,0�] in pixels
				.scale(k / 2 / Math.PI);
			
			var features = json.features;
			var entities = tile.selectAll('path').data(features, function(d){
				return d.id;
			});
			var newentity = entities.enter().append('path')
				.attr('id',function(d){
						return 'entity'+ d.id;
				})
				.attr('class',function(d){return d.properties.kind;})
				.style('stroke-width',1)
				.style('fill','none')
				.style('fill-opacity',0.5)
				.attr("d", _path);
			entities.exit().remove();
		});
      }
    
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         var zoombehaviour = layer.map.zoombehaviour;
         
         drawboard.transition().duration(_duration)
         	.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
         	.style("stroke-width",1/ zoombehaviour.scale()*100);
         	
         
         var image = drawboard
         	//.style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))//?? Is this needed?
         	.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         if (layer.visible){
         	 var scale = 1/256;
         	 var tile = imageEnter.append("g")
				  .attr("class", "tile")
				  .attr("transform", function(d){
		 			return "translate(" + d[0] + " " +d[1]+")scale("+scale+")"
		 		  });
			 tile.each(build);
         }
         image.exit()
         	.remove();
      };
      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
      };
      
      
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_VectorTileLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  ;  /**
	 
  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };
  
  d3_mappu_RasterLayer = function(name, config) {
      var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'raster';
      
      var _url = config.url;
      var _ogc_type = config.ogc_type || 'tms';
      var _options = config; //Te be leaflet compatible in g-layercatalogus
      layer.options = _options;
      layer.visibility = layer.visible; //leaflet compat
      var _layers = config.layers;
      var _duration = 0;
      
      
      Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      
      Object.defineProperty(layer, 'layers', {
        get: function() {
            return _layers;
        },
        set: function(val) {
            _layers = val;
            draw();
        }
      });
      
      
      //Clear all tiles
      layer.clear = function(){
      };
      
      var getbbox = function(d){
        var numtiles = 2 << (d[2]-1);
        var tilesize = (20037508.34 * 2) / (numtiles);
        var x = -20037508.34 + (d[0] * tilesize);
        var y = 20037508.34 - ((d[1]+1) * tilesize);//shift 1 down, because we want LOWER left
        var bbox = x + ","+ y + "," + (x + tilesize) + "," + (y + tilesize);
        return bbox;
      };
     
      var tileurl = function(d){
          var url;
          if (_ogc_type == 'tms') {
              url = _url    
				.replace('{s}',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('{z}',d[2])
				.replace('{x}',d[0])
				.replace('{y}',d[1])
				//FIXME: why are these curly brackets killed when used with polymer?                    
				.replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 3 | 0])
				.replace('%7Bz%7D',d[2])
				.replace('%7Bx%7D',d[0])
				.replace('%7By%7D',d[1]);
          }
          else if (_ogc_type == 'wmts'){
          	  //TODO: working on this
          	  /*
          	http://services.geodan.nl/wmts?UID=99c2ec22c262
          		&SERVICE=WMTS
          		&REQUEST=GetTile
          		&VERSION=1.0.0
          		&LAYER=buurtkaart
          		&STYLE=default
          		&TILEMATRIXSET=nltilingschema
          		&TILEMATRIX=04&TILEROW=10&TILECOL=10
          		&FORMAT=image%2Fpng
          	*/
          	url = _url + '?' + 
          		"&layer=" + _layers + 
          		"&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&TILEMATRIXSET=nltilingschema&TILEMATRIX="+d[2]+ "&TILEROW="+d[1]+"&TILECOL="+d[0]+"&FORMAT=image%2Fpng";
      	  }
          else if (_ogc_type == 'wms'){
			//This calculation only works for tiles that are square and always the same size
			var bbox = getbbox(d);
			url =  _url + '?' +  
				 "&bbox=" + bbox + 
				 "&layers=" + _layers + 
				 "&service=WMS&version=1.1.0&request=GetMap&tiled=true&styles=&width=256&height=256&srs=EPSG:3857&transparent=TRUE&format=image%2Fpng";
          }
          else if(_ogc_type == 'esri'){
          	  var bbox = getbbox(d);
          	  url = _url + '?' + 
          	  	"f=image" +
          	  	"&transparent=true"+
          	  	"&format=png8" +
          	  	//"&layers=show:1,3" +
          	  	"&bbox=" + bbox +
          	  	"&bboxSR=102100" +
          	  	"&imageSR=102100" +
          	  	"&size=256,256";
          }
          return url;
      };
      
      var getFeatureInfo = function(d){
          //return; /* WORK IN PROGRESS */
          var loc = d3.mouse(this);
          var loc2 = d3.mouse(map.mapdiv);
          if (_ogc_type == 'wms'){
            //http://pico.geodan.nl/geoserver/pico/wms?
            //REQUEST=GetFeatureInfo
            //&EXCEPTIONS=application%2Fvnd.ogc.se_xml
            //&BBOX=144587.40296%2C458169.888794%2C146661.115594%2C460572.017456
            //&SERVICE=WMS&INFO_FORMAT=text%2Fhtml&QUERY_LAYERS=pico%3Apc6_energieverbruik_alliander&FEATURE_COUNT=50&Layers=pico%3Apc6_energieverbruik_alliander
            //&WIDTH=442&HEIGHT=512&format=image%2Fpng&styles=&srs=EPSG%3A28992&version=1.1.1&x=243&y=190
            //TODO: make this more flexible
            var url = _url +
                "?SRS=EPSG:900913" + 
                "&QUERY_LAYERS=" + _layers +
                "&LAYERS=" + _layers + 
                "&INFO_FORMAT=application/json" + 
                "&REQUEST=GetFeatureInfo" + 
                "&FEATURE_COUNT=50" + 
                "&EXCEPTIONS=application/vnd.ogc.se_xml" + 
                "&SERVICE=WMS" + 
                "&VERSION=1.1.0" + 
                "&WIDTH=256&HEIGHT=256" + 
                "&X="+ Math.round(loc[0]) + 
                "&Y="+ Math.round(loc[1]) + 
                "&BBOX=" + getbbox(d);
            d3.json(url, function(error,response){
                var feat = response.features[0];
                //TODO: check if there is a response
                //TODO: show more than 1 response
                d3.select('#map').append('div').classed('popover', true)
                    .style('left', loc2[0]+'px')
                    .style('top', loc2[1]+'px')
                    .html(feat.id); 
            });
            
          }
          if (_ogc_type == 'esri'){
          	  //TODO: work in progress
          	  /* Example:
          	  http://myserver/rest/services/StateCityHighway/MapServer/identify?
				geometryType=esriGeometryPoint&geometry={�x�: -
				120,�y�:40}&tolerance=10&mapExtent=-119,38,-
				121,41&imageDisplay=400,300,96&f=json
			  */
			  var url = _url.replace('export','identify') +
			  	"?geometryType=esriGeometryPoint" +
			  	"&geometry={'x': " + Math.round(loc[0]) + ",'y':" + Math.round(loc[1]) + "}" +
			  	"&tolerance=10" + 
			  	"&mapExtent=-119,38,-121,41" +
			  	"&imageDisplay=256,256,96&f=json";
			  d3.json(url, function(error,response){
			  	if (error || response.error){
			  		console.warn(error || response.error); 
			  	}
			  	console.log(response);
                var feat = response.results[0];
                //TODO: check if there is a response
                //TODO: show more than 1 response
                d3.select('#map').append('div').classed('popover', true)
                    .style('left', loc2[0]+'px')
                    .style('top', loc2[1]+'px')
                    .html(feat.id); 
              });
          }
      };
      
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         drawboard.transition().duration(_duration).attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")");
         var image = drawboard.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         if (layer.visible){
         imageEnter.append("image")
              .classed('tile',true)
              .attr("xlink:href", tileurl)
              .attr("width", 1)
              .attr("height", 1)
              .attr('opacity', this.opacity)
              .attr("x", function(d) { return d[0]; })
              .attr("y", function(d) { return d[1]; })
              //TODO: working on this
              //.on('click', getFeatureInfo);
         }
         image.exit()
         	//First set the link emty to trigger a load stop in the browser
         	.attr("xlink:href", '')
         	.remove();
      };
      
      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
      };
      
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  ;"use strict";
d3.mappu.Controllers = function(map) {
    return d3_mappu_Controllers(map);
};

d3_mappu_Controllers = function(map){
    var drag = d3.behavior.drag()
        .on('drag',function(e){
            console.log('Drag', d3.mouse(this));
        })
        .on('dragend',function(e,d){
            console.log('Dragend',d3.mouse(this)); 
        });
        
    map.svg.call(drag);
};;/**
 //TODO: write doc
**/


"use strict";
d3.mappu.Coordinates = function(config) {
    return d3_mappu_Coordinates(config);
};

d3_mappu_Coordinates = function(config){
    var tool = {};
    
    tool.addTo = function(map){
        var coordsdiv = d3.select(map.mapdiv).append('div').classed('coordinates',true);

        map.svg.on('mousemove', function(e){
            var loc = d3.mouse(this);
            var crds = map.projection.invert(loc);
            coordsdiv.html('lat: ' + Math.round(crds[0] * 100) / 100 + '| lon: ' + Math.round(crds[1] * 100) / 100);
        });
    };
    return tool;
};