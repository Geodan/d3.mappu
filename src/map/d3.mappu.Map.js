d3.mappu = d3.mappu || {};
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
    	if (id > -1){
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
