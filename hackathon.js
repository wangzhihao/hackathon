// A $( document ).ready() block.
$( document ).ready(function() {

	function removeElement(event) {

		if (event.animationName === 'disapear') {

			event.target.parentNode.removeChild(event.target);
		}
	}

	document.body.addEventListener('animationend', removeElement);
	document.body.addEventListener('webkitAnimationEnd', removeElement);

	//update notifictation count
	setInterval(function(){ 
		var count = $("#amazon-list .list-group-item").length;
		if(count == 0){
			$("#sc-snes-number", window.parent.document).hide();
		}else{
			$("#sc-snes-number", window.parent.document).text(count);
			if(!$("#sc-snes-number", window.parent.document).is(":visible"))
				$("#sc-snes-number", window.parent.document).show();
		}
	}, 500);

	$("#take_action").on('click', function(e){
		$("#icpiframe", window.parent.document).fadeOut();
		$("#removaliframe", window.parent.document).fadeIn();
		$("#spaui", window.parent.document).toggleClass("hack_animate");
		e.preventDefault();
	});

	$("#amazon-list .remove button").on('click', function(e){
		$(this).closest(".list-group-item").addClass('removed');
		e.stopPropagation();
	});

	$("#amazon-sort").on('click', function() {
		$("#amazon-list").toggleClass("sorted");
	});
});
