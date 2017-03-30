// A $( document ).ready() block.
$( document ).ready(function() {

	function removeElement(event) {

		if (event.animationName === 'disapear') {

			event.target.parentNode.removeChild(event.target);
		}
	}

	document.body.addEventListener('animationend', removeElement);
	document.body.addEventListener('webkitAnimationEnd', removeElement);

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
		$("#spaui", window.parent.document).toggleClass("hack_animate");
		e.preventDefault();
	});

	$("#amazon-list .remove").on('click', function(e){
		$(this).closest(".list-group-item").addClass('removed');
		e.preventDefault();
	});

	$("#amazon-sort").on('click', function() {
		$("#amazon-list").toggleClass("sorted");
	});
});
