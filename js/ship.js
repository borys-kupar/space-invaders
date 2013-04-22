/**
 * Ship object
 * @param selector HTML Selector for ship object
 */
var Ship = function( selector ) {
	this.$ship = $( selector );
	this.shipWidth = 46;
	this.shipHeight = 26;

	this.$shell = $( ".shell" );
	this.shellFly = false;
	this.shellMove = null;
};

Ship.prototype = {

	getTopPosition: function()	{
		return this.$ship.offset().top;
	},
	
	getPosition: function()	{
		return parseInt( this.$ship.css( "left" ), 10 );
	},

	getWidth: function() {
		return this.shipWidth;
	},

	moveLeft: function() {
		if( this.getPosition() <= 20 ) {
			return false;
		}

		this.$ship.css( "left", "-=5%" );
		return true;
	},

	moveRight: function() {
		if( this.getPosition() >= SpaceInvaders.config.width - this.shipWidth - 20 ) {
			return false;
		}

		this.$ship.css( "left", "+=5%" );
		return true;
	},

	fire: function() {
		if( this.shellFly ) return false;

		var Ship = this;

		// Initiate shell position
		Ship.$shell.css( {
			left: Ship.getPosition() + Ship.shipWidth / 2,
			top: SpaceInvaders.config.height - 30
		} ).show();

		Ship.shellFly = true;

		this.shellMove = setInterval( function() {
			if( parseInt( Ship.$shell.css( "top" ), 10 ) <= 0 ) {
				Ship.stopShell();
			} else {
				Ship.$shell.css( "top", "-=10" );
				$( window ).trigger( "fire", [ parseInt( Ship.$shell.css( "left" ), 10 ), parseInt( Ship.$shell.css( "top" ), 10 ) ] );
			}
		}, 25 );
	},

	stopShell: function() {
		clearTimeout( this.shellMove );
		this.shellFly = false;
		this.$shell.hide();
	}
};