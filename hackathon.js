// A $( document ).ready() block.
$( document ).ready(function() {
	$(".sc-mobile-icon.sc-menu-trigger.sc-snes-top-a").on('click', function(e){
		$("#spaui").toggleClass("hack_animate");
		e.preventDefault();
	});
	$("#spaui-close").on('click', function(e){
		$("#spaui").toggleClass("hack_animate");
		e.preventDefault();
	});

	$("#take_action").on('click', function(e){
		$("#icpiframe", window.parent.document).fadeOut();
		$("#removaliframe", window.parent.document).fadeIn();
		e.preventDefault();
	});
	

	$("#amazon-sort").on('click', function() {
		$("#amazon-list").toggleClass("sorted");
	});
});
