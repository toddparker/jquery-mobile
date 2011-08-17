/*
 * mobile page unit tests
 */
(function($){

	var perspective = "viewport-flip",
			transitioning = "ui-mobile-viewport-transitioning",
			transitionCompleteFn = $.fn.transitionComplete,

			//wipe all urls
			clearUrlHistory = function(){
				$.mobile.urlHistory.stack = [];
				$.mobile.urlHistory.activeIndex = 0;
			};

	function assertActivePage( selector )
	{
		var ap = $( ".ui-page-active" );
		same( ap.length, 1, "only one active page element in the dom" );
ok( true, "active page is " + selector + " -- " + ap[0].className + " -- " + ap[0].id );
		same( ap.is( selector ), true, "active page is " + selector );
	}

	module('jquery.mobile.transition.js', {
		setup: function(){

			if ( location.hash ) {
				stop();
				$( document ).one("changepage", function() {
					start();
				} );
				location.hash = "";
			}

			$.mobile.urlHistory.stack = [];
			$.mobile.urlHistory.activeIndex = 0;
		},
	});

	asyncTest( "transition with no 'to' animation completes", function(){
		$.testHelper.pageSequence([
			function(){
				// Make sure there's only one active page and that it
				// is the first page.
				assertActivePage( "#page-1" );

				// Make sure nothing in the DOM has our animation
				// classes on them.
				same( $( ".in, .out, .animate, .non-existent" ).length, 0, "dom contains no transition animation classes" );

				// Fire-off a change page with a non-existent transition.
				// This will test to make sure that the 
				$.mobile.changePage( "#page-2", { transition: "non-existent" } );

				same( $("#page-1.out.non-existent:not(.animate)").length, 1, "animation 'out' classes placed on 'from' element" );
				same( $("#page-2.in.non-existent:not(.animate)").length, 1, "animation 'in' classes placed on 'to' element" );
			},

			// page is pulled and displayed in the dom
			function(){
				ok(true, "changepage fires ok without any CSS3 transitionend event");

				// Make sure there's only one active page and that it
				// is the 2nd page.
				assertActivePage( "#page-2" );

				// Make sure nothing in the DOM has our animation
				// classes on them.
				same( $( ".in, .out, .animate, .non-existent" ).length, 0, "dom contains no transition animation classes" );

				start();
			}
		]);
	});

	asyncTest( "changePage applys perspective class to mobile viewport for flip", function(){
		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				$( "#page-1 > a#trans-flip" ).click();
				ok( $( "body" ).hasClass( perspective ), "has perspective class" );
			},

			function() {
				assertActivePage( "#page-2" );
				start();
			}
		]);
	});

	asyncTest( "changePage does not apply perspective class to mobile viewport for transitions other than flip", function(){
		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				$( "#page-1 > a#trans-pop" ).click();

				ok( !$( "body" ).hasClass( perspective ), "doesn't have perspective class" );
			},

			function() {
				assertActivePage( "#page-2" );
				start();
			}
		]);
	});

	asyncTest( "changePage applys transition class to mobile viewport for default transition", function(){
		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				$( "#page-1 > a#trans-default" ).click();

				ok( !$( "body" ).hasClass( perspective ), "doesn't have perspective class" );
			},

			function() {
				start();
			}
		]);
	});

	asyncTest( "explicit transition preferred for page navigation reversal (ie back)", function(){
		var p1HashChangeCalled = false,
			p2HashChangeCalled = false;

		function p1HashChangeCallback()
		{
			p1HashChangeCalled = true;

			ok( true, "p1HashChangeCallback notification was triggered" );
			ok( $( "#page-2" ).hasClass( "fade" ), "#page-2 has 'fade' class" );
			ok( $( "#page-1" ).hasClass( "fade" ), "#page-1 has 'fade' class" );
		}

		function p2HashChangeCallback()
		{
			p2HashChangeCalled = true;

			ok( true, "p2HashChangeCallback notification was triggered" );
			ok( $( "#page-3" ).hasClass( "slideup" ), "#page-2 has 'slideup' class" );
			ok( $( "#page-2" ).hasClass( "slideup" ), "#page-1 has 'slideup' class" );
		}

		// The basic idea for this test is to go from page-1 to page-2 with a 'fade'
		// transition, and then from page-2 to page-3 with a 'slideup' transition.
		// We then hit the back button on page-3, to go back to page-2, and then
		// the back button again to go back to page-1, all the while checking to make
		// sure the correct animation classes are being placed on the 'in' and 'out'
		// elements at each step.

		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				ok( !$( "#page-1" ).hasClass( "fade" ), "#page-1 has no 'fade' class" );
				ok( !$( "#page-2" ).hasClass( "fade" ), "#page-2 has no 'fade' class" );

				$( "#page-1 > a#trans-fade" ).click();

				ok( $( "#page-1" ).hasClass( "fade" ), "#page-1 has 'fade' class" );
				ok( $( "#page-2" ).hasClass( "fade" ), "#page-2 has 'fade' class" );
			},

			function() {
				assertActivePage( "#page-2" );

				ok( !$( "#page-1" ).hasClass( "fade" ), "#page-1 has no 'fade' class" );
				ok( !$( "#page-2" ).hasClass( "fade" ), "#page-2 has no 'fade' class" );

				$( "#page-2 > a#p2-trans-slideup" ).click();

				ok( $( "#page-2" ).hasClass( "slideup" ), "#page-2 has 'slideup' class" );
				ok( $( "#page-3" ).hasClass( "slideup" ), "#page-3 has 'slideup' class" );
			},

			function() {
				assertActivePage( "#page-3" );

				ok( !$( "#page-2" ).hasClass( "slideup" ), "#page-2 has no 'slideup' class" );
				ok( !$( "#page-3" ).hasClass( "slideup" ), "#page-3 has no 'slideup' class" );

				// The click on the back button results in history.back() instead
				// of a changePage() call. We need to register a hashchange callback
				// so we get notified after the framework's default hashchange callback which
				// triggers the real changePage() call.
				
				$( window ).bind( "hashchange", p2HashChangeCallback );

				$( "#page-3 > a#page-3-back-btn" ).click();
			},

			function() {
				assertActivePage( "#page-2" );

				$( window ).unbind( "hashchange", p2HashChangeCallback );

				ok ( p2HashChangeCalled, "Back button triggered hashchange notification." );
				ok( !$( "#page-3" ).hasClass( "slideup" ), "#page-3 has no 'slideup' class" );
				ok( !$( "#page-2" ).hasClass( "slideup" ), "#page-2 has no 'slideup' class" );

				// The click on the back button results in history.back() instead
				// of a changePage() call. We need to register a hashchange callback
				// so we get notified after the framework's default hashchange callback which
				// triggers the real changePage() call.
				
				$( window ).bind( "hashchange", p1HashChangeCallback );

				$( "#page-2 > a#page-2-back-btn" ).click();
			},

			function() {
				assertActivePage( "#page-1" );

				$( window ).unbind( "hashchange", p1HashChangeCallback );

				ok ( p1HashChangeCalled, "Back button triggered hashchange notification." );
				ok( !$( "#page-2" ).hasClass( "fade" ), "#page-2 has no 'fade' class" );
				ok( !$( "#page-1" ).hasClass( "fade" ), "#page-1 has no 'fade' class" );

				start();
			}
		]);
	});

	asyncTest( "default transition is slide", function(){
		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				$( "#page-1 > a#trans-default" ).click();

				ok( $( "#page-1" ).hasClass( "slide" ), "default slide class on 'from' element" );
				ok( $( "#page-2" ).hasClass( "slide" ), "default slide class on 'to' element" );
	
				ok( $( "body" ).hasClass( "viewport-slide" ), "default slide class on viewport" );
			},

			function() {
				assertActivePage( "#page-2" );
				ok( !$( "#page-1" ).hasClass( "slide" ), "default slide class removed from 'from' element" );
				ok( !$( "#page-2" ).hasClass( "slide" ), "default slide class removed from 'to' element" );
				ok( !$( "body" ).hasClass( "viewport-slide" ), "default slide class on viewport" );
				start();
			}
		]);
	});

	asyncTest( "changePage queues requests", function(){
		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				// Fire off two changePage() requests.

				$.mobile.changePage("#page-2");
				$.mobile.changePage("#page-3");
			},

			function() {
				// First request has finished.
				assertActivePage( "#page-2" );
			},

			function() {
				// Second request has finished.
				assertActivePage( "#page-3" );
				start();
			}
		]);
	});

	asyncTest( "default transition for dialog is pop", function(){
		$.testHelper.pageSequence([
			function() {
				assertActivePage( "#page-1" );

				$( "#page-1 > a#dialog-link" ).click();

				ok( $( "#page-1" ).hasClass( "pop" ), "default 'pop' class on 'from' element" );
				ok( $( "#page-3" ).hasClass( "pop" ), "default 'pop' class on 'to' dialog element" );
	
				ok( $( "body" ).hasClass( "viewport-pop" ), "default 'pop' class on viewport" );
			},

			function() {
				assertActivePage( "#page-3" );
				ok( !$( "#page-1" ).hasClass( "pop" ), "default pop class removed from 'from' element" );
				ok( !$( "#page-2" ).hasClass( "pop" ), "default pop class removed from 'to' dialog element" );
				ok( !$( "body" ).hasClass( "viewport-pop" ), "default 'pop' class on viewport" );
				start();
			}
		]);
	});

})(jQuery);
