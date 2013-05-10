var document = window.document;
exports.searchTab = function() {
	var li = document.createElement("li");
	li.setAttribute("data-id", "search");
	var a = document.createElement("a");
	var span = document.createElement("span");
	span.innerText = "Search";
	a.appendChild(span);
	li.appendChild(a);
	return li;
};

exports.searchPage = function() {
	var article = document.createElement("article");
	article.setAttribute("id", "search");
	var header = document.createElement("header");
	var h3 = document.createElement("h3");
	h3.textContent = "Search results";
	var section = document.createElement("section");
	section.setAttribute("id", "searchcontent");
	var footer = document.createElement("footer");
	header.appendChild(h3);
	article.appendChild(header);
	article.appendChild(section);
	article.appendChild(footer);
	return article;
};

exports.sideBar = function(feedsList, callback) {
	var feedKit = window.localRequire("js/feed.js");
	var sideNodes = {
		root: document.createDocumentFragment(),
		"@after": document.createDocumentFragment()
	};

	function header(data) {
		var element = document.createDocumentFragment();
		var ul = document.createElement("ul");
		ul.setAttribute("id", feedKit.feedId(data));
		ul.setAttribute("class", "hidden subchild");
		var li = document.createElement("li");
		li.setAttribute("class", "header");
		li.setAttribute("data-header", feedKit.feedId(data));
		var span = document.createElement("span");
		span.innerText = data["text"];
		var arrow = document.createElement("span");
		arrow.setAttribute("class", "arrow")
		arrow.innerText = ">";
		li.appendChild(span);
		li.appendChild(arrow);
		element.appendChild(li);
		element.appendChild(ul);
		return element;
	}

	function side(data) {
		var li = document.createElement("li");
		li.setAttribute("data-id", feedKit.feedId(data));
		var a = document.createElement("a");
		var span = document.createElement("span");
		span.innerText = data["text"];
		a.appendChild(span);
		li.appendChild(a);
		return li;
	}

	function append(secondPass) {
		for (var attr in sideNodes) {
			if (attr !== "root") {
				if (attr === "@after" && secondPass) {
					sideNodes.root.appendChild(sideNodes[attr]);
				} else if(attr !== "@after") {
					sideNodes.root.appendChild(sideNodes[attr]);
					delete sideNodes[attr];
				}
				// if (category.category === "root") {
				// 	sideNodes.root.appendChild(sideNodes[attr]);
				// 	delete sideNodes[attr];
				// } else {
				// 	sideNodes[category.category].childNodes[1].appendChild(sideNodes[attr]);
				// 	delete sideNodes[attr];
				// }
			}
		}
	}
	for (var i = 0; i < feedsList.length; i++) {
		var feed = feedsList[i];
		if (feed.outline) {
			var result = header(feed);
			sideNodes[feedKit.feedId(feed)] = header(feed);
			exports.sideBar(feed.outline, function(result) {
				sideNodes[feedKit.feedId(feed)].childNodes[1].appendChild(result);
			});
		} else {
			var result = side(feed);
			sideNodes["@after"].appendChild(result);
		}
	}
	append();
	append(true);
	callback(sideNodes.root);
	// var mainAside = document.getElementById("mainAside");
	// mainAside.insertBefore(sideNodes.root, mainAside.firstChild);
};