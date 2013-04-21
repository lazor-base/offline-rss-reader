var config = window.localRequire("js/config.js");

var buildOptions = function() {
	var document = window.document;
	if(!document.getElementById("asideOptions")) {
		return false;
	}
	var localConfig = config.getConfig();
	var nodes = {
		root: document.createDocumentFragment()
	};

	function header(data) {
		var ul = document.createElement("ul");
		ul.setAttribute("id", data.id);
		var li = document.createElement("li");
		li.setAttribute("class", "header");
		var span = document.createElement("span");
		span.innerText = data.string;
		li.appendChild(span);
		ul.appendChild(li);
		return ul;
	}

	function side(data) {
		var li = document.createElement("li");
		li.setAttribute("id", data.id);
		var a = document.createElement("a");
		var span = document.createElement("span");
		span.innerText = data.string;
		a.appendChild(span);
		li.appendChild(a);
		return li
	}

	function append(useRoot) {
		for (var attr in nodes) {
			if (attr !== "root") {
				var category = config.getCategoryById(attr);
				if (category.category === "root") {
					if (useRoot) {
						nodes.root.appendChild(nodes[attr]);
						delete nodes[attr];
					}
				} else {
					nodes[category.category].appendChild(nodes[attr]);
					delete nodes[attr];
				}
			}
		}
	}

	for (var i = 0; i < localConfig.categories.length; i++) {
		var category = localConfig.categories[i];
		if (category.category === "root") {
			var result = header(category);
		} else {
			var result = side(category);
		}
		nodes[category.id] = result;
	}
	append(false);
	append(true);
	document.getElementById("asideOptions").appendChild(nodes.root);
};

$(function(){
	buildOptions();
});