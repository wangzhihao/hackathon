// A $( document ).ready() block.
$( document ).ready(function() {
	$(".sc-mobile-icon.sc-menu-trigger.sc-snes-top-a").on('click', function(){
		$("#spaui").toggleClass("hack_animate");
	});

	$("#amazon-sort").on('click', function() {
		$("#amazon-list").toggleClass("sorted");
	});
});
