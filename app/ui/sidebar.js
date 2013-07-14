var feed = localRequire("js/feed.js");
var uiToolKit = localRequire("js/uiToolKit.js");
// var conversion = localRequire("js/conversion.js");
// conversion.getErrors();

function look(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i]["xmlUrl"]) {
			feed.getFeed(list[i]["xmlUrl"], function(resultObject) {
				console.log(resultObject);
			});
			// feed.getRemoteFeed(list[i]["xmlUrl"], feed.verifyThenSave);
		} else {
			look(list[i].outline);
		}
	}
}
config.loadConfig(function(localConfig) {
	$(function() {
		if (document.getElementById("mainAside")) {
			feed.getLocalFeeds(function(data) {
				uiToolKit.sideBar(data, function(result) {
					var mainAside = document.getElementById("mainAside");
					mainAside.insertBefore(result, mainAside.firstChild);
				});
			});
		}
		$("#mainSection > aside").append(uiToolKit.searchTab());
		$("#mainSection").append(uiToolKit.searchPage());
		//when you click on a header link it collapses that section in the sidebar
		$(document).on("click", "li.header .arrow", function() {
			$(this).parent().toggleClass("open").next().toggleClass("hidden");
		});
		// make the first article visible
		$("article:first-of-type").addClass("visible");
		//when you click on a link in the sidebar, it shows that article
		$("li[data-id]").on("click", function() {
			if ($("#" + $(this).data("id")).hasClass("visible")) {
				return false;
			}
			$("#searchGroup").removeClass("focus");
			$("article.visible").removeClass("visible");
			$("#" + $(this).data("id")).addClass("visible");
		});
		$("#searchBar,li[data-id=search]").on("click", function(event) {
			$("article.visible").removeClass("visible");
			$("#search").addClass("visible");
			$("#searchGroup").addClass("focus");
			$("#searchBar").focus();
		});
	});
});