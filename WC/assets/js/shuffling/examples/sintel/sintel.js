var $sintel, $lightBox;
 $(document).ready( function(){
	$sintel = $('#sintel'); //select the widget's target
	//initialize the widget with custom options
	$sintel.shufflingTiles({ tileWidth:284, tileHeight:256, tilePadding:6 });
	//Attach tileOpen & tileClose event to the container.
	$sintel.bind( 'tileClose tileOpen', tileEventHandler ); 
	
	// create a basic image gallery (tile 4)
	$( '#gallery img' ).click(showImage);
	$lightBox = $('<div id="lightBox"></div>').width($sintel.width()).height($sintel.height()).hide();
	$lightBox.append('<a href="javascript:void(0)" class="closeBtn" >&#215;</a>');
	$lightBox.append('<img src="../help/images/loading.gif" class="loader" />');
	$( '.closeBtn', $lightBox ).click(hideImage);
	$sintel.append($lightBox);	
});

/**
 * This function is called every time a tile opens or closes. The function is used to
 * automatically stop or close the video, if the tile that's opening or closing is tile 3
 * (Preview). the code is for both a HTML5 & flash fallback video.
 * event: a standard jQuery event object
 * gridState: a custom Shuffling Tiles event object, with useful info on the grid's state
 */
function tileEventHandler( event, gridState ){
	var selected, nextTile, type, htmlVideo, flashVideo;
	type = event.type;
	selected = gridState.selectedTile;
	
	if( selected === 'tile3' ){
		htmlVideo = document.getElementById('trailer');	 	 
		flashVideo = window['flashTrailer'] || document['flashTrailer'];
		
		if( htmlVideo && htmlVideo.play ){
			if( type === 'tileClose' ){
				htmlVideo.pause();
			}else if( type === 'tileOpen' ){ 
				htmlVideo.play();
			}
		}else if( flashVideo && flashVideo.stopVideo ){ 
			if( type === 'tileClose' ){
				flashVideo.stopVideo();
			}else if( type === 'tileOpen' ){ 
				flashVideo.playVideo();
			}			
		}
	} 
}

// shows a larger pop-up image when a gallery item is clicked
function showImage(){
	var src, img;
	$lightBox.fadeIn();
	$('#sintel .tile4 .closeBtn').hide();
	src = $(this).attr('src').replace( '_th', '' );
	img = new Image();
	
	$(img).load( function(){
			var $img = $(this);		
			$( 'img', $lightBox ).replaceWith($img);						
			$img.css({ marginTop: ($lightBox.height() - $img.height()) / 2 + 'px', marginLeft: ($lightBox.width() - $img.width()) / 2 + 'px' });
			$img.hide().fadeIn();
		}).attr( 'src', src );
}

// closes a gallery popup image
function hideImage(){
	$lightBox.fadeOut();
	$('#sintel .tile4 .closeBtn').show();
	$( 'img', $lightBox ).replaceWith( $('<img src="../help/images/loading.gif" />') );
}