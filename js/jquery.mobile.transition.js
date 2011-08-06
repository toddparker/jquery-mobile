/*!
 * jQuery Mobile v@VERSION
 * http://jquerymobile.com/
 *
 * Copyright 2010, jQuery Project
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

(function( $, window, undefined ) {

function css3TransitionHandler( name, reverse, $to, $from ) {

	var deferred = new $.Deferred(),
		reverseClass = reverse ? " reverse" : "",
		viewportClass = "ui-mobile-viewport-transitioning viewport-" + name,
		$both = $to.add( $from ),
		doneTimer = 0;
		var doneFunc = function() {
			if ( doneTimer ) {
				clearTimeout( doneTimer );
				doneTimer = 0;
			}

			if ( $from ) {
				$from.removeClass( $.mobile.activePageClass );
			}

			$to.addClass( $.mobile.activePageClass );

			$both.removeClass( "out in reverse animate " + name );

			$to.parent().removeClass( viewportClass );

			deferred.resolve( name, reverse, $to, $from );
		};

	// Set up a callback on the to element so we know when it
	// is done transitioning. Some transitions don't actually
	// animate the to element, so we also fire a timer to manually
	// trigger our done callback .

	$to.transitionComplete( doneFunc );

	doneTimer = setTimeout(function() {
		if( $.support.cssTransitions ) {
			$to.unbind( "transitionend webkitTransitionEnd OTransitionEnd", doneFunc );
		}
		doneFunc();
	}, 1000);

	$to.parent().addClass( viewportClass );

	if ( $from ) {
		$from.addClass( name + " out" + reverseClass );
	}
	$to.addClass( name + " in" + reverseClass );

	setTimeout(function(){
		$both.addClass("animate");
	}, 25);

	return deferred.promise();
}

// Make our transition handler public.
$.mobile.css3TransitionHandler = css3TransitionHandler;

// If the default transition handler is the 'none' handler, replace it with our handler.
if ( $.mobile.defaultTransitionHandler === $.mobile.noneTransitionHandler ) {
	$.mobile.defaultTransitionHandler = css3TransitionHandler;
}

})( jQuery, this );
