(function ( window, $ ) {

	// Global container for the game
	SpaceInvaders = {};

	SpaceInvaders.config = {
		width: 800, // screen width
		height: 600, // screen height
		bugWidth: 32,
		leftPadding: 40, // Indicate when bugs will change direction
		topPadding: 80, // Indicate bugs top padding
		horizontalSpeed: 0.5,
		verticalSpeed: 0.05
	};

	SpaceInvaders.points = 0;
	SpaceInvaders.level = 1;
	SpaceInvaders.invaders = []; // Collection of live bugs
	SpaceInvaders.moveRight = true; // Current bugs movement direction
	SpaceInvaders.ship = null; // Main ship object
	SpaceInvaders.play = false; // Game status - indicate if play process is active
	SpaceInvaders.pressedKeys = []; // Pressed keys collection in real time
	
	/**
	 * Generate 3 types of invaders on screen
	 */
	SpaceInvaders.generateInvaders = function() {
		this.play = true;
		var bugTypes = [ "squid", "fat", "slim", "slim" ];
		var topPadding = this.config.topPadding;
		var leftPadding = 150;
		for( var i = 0; i < 4; i++ ) {
			var top = topPadding + ( ( this.config.bugWidth + 20 ) * i );
			for( var j = 0; j < 10; j++ ) {
				var left = leftPadding + ( ( this.config.bugWidth + 20 ) * j );
				var invader = new Invader( bugTypes[i], top, left );
				this.invaders.push( invader );
				invader.get().appendTo( "#screen" );
			}
		}
	};

	/**
	 * Go to next level with twice increased speed
	 */
	SpaceInvaders.startNextLevel = function() {
		this.config.horizontalSpeed *= 2;
		this.config.verticalSpeed *= 2;
		this.level++;
		this.generateInvaders();
	};

	/**
	 * Remove all live invaders
	 */
	SpaceInvaders.destroyAllInvaders = function() {
		var invaderCount = this.invaders.length;

		for (i = 0; i < invaderCount; i++ ) {
			// Remove bug from collection and destroy on UI
			if( this.invaders[i] ) {
				this.invaders[i].destroy();
				this.invaders.splice( i, 1 );
				i--;
			}
		}
	};

	/**
	 * Track pressed keys in real-time to remove keypress delay
	 */
	SpaceInvaders.keyboardTracker = setInterval( function() {
		if( SpaceInvaders.play ) {
			if( SpaceInvaders.pressedKeys[ 37 ] ) {
		    	SpaceInvaders.ship.moveLeft();
		    } else if( SpaceInvaders.pressedKeys[ 39 ] ) {
		    	SpaceInvaders.ship.moveRight();
		    }

		    if( SpaceInvaders.pressedKeys[ 32 ] ) {
		    	SpaceInvaders.ship.fire();
		    }
		}    
	}, 20 );

	/**
	 * Move all invaders into correct direction,
	 * direction is calculated inside
	 */
	SpaceInvaders.moveInvaders = setInterval( function() {
		var invaders = SpaceInvaders.invaders;
		if( invaders && invaders.length ) {
			var nearest = SpaceInvaders.moveRight ? 0 : SpaceInvaders.config.width;

			var shipTop = SpaceInvaders.ship.getTopPosition();
			var shipLeft = SpaceInvaders.ship.getPosition();
			var invaderHeight = invaders[0].getHeight();

			// First find nearest invader to the left/right and bottom edge of the screen
			for (i = 0; i < invaders.length; i++ ) {
				var leftPosition = invaders[i].getLeftPosition();
				var topPosition = invaders[i].getTopPosition();

				if( SpaceInvaders.moveRight ) {				
					if( leftPosition > nearest ) {
						nearest = leftPosition;
					}
				} else {
					if( leftPosition < nearest ) {
						nearest = leftPosition;
					}
				}

				// Check for damage with ship OR with to end of screen
				if( ( leftPosition >= shipLeft && leftPosition <= shipLeft + SpaceInvaders.ship.getWidth()
						&& shipTop <= topPosition + invaderHeight ) ||
						topPosition + invaderHeight > SpaceInvaders.config.height ) {
					SpaceInvaders.play = false;
					SpaceInvaders.destroyAllInvaders();
					switchToWindow( "game-over" );
				}	
			}

			// Check if need to change direction now
			if( SpaceInvaders.config.width - nearest - SpaceInvaders.config.bugWidth < SpaceInvaders.config.leftPadding ) {
				SpaceInvaders.moveRight = false;
			} else if( nearest < SpaceInvaders.config.leftPadding ) {
				SpaceInvaders.moveRight = true;
			}

			// And now move all invaders		
			for (i = 0; i < invaders.length; i++ ) {
				invaders[i].move( SpaceInvaders.moveRight );
			}
		}
	}, 1000 );

	/**
	 * Track active pressed keys
	 */
	$( document ).keydown( function( e ) {
		SpaceInvaders.pressedKeys[ e.keyCode ] = 1;
	});

	/**
	 * Remove key when its up
	 */
	$( document ).keyup( function( e ) {
		SpaceInvaders.pressedKeys[ e.keyCode ] = 0;
	} );

	/**
	 * On Ship Fire event, triggered from Ship
	 * Track for bug destroying
	 * @param left Current left position of shell
	 * @param top  Current top position of shell
	 */
	$( window ).bind( "fire", function( event, left, top ) {
		
		var invaderCount = SpaceInvaders.invaders.length;

		for (i = 0; i < invaderCount; i++ ) {
			var $invader = SpaceInvaders.invaders[i].get();
			var invaderLeft = parseInt( $invader.css( "left" ), 10 );
			var invaderTop = parseInt( $invader.css( "top" ), 10 );

			// Check if shell hitted any bug
			if( left >= invaderLeft && left <= invaderLeft + SpaceInvaders.config.bugWidth
				&& top <= invaderTop && top >= invaderTop - SpaceInvaders.config.bugWidth ) {

				// Stop shell and hide it
				SpaceInvaders.ship.stopShell();

				// Calculate points
				SpaceInvaders.points += SpaceInvaders.invaders[i].getPointCount();
				updatePoints();

				// Remove bug from collection and destroy on UI
				SpaceInvaders.invaders[i].destroy();
				SpaceInvaders.invaders.splice( i, 1 );

				// Stop iteration because one of bugs was destroyed
				break;
			}
		}

		if( SpaceInvaders.invaders.length === 0 ) {
			SpaceInvaders.startNextLevel();		
			updateLevel();
		}
	});

	$( document ).ready( function() {
		// Initialize Ship
		SpaceInvaders.ship = new Ship( "#ship" );
		
		// Initial screen
		switchToWindow( "start-game" );

		// Start game
		$( ".start" ).click( function( e ) {
			switchToWindow( "game" );

			SpaceInvaders.generateInvaders();

			return false;
		});

		// Play again handler
		$( ".play-again" ).click( function( e ) {
			switchToWindow( "game" );

			SpaceInvaders.config.horizontalSpeed = 0.5;
			SpaceInvaders.config.verticalSpeed = 0.05;
			SpaceInvaders.points = 0;
			SpaceInvaders.level = 1;

			updatePoints();
			updateLevel();
			SpaceInvaders.generateInvaders();

			return false;
		});
	});

	/**
	 * Update UI points element
	 */
	function updatePoints() {
		$( "span.points" ).text( SpaceInvaders.points );
	}

	/**
	 * Update UI level element
	 */
	function updateLevel() {
		$( "span.level" ).text( SpaceInvaders.level );
	}

	/**
	 * Switching between game screens
	 * @param view View which needs to be enabled
	 */
	function switchToWindow( view ) {
		switch( view ) {
			case "start-game":
				$( "#ship" ).hide();
				$( ".controls" ).hide();
				$( ".game-over" ).hide();
				$( ".start-game" ).show();
			break;
			case "game-over":
				$( "#ship" ).hide();
				$( ".game-over" ).show();
			break;
			case "game":		
				$( "#ship" ).show();
				$( ".controls" ).show();
				$( ".game-over" ).hide();
				$( ".start-game" ).hide();
			break;
		}
	}

})( window, jQuery );