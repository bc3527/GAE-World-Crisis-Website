var $teamwork;
$(document).ready( function(){
   /* 
   The two initialization options used here are layout and animateTileContent.
   Setting layout to fluid makes the tiles resize and rearrange themselves to fit their
   containers width. animateTileContent specifies exactly which of a tile's content 
   elements can be animated. All are animated by default.
    */
   $teamwork = $('#teamwork').shufflingTiles();
});
