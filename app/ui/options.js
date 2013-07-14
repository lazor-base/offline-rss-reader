var config = localRequire("js/config.js");

var buildPage = function() {
	var document = window.document;
	if (!document.getElementById("asideOptions")) {
		return false;
	}
	var localConfig = config.getConfig();
	var sideNodes = {
		root: document.createDocumentFragment()
	};
	var pageNodes = {
		root: document.createDocumentFragment()
	};

	function header(data) {
		var element = document.createDocumentFragment();
		var ul = document.createElement("ul");
		ul.setAttribute("id", data.id);
		var li = document.createElement("li");
		li.setAttribute("class", "header");
		li.setAttribute("data-header", data.id);
		var span = document.createElement("span");
		span.innerText = data.string;
		var arrow = document.createElement("span");
		arrow.setAttribute("class", "arrow");
		arrow.innerText = ">";
		li.appendChild(span);
		li.appendChild(arrow);
		element.appendChild(li);
		element.appendChild(ul);
		return element;
	}

	function side(data) {
		var li = document.createElement("li");
		li.setAttribute("data-id", data.id);
		var a = document.createElement("a");
		var span = document.createElement("span");
		span.innerText = data.string;
		a.appendChild(span);
		li.appendChild(a);
		return li;
	}

	function page(data) {
		var article = document.createElement("article");
		article.setAttribute("id", data.id);
		var header = document.createElement("header");
		var h3 = document.createElement("h3");
		h3.textContent = data.string;
		var section = document.createElement("section");
		section.setAttribute("id", data.id + "content");
		var footer = document.createElement("footer");
		header.appendChild(h3);
		article.appendChild(header);
		article.appendChild(section);
		article.appendChild(footer);
		return article;
	}

	function append(useRoot) {
		for (var attr in sideNodes) {
			if (attr !== "root") {
				var category = config.getCategoryById(attr);
				if (category.category === "root") {
					if (useRoot) {
						sideNodes.root.appendChild(sideNodes[attr]);
						delete sideNodes[attr];
					}
				} else {
					sideNodes[category.category].childNodes[1].appendChild(sideNodes[attr]);
					delete sideNodes[attr];
					pageNodes.root.appendChild(pageNodes[attr]);
					delete pageNodes[attr];
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
			pageNodes[category.id] = page(category);
		}
		sideNodes[category.id] = result;
	}
	append(false);
	append(true);
	var asideOptions = document.getElementById("asideOptions");
	var mainSection = document.getElementById("mainSection");
	asideOptions.insertBefore(sideNodes.root, asideOptions.firstChild);
	mainSection.insertBefore(pageNodes.root, asideOptions.parentNode);
};
var buildOptions = function() {
	var localConfig = config.getConfig();
	var document = window.document;
	var element;
	var nodes = {};
	// accepts a string for header, a node or documentfragment for contentNode, and an optional string for the footer.

	function article(headerText, contentNode, optionalFooter) {
		var article = document.createElement("article");
		var header = document.createElement("header");
		var h4 = document.createElement("h4");
		h4.textContent = headerText;
		header.appendChild(h4);
		var section = document.createElement("section");
		section.appendChild(contentNode);
		var footer = document.createElement("footer");
		if (optionalFooter) {
			footer.textContent = optionalFooter;
		}
		article.appendChild(header);
		article.appendChild(section);
		article.appendChild(footer);
		return article;
	}

	function fileInput(data) {
		var config = localRequire("js/config.js");
		var input = document.createElement("input");
		input.setAttribute("id", data.id);
		input.setAttribute("type", "file");
		input.setAttribute("value", config.getString(data.id));
		return article(data.string, input, data.description);
	}
	for (var i = 0; i < localConfig.configs.length; i++) {
		var configs = localConfig.configs[i];
		if (configs.configType === "toggle") {

		}
		if (configs.configType === "file") {
			if (configs.uiType === "file") {
				element = fileInput(configs);
			}
		}
		if (element) {
			if (!nodes[configs.category]) {
				nodes[configs.category] = document.createDocumentFragment();
			}
			nodes[configs.category].appendChild(element);
		}
	}
	for (var attr in nodes) {
		document.getElementById(attr + "content").appendChild(nodes[attr]);
	}
};
config.loadConfig(function(localConfig) {
	$(function() {
		buildPage();
		buildOptions();
		// make all input fields with type 'file' invisible
		$(':file').each(function() {
			$(this).css({
				'visibility': 'hidden',
				'display': 'none'
			});
			// add a textbox after *each* file input
			$(this).after('<div class="buttonGroup"><button value="' + $(this).attr("value") + '" class="fileChooserButton">' + $(this).attr("value") + '</button><input type="text" readonly="readonly" value="" class="fileChooserText" /></div>');
		});

		// add *click* event to *each* pseudo file button
		// to link the click to the *closest* original file input
		$('.fileChooserButton').click(function() {
			$(this).parent().parent().find(':file').click();
		}).show();

		// add *change* event to *each* file input
		// to copy the name of the file in the read-only text input field
		$(':file').change(function() {
			$(this).parent().parent().find('.fileChooserText').val($(this).val());
		});
		$("#importGoogleFeeds").on("change", function() {
			var config = localRequire("js/config.js");
			var conversion = localRequire("js/conversion.js");
			conversion.fromLocal($(this).val(), config.importGoogleLocal);
		});
	});
});