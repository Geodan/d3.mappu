/**
 Generic layer object, to be extended.
**/
(function(){
  "use strict";
/*
  public vars:
*/
    data: [Geojson]     default = null;
    opacity: int        default = 1;
    visible: boolean    default =  true;
  
  
/*
    functions exposed:
*/
//getters/setters
    .id(int)
    .data([Geojson])

//singulars  
    .draw() 
    .refresh() 
    
    

/*    
functions private:
*/
    _onAdd(map Object){} //Adds the layer to the given map object 
    _onRemove(){} //Removes the layer from the map object
    



