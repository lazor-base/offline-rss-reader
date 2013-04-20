// var $ = require("./js/jquery-2.0.0-beta3.js");
var gui = require('nw.gui');
var win = gui.Window.get();
var isMaximized = false;
console.log(win)
$(function() {
	$("#showDevTools").on("click", function() {
		win.showDevTools();
	});
	$("#closeWindow").on("click", function() {
		win.close();
	});
	$("#hideWindow").on("click", function() {
		win.minimize();
	});
	$("#reloadWindow").on("click", function() {
		win.reloadIgnoringCache();
	});
	$("#fullWindow").on("click", function() {
		win.toggleFullscreen();
		var self = $(this);
		if (self.text() === "Exit full screen") {
			$(this).text("Full screen");
		} else {
			$(this).text("Exit full screen");
		}
	});
	$("#maxWindow").on("click", function() {
		if (!isMaximized) {
			win.maximize();
			isMaximized = true;
			$(this).text("Unmaximize");
		} else {
			win.unmaximize();
			isMaximized = false;
			$(this).text("Maximize");
		}
	});
});