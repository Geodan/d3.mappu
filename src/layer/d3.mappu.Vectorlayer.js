  /**
	 
  **/
  d3.mappu.Vectorlayer = function(name, config){
      return d3_mappu_Vectorlayer(name, config);
  };
  
  d3_mappu_Vectorlayer = function(name, config) {
      d3_mappu_Layer.call(this,name, config);
      this._layertype = 'vector';
      return d3_mappu_Layer(name, config);
  };
  
  d3_mappu_Vectorlayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  