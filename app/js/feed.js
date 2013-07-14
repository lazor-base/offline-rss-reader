var fs = require("fs");

exports.getFeed = function(url, callback) {
	"use strict";
	exports.needUpdate(url, function(needUpdate) {
		if (needUpdate) {
			download(url, function(requestObject) {
				processFeed(requestObject, callback);
			});
		} else {
			exports.getUnread(url, callback);
		}
	});
};

function download(url, callback) {
	"use strict";
	var network = localRequire("js/network.js");
	network.addToStack(url, "GET", callback);
}

function processFeed(requestObject, callback) {
	"use strict";
	var conversion = localRequire("js/conversion.js");
	conversion.fromString(requestObject.content, function(result) {
		if (!result.channel && (!result.author && !result.entry)) {
			console.error(requestObject.content, requestObject.url, requestObject.headers, requestObject.status);
		} else {
			exports.openFeed(requestObject.url, function(feed) {
				if (feed) {
					feed = exports.mergeFeed(JSON.parse(feed), result);
				} else {
					feed = result;
				}
				feed = exports.orderFeed(feed, requestObject.url);
				// exports.saveFeed(requestObject.url, JSON.stringify(feed), function() {
				// 	exports.getUnread(requestObject.url, callback);
				// });
			});
		}
	});
}

exports.orderFeed = function(feed, url) {
	"use strict";
	if (feed.channel && feed.channel.item) {
		if(!Array.isArray(feed.channel.item)) {
			// sometimes the feed just gets sent as an object if there is only one item (If there is no items then there is no "item" array)
			feed.channel.item = [feed.channel.item];
		}
		feed.channel.item.sort(function(a, b) {
			a = new Date(a.pubDate);
			b = new Date(b.pubDate);
			return a > b ? -1 : a < b ? 1 : 0;
		});
	}
	if (feed.entry) {
		feed.entry.sort(function(a, b) {
			a = new Date(a.updated);
			b = new Date(b.updated);
			return a > b ? -1 : a < b ? 1 : 0;
		});
	}
	return feed;
};

exports.needUpdate = function(url, callback) {
	"use strict";
	var network = localRequire("js/network.js");
	network.addToStack(url, "HEAD", function() {
		//check if file exists and whatnot
		callback(true);
	});
};

exports.mergeFeed = function(newFeed, oldFeed) {
	"use strict";
	var combinedFeed = oldFeed;
	var dates = [];
	if (newFeed.channel && newFeed.channel.item) {
		if (!combinedFeed.channel.item) {
			combinedFeed.channel.item = [];
		}
		for (var i = 0; i < oldFeed.channel.item.length; i++) {
			var newItem = oldFeed.channel.item[i];
			dates.push(newItem.pubDate);
		}
		for (var e = 0; e < newFeed.channel.item.length; e++) {
			var oldItem = newFeed.channel.item[e];
			if (dates.indexOf(oldItem.pubDate) === -1) {
				combinedFeed.channel.item.push(oldItem);
			}
		}
	}
	if (newFeed.entry) {
		if (!combinedFeed.entry) {
			combinedFeed.entry = [];
		}
		for (var i = 0; i < oldFeed.entry.length; i++) {
			var newItem = oldFeed.entry[i];
			dates.push(newItem.updated);
		}
		for (var e = 0; e < newFeed.entry.length; e++) {
			var oldItem = newFeed.entry[e];
			if (dates.indexOf(oldItem.updated) === -1) {
				combinedFeed.entry.push(oldItem);
			}
		}
	}
	return combinedFeed;
};

exports.getUnread = function(url, callback) {
	"use strict";
	var id = exports.feedId(url);
	var item;
	exports.openFeed(url, function(feed) {
		if (feed) {
			feed = JSON.parse(feed);
			exports.openReadData(function(readData) {
				var unread = [];
				var read = [];
				if (feed && readData) {
					readData = JSON.parse(readData);
					if (readData[id]) {
						for (var i = 0; i < feed.channel.item.length; i++) {
							item = feed.channel.item[i];
							if (readData[id].indexOf(item.pubDate) > -1) {
								read.push(item.pubDate);
							} else {
								unread.push(item.pubDate);
							}
						}
					}
				}
				if (!unread.length && !read.length && feed.channel) {
					if (feed.channel.item) {
						for (var e = 0; e < feed.channel.item.length; e++) {
							item = feed.channel.item[e];
							unread.push(item.pubDate);
						}
					}
				}
				if (!unread.length && !read.length && (feed.author || feed.entry)) {
					if (feed.entry) {
						for (var e = 0; e < feed.entry.length; e++) {
							item = feed.entry[e];
							unread.push(item.updated);
						}
					}
				}
				callback({
					unread: unread,
					read: read,
					feed: feed.channel
				});
			});
		} else {
			console.error("no feed", url);
		}
	});
};

exports.isUnread = function(id, date, callback) {
	"use strict";
	exports.openReadData(function(readData) {
		if (!readData) {
			callback(false);
		} else {
			readData = JSON.parse(readData);
			if (!readData[id]) {
				callback(false);
			} else {
				if (readData[id].indexOf(date) > -1) {
					callback(true);
				} else {
					callback(false);
				}
			}
		}
	});
};

exports.openReadData = function(callback) {
	"use strict";
	var path = "content/readFeeds.json";
	fs.exists(path, function(exists) {
		if (!exists) {
			callback(false);
			return false;
		}
		fs.readFile(path, 'utf8', function(err, data) {
			if (err) {
				console.error(err.message, err.stack);
				callback(false);
			} else {
				callback(data);
			}
		});
	});
};

exports.openFeed = function(url, callback) {
	"use strict";
	var path = "content/feeds/" + exports.feedId(url) + ".json";
	fs.exists(path, function(exists) {
		if (!exists) {
			// console.error("Cannot find", path);
			callback(false);
			return false;
		}
		fs.readFile(path, 'utf8', function(err, data) {
			if (err) {
				console.error(err.message, err.stack);
				callback(false);
			} else {
				callback(data);
			}
		});
	});
};

exports.getAllFeeds = function(callback) {
	"use strict";
	exports.getLocalFeeds(function(data) {
		look(data, callback);
	});

	function look(list, callback) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].xmlUrl) {
				exports.getFeed(list[i].xmlUrl, callback);
			} else {
				look(list[i].outline, callback);
			}
		}
	}
};

exports.getMissingFeeds = function(callback) {
	"use strict";
	exports.getLocalFeeds(function(data) {
		look(data, callback);
	});

	function look(list, callback) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].xmlUrl) {
				check(list[i].xmlUrl)
			} else {
				look(list[i].outline, callback);
			}
		}
	}

	function check(url) {
		var path = "content/feeds/" + exports.feedId(url) + ".json";
		fs.exists(path, function(exists) {
			if (!exists) {
				exports.getFeed(url, callback);
			}
		});
	}
};


exports.getLocalFeeds = function(callback) {
	"use strict";
	fs.exists("content/feeds.json", function(exists) {
		if (!exists) {
			console.error("No feeds imported.");
			return false;
		}
		fs.readFile("content/feeds.json", 'utf8', function(err, data) {
			if (err) {
				console.error(err.message, err.stack);
			} else {
				try {
					data = JSON.parse(data);
				} catch (e) {
					console.log(e, data);
				}
				callback(data.body.outline);
			}
		});
	});
};

exports.getRemoteFeed = function(url, callback) {
	"use strict";
	var conversion = localRequire("js/conversion.js");
	conversion.fromUrl(url, function(jsonObject, url) {
		var jsonString = JSON.stringify(jsonObject);
		callback(url, jsonString);
	});
};

exports.addFeed = function() {
	"use strict";

};

exports.saveFeed = function(url, jsonString, done) {
	"use strict";
	var savePath = "content/feeds/" + exports.feedId(url);
	fs.writeFile(savePath + ".json", jsonString, "utf8", function(err) {
		if (err) {
			console.error(err);
		} else {
			console.log("saved feed", url);
			if (typeof done === "function") {
				done();
			}
		}
	});
};

exports.verifyFeed = function(url, jsonString, update, noUpdate) {
	"use strict";
	var network = localRequire("js/network.js");
	var feed = JSON.parse(jsonString);
	var path = "content/feeds/" + exports.feedId(url);
	fs.exists(path, function(exists) {
		if (exists) {
			fs.stat(path, function(err, stat) {
				console.log(stat.mtime, feed.date, url);
				if (stat.mtime !== feed.date) {
					network.addToStack(url, "GET", update);
				} else {
					noUpdate(url, jsonString);
				}
			});
		} else {
			network.addToStack(url, "GET", update);
		}
	});
};

exports.exportFeeds = function() {
	"use strict";
};

exports.feedId = function(feed) {
	"use strict";
	if (typeof feed === "string") {
		return feed.replace(/[^a-zA-Z ]/g, "");
	}
	if (feed.xmlUrl) {
		return feed.xmlUrl.replace(/[^a-zA-Z ]/g, "");
	} else {
		return feed.text.replace(/[^a-zA-Z ]/g, "");
	}
};

exports.quarantine = function(url) {
	"use strict";
	fs.exists("content/feeds.json", function(exists) {
		if (!exists) {
			console.error("No feeds imported.");
			return false;
		}
		fs.readFile("content/feeds.json", 'utf8', function(err, data) {
			if (err) {
				console.error(err.message, err.stack);
			} else {
				try {
					data = JSON.parse(data);
				} catch (e) {
					console.log(e, data);
				}
				if (!data.quarantine) {
					data.quarantine = [];
				}
				var feedItem;
				var outline = data.body.outline;
				for (var i = 0; i < outline.length; i++) {
					var point = outline[i];
					if (point.outline) {
						for (var e = 0; e < point.outline.length; e++) {
							var newPoint = point.outline[e];
							if (newPoint.xmlUrl === url) {
								feedItem = point.outline.splice(e, 1);
								e = point.outline.length;
								i = outline.length;
							}
						}
					} else {
						if (point.xmlUrl === url) {
							feedItem = outline.splice(i, 1);
							i = outline.length;
						}
					}
				}
				console.log(feedItem)
				data.quarantine.push(feedItem);
				fs.writeFile("content/feeds.json", JSON.stringify(data), function(err) {
					if (err) {
						console.error(err);
					}
				});
			}
		});
	});
};