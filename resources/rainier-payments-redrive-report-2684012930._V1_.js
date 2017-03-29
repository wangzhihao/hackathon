jQuery(document).ready(function(){jQuery(".regenerateButton").click(function(){jQuery(this).replaceWith(jQuery(".progressText").html());
jQuery.post("/gp/payments-account/redrive.html",{groupId:jQuery(this).attr("id")});
});
});
