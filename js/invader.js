/**
 * Invader object
 * @param type Type of invador, possible values: fat, slim, squid
 * @param x Initial x position
 * @param y Initial y position
 */
var Invader = function( type, x, y ) {
	this.$invader = $( "<div>" ).attr( "class", "bug" + " " + type ).css( {
		left: y,
		top: x
	} );

	this.type = type;
	this.invaiderWidth = 32;
	this.invaiderHeight = 32;

	var invader = this;

	// Set interval 0.5sec for bug animation
	this.animation = setInterval( function() {
		invader.$invader.toggleClass( "animation" );
	}, 500 );
};

Invader.prototype = {

	get: function() {
		return this.$invader;
	},

	getHeight: function() {
		return this.invaiderHeight;
	},

	getLeftPosition: function()	{
		return parseInt( this.$invader.css( "left" ), 10 );
	},

	getTopPosition: function() {
		return parseInt( this.$invader.css( "top" ), 10 );
	},

	/**
	 * Point value of each invader based on it's type
	 */
	getPointCount: function() {
		var types = {
			"squid": 40,
			"fat": 20,
			"slim": 10
		};

		return types[ this.type ];
	},

	/**
	 * Move invader on screen
	 * @param {boolean} moveRight Right Direction or Left direction otherwise
	 */
	move: function( moveRight )
	{
		var invader = this;
		// initial 0.5%
		var moveHorizontalStep = SpaceInvaders.config.width / 100 * SpaceInvaders.config.horizontalSpeed;
		// initial 0.05%
		var moveVerticalStep = SpaceInvaders.config.height / 100 * SpaceInvaders.config.verticalSpeed;

		invader.$invader.css( "top", "+=" + moveVerticalStep );

		if( moveRight ) {
			invader.$invader.css( "left", "+=" + moveHorizontalStep );
		} else {
			invader.$invader.css( "left", "-=" + moveHorizontalStep );
		}
	},

	/**
	 * Destroy DOM element and clear timeouts
	 */
	destroy: function()	{
		var $invader = this.$invader;

		clearTimeout( this.animation );

		$invader.addClass( "killed" );
		$invader.fadeOut( "slow", function() {
			$invader.remove();
		} );
	}
};