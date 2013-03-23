;(function( $ ){
"use strict";
/*jslint white: true, browser: true, devel: false, windows: false, debug: false, vars: false, indent: 4 */
/*global jQuery, Rainbow, $slideshow, $teamwork, $sintel, tileOpenHandler */
var lastPage, grids;

/**
 * Gets and sets the default/current options for a grid, and adds them to the form used to edit it. 
 * @param String page The page number, eg 3-1
 */
	function setDefaults( page ){	
		var $form, $gridNode, $tileNodes, settings;
		$gridNode = $( '#grid' + page );
		settings = $gridNode.data('data').settings;
		$form = $( '#form' + page );
		
		$( ':input', $form).each( function(){
			var key, value;
			key = this.name;
			value = this.value; 
			
			if( $.inArray( key, [ 'tileWidth', 'tileHeight', 'tilePadding', 'openSpeed', 'closeSpeed' ] ) > -1 ){
				$( 'input[name=' + key + ']', $form ).val(settings[key]);
			}else if( $.inArray( key, [ 'columns', 'tileOverflow', 'animationEasing', 'layout', 'deepLinking' ] ) > -1 ){
				$( 'input[name=' + key + ']', $form ).filter('input[value=' + settings[key] + ']').attr('checked','checked');
			}else if( key === 'tileCount' ){
				$( 'input[name=tileCount]', $form ).val( $gridNode.data('data').grid.classIds.length );
			}		
		});

		$tileNodes = $gridNode.children();		
		$tileNodes.each( function( i, tileNode ){
							if( $( '.flyout-subheading', tileNode ).length === 1 ){
								$( 'input[name=flyouts]', $form ).val( $('input[name=flyouts]').val() + '.tile' + (i + 1) + ' ' );
							}
							if( $(tileNode).hasClass('wide-tile') ){
								$( 'input[name=widePages]', $form ).val( $('input[name=widePages]').val() + '.tile' + (i + 1) + ' ' );
							}
							if( $(tileNode).hasClass('open-tile') ){
								$( 'input[name=openPages]', $form ).val( $('input[name=openPages]').val() + '.tile' + (i + 1) + ' ' );
							}
						});	
	}

/**
 * Updates a grid's initialization code example whenever it's edit form is submitted.
 * @param Object customConfig An object containing key-value pairs of form data/ initialization options
 * @param String page The page number, eg 3-1
 */
	function setCode( customConfig, page ){
		var output, $target, $form, defaultConfig;
		$target = $( '#code' + page );
		$form = $( '#form' + page );
		output = [];
		defaultConfig = {	tileWidth: 256, tileHeight: 240, tilePadding: 3, 
							layout: 'fixed', columns: 3, tileOverflow: 'visible', 
							openSpeed: 2400, closeSpeed: 1200, animationEasing: 'swing', 
							deepLinking: false  };
		
		$.each( customConfig, function( key, value ){ 
			var type, $input;
			
			$input = $( 'input[name=' + key + ']', $form );
			if( $input.length === 0 || $input.attr('type') === 'hidden' ){
				return true;
			}
			
			if( page === '2' && defaultConfig[key] === value ){
				return true;
			}
			
			type = typeof value;
			if( type === 'string' ){
				value = "'" + value + "'";
			}	
			
			output.push( key + ': ' + value ); 
		}); 
		
		if( page === '2' ){
			if( output.length === 0 ){
				output = "$('#myContainer').shufflingTiles();\n";
			}else {
				output = '\n         ' + output.join(', \n         ');
				output = 'var myConfig = {' + output + '\n   };\n';
				output += "$('#myContainer').shufflingTiles(myConfig);\n";
			}
		}else{
			output = "$('#myContainer').shufflingTiles( { " + output.join(', ') +  " } );\n";
		}		
		
		Rainbow.color( output, 'javascript', function(highlighted_code) {
			$target.html(highlighted_code);
		});
	}

/**
 * Reload the grid, with new user initialization settings from its edit form.
 * @param String page The page number, eg 3-1
 */
	function updateGrid( page ){ 
		var customConfig, fields, $gridNode, selected, scroll, $tileNodes;
		$gridNode = grids['grid' + page].clone();
		$tileNodes = $gridNode.children();
		customConfig = {};
		fields = $( ":input", '#form' + page ).serializeArray() || [];
		selected = $( '#grid' + page ).data('data').grid.selectedTile;
		scroll = $(window).scrollTop();

		$.each( fields, function(){ 
			var key, value;
			key = this.name;
			value = this.value;
			
			if( key === 'subheadingType' ){
				if( value === 'normal' ){
					$( '.subheading', $gridNode ).removeClass('flyout');
				}else if( value === 'flyout' ){
					$( '.subheading', $gridNode ).addClass('flyout');			
				}		
			}else if( key === 'widePages' ){
				$tileNodes.removeClass('wide-tile'); 
				value = value.replace(/\.\w+(\d)/g, "article:nth-child($1)");
				$( value, $gridNode ).addClass('wide-tile');
			}else if( key === 'openPages' ){
				$tileNodes.removeClass('open-tile'); 
				value = value.replace(/\.\w+(\d)/g, "article:nth-child($1)");
				$( value, $gridNode ).addClass('open-tile');
			}else if( key === 'flyouts' ){
				$( '.subheading', $gridNode ).removeClass('flyout'); 
				value = value.replace(/\.\w+(\d)/g, "article:nth-child($1)");
				$( value, $gridNode ).addClass('open-tile');						
			}else if( key === 'tileCount' ){
				value = ( isNaN(value) || value > 6 )? 6 : ( value < 1 )? 1 : value;
				customConfig[key] = value;
			}else if( key === 'deepLinking' ){
				value = ( value === 'true' )? true: false;
				customConfig[key] = value;
			}else if( $.inArray( key, [ 'tileWidth', 'tileHeight', 'tilePadding', 'columns', 'openSpeed', 'closeSpeed' ] ) > -1 ){
				customConfig[key] = parseInt( value, 10 );
			}else if( $.inArray( key, [ 'tileOverflow', 'animationEasing', 'layout' ] ) > -1 ){
				customConfig[key] = value;
			}
		});
		
		selected = $( '#grid' + page ).data('data').grid.selectedTile || 'tile' + Math.floor( Math.random() * 6 + 1 );
		$( '#grid' + page ).replaceWith($gridNode);
		$( 'input[name="gridWidth"]', '#form' + page ).each( function(){
						$gridNode.css( 'width', $(this).val() + 'px' );
					});
		$gridNode.shufflingTiles(customConfig);
		setCode( customConfig, page );
		
		if( $.inArray( page, [ '3-2-3' ] ) > -1 ){
			if( !selected ){ 
				selected = 'tile' + Math.floor( Math.random() * 6 + 1 ); 
			}
			$( '.' + selected, $gridNode ).click();	
		}
		
		$("html").scrollTop(scroll);
	}

/**
 * Main navigation. Event handler for link clicks of main menu item.
 * @param Object event The jQuery event object.
 */
	function onMenuClick( event ){ 
		var activePath, destination, $target, $menuItems, video;
		$target = $(event.target);
		$menuItems = $( 'a', '#mainMenu' );
		
		$( 'img.active', '#mainMenu' ).each( function(){ $(this).attr( 'src', $(this).attr('src').replace( '.', '_off.' )).removeClass('active'); } );
		$menuItems.removeClass('active');
		
		destination = $target.attr('href');
		activePath = $target.data('path');
		$menuItems.each( function(){
							var path, show, $node, $parentNode, $img;
							$node = $(this);
							$parentNode = $node.parent();
							
							if( destination === $node.attr('href') ){
								show = true;
								$node.addClass('active'); 
								$img = $( 'a[href="#page' + activePath[0] + '"] img', '#mainMenu' );
								$img.attr( 'src', $img.attr('src').replace( /(_off)+/, '' ) ).addClass('active');
							}else {
								path = $(this).data('path');
								if( path.length === 1 ){
									show = ( activePath[0] === path[0] )? true : false;											
								}else  if( path.length === 2 ){
									show = ( activePath[0] === path[0] )? true : false;											
								}else { 
									show = ( activePath[0] === path[0] && activePath[1] === path[1]  )? true : false;
								}									
							}
							
							if(show){ 
								$parentNode.fadeIn('slow'); 
							}else if( path.length > 1 ){
								$parentNode.fadeOut();
							}
						});
		$('#pages > article').hide();
		$(destination).fadeIn('slow');

		if( destination === '#page4-1' && $slideshow ){
			$slideshow.bind( 'tileOpen', tileOpenHandler );
			$( '.tile2', $slideshow ).click();
		}else if( lastPage === '#page4-1' ){
			$slideshow.unbind( 'tileOpen', tileOpenHandler );
			$( '.tile3', $slideshow ).click();
		}else if( lastPage === '#page4-3' ){
			video = document.getElementById('trailer');
			if( video ){
				video.pause();
			}else {
				video = window.flashTrailer || document.flashTrailer;
				if( video ){
					video.stopVideo();
				}		
			}
		}
		
		lastPage = destination;
	}

/**
 * Back button support. detects location.hash changes, and updates the page accordingly.
 */
	function onHashChange(){
		var hash = document.location.hash;	
		if( /#page\d/.test(hash) ){
			$( 'a[href="' + hash + '"]', '#mainMenu' ).click();	
		}else if( lastPage && lastPage !== document.location.hash ){
			$( 'a[href="' + lastPage + '"]', '#mainMenu' ).click();
		}
	}

/**
 * Switches tab views. Event handler for a tab link click.
 * @param Object event The standard jQuery event object
 */
	function switchTabs( event ){
		var $tab, $tabsContainer, $content, language;
		$tab = $(event.target).addClass('active');
		$tabsContainer = $tab.parent().parent();
		language = $tab.attr('data-target');
		$content = $( 'pre[data-language="' + language + '"]', $tabsContainer );
		
		$tab.siblings().removeClass('active');
		$( '.tab-content', $tabsContainer ).hide();
		$content.fadeIn();	
	}

/**
 * Checks pjtops.com for any updates to the plugin
 * @param Object event The jQuuery event object.
 */	
	function updates(){
		$('#updateCheck').html('<img src="help/images/loading.gif" /> Checking for updates ...');
		$('#updateCheck').css( { fontSize:'18px', color:'#880000' } );
		$.ajax({url:"http://pjtops.com/envato/shufflingTiles/v1.0.2", 
			dataType: "html", 
			success: function( data ){ console.log(data);
						$('#updateCheck').replaceWith(data);					
						},
			onerror: function(){ $.error( 'Could not connect to the website.' ); }
			});
	}

	$(document).ready( function(){
		var options, $form;
		
		if( document.domain === 'pjtops.com' ){
			$('a[href="#page5"]', '#mainMenu' ).remove();
			
		}
		
		//forms
		grids = {};
		$('form').each( function(){
			var $gridNode = $( '#' + $(this).attr('id').replace( 'form', 'grid' ));
			grids[$gridNode.attr('id')] = $gridNode.clone();
		});
		$("input, select, textarea").attr( 'autocomplete', 'off' );
		$('a.update').click( function(){ updateGrid($(this).attr('data-page')); return false; } );
		
		if( $('body').hasClass('help') ){
			if( !$('html').hasClass('oldIE') ){
			Rainbow.color();
			}		
			
			$('#updateCheck').click(updates);
			
			$('#mainMenu a').each( function(){
										var path = $(this).attr('href').replace( '#page', '' ).split('-');
										$(this).data( 'path', path ).parent().addClass( 'level' + path.length );
										});	
			$( 'a', '#mainMenu' ).click(onMenuClick);
			$('.help #pages > article').hide();
			
			if( !document.location.hash ){ $( "a[href='#page1']", '#mainMenu' ).click(); }
			
			if( typeof(window.onhashchange) !== "undefined" && ( !document.documentMode || document.documentMode > 7 ) ){
				$(window).bind( 'hashchange.shufflingTiles', onHashChange );
			}else{
				$('body').prop( 'hash', document.location.hash );
				setInterval( function(){
								if( $('body').prop('hash') !== document.location.hash ){ onHashChange(); }
								$('body').prop( 'hash', document.location.hash );
							}, 1200 );			
			}
			
			$slideshow.unbind( 'tileOpen', tileOpenHandler );
			$( '.tile3', $slideshow ).click();
			onHashChange();
			
			//tabs
			$('.tabs li').click(switchTabs);	
		
			//page 2
			options = { tileWidth:256, tileHeight:240, tilePadding:3,
						tileOverflow:'visible', columns:3, layout:'fixed', 
						openSpeed:2400, closeSpeed:1200, animationEasing:'swing',
						deepLinking:false, animateTileContent:true
						};
			$('#grid2').shufflingTiles();
			setDefaults('2');
			
			// page 3-1
			$('#grid3-1').shufflingTiles();
			
			// page 3-2-1
			options = { tileWidth:254, tileHeight:150, tilePadding:15 };
			$('#grid3-2-1').shufflingTiles(options);
			$form = $('#form3-2-1');
			$( 'input[name="tileWidth"]', $form ).slider({ from: 0, to: 500,  step: 1,  round: 1 } );
			$( 'input[name="tileHeight"]', $form ).slider({ from: 0, to: 500,  step: 1,  round: 1 });
			$( 'input[name="tilePadding"]', $form ).slider({ from: 0, to: 60,  step: 1,  round: 1 });
			setDefaults('3-2-1');
			
			// page 3-2-2
			options = { tileOverflow:'visible', columns:3, layout:'fixed', tileWidth:254, tileHeight:150 };
			$('#grid3-2-2').shufflingTiles(options);
			$form = $('#form3-2-2');
			$( 'input[name="gridWidth"]', $form ).slider({ from: 0, to: 1360,  step: 160,  round: 1, scale: ['|', '|', 'mobile', '|', 'tablet', '|', '|', 'desktop', '|'] });
			setDefaults('3-2-2');
			
			// page 3-2-3
			options = { openSpeed:3000, closeSpeed:0, animationEasing:'linear', tileWidth:150, tileHeight:150 };
			$('#grid3-2-3').shufflingTiles(options);
			$form = $('#form3-2-3');
			$( 'input[name="openSpeed"]', $form ).slider({ from: 0, to: 6000,  step: 10,  round: 1, scale: ['|', '1s', '2s', '3s', '4s', '5s', '6s'] } );
			$( 'input[name="closeSpeed"]', $form ).slider({ from: 0, to: 6000,  step: 10,  round: 1, scale: ['|', '1s', '2s', '3s', '4s', '5s', '6s'] });
			setDefaults('3-2-3');
			
			// page 3-3
			$('#grid3-3').shufflingTiles({ columns:2, tileWidth:375, tileHeight:160, openSpeed:800, closeSpeed:800 });
			$('#dimensionClasses').click( function(){ $('#grid3-3 .tile3').click(); } );
			
			// page 3-2-4
			$('#grid3-2-4').shufflingTiles({ tileHeight:180 });
			
			// preview2
			
		}
		
	});

}( jQuery ));