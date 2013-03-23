var $slideshow; 

$(document).ready( function(){
   $slideshow = $('#slideshow'); // select the slideshow widget's container
	/*
	Attach the tileOpen event to the container. This event will be added to this element
	once the plugin has been initialized on it.
	*/
   $slideshow.bind( 'tileOpen', tileOpenHandler ); 
	
   // initialize the plugin, with some custom options
   var myOptions = { columns:2, tileWidth:160, tileHeight:120, tilePadding:1, closeSpeed:400 };
   $slideshow.shufflingTiles(myOptions);
});

/**
 * This function will be called every time a tile in the slideshow open's. It selects the
 * next tile to be opened, then clicks on it after waiting 3 seconds.
 * event: a standard jQuery event object
 * gridState: a custom Shuffling Tiles event object, with useful info on the grid's state
 */
function tileOpenHandler( event, gridState ){ 
   var currentTile, nextTile;
   currentTile = gridState.selectedTile.replace( 'tile', '' ); // eg 'tile1'
   currentTile = parseInt(currentTile.replace( 'tile', '' )); // get just the number eg 1

   nextTile = ( currentTile === 5 )? '.tile1' : '.tile' + (currentTile + 1);
   nextTile = $( nextTile, $slideshow );
   setTimeout( function(){ nextTile.click(); }, 3000 ); 
}
