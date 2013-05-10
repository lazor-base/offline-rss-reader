$(function(){
	$("article header").on("click",function(event){
		if(event.target.nodeName !== "INPUT") {
			$(this).parent().toggleClass("open");
		}
	});
	$("article input[type=checkbox]").on("click",function(){
		$(this).parent().parent().toggleClass("selected");
	});
});