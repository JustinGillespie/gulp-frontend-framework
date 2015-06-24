var crossroads = require('crossroads');
var hasher     = require('hasher');

module.exports = function() {

	var _routes = {};

	function init(routes) {
		routes();

		for (var key in _routes) {
  			if (_routes.hasOwnProperty(key)) crossroads.addRoute(key, _routes[key] );
		}

		hasher.initialized.add(parseHash); //parse initial hash
		hasher.changed.add(parseHash); //parse hash changes
		hasher.init(); //start listening for history change
		return;
	}

	function parseHash(newHash, oldHash) {
		crossroads.parse(newHash);
	}

	function setHash(hash) {
		hasher.setHash(hash);
	}

	function setRoute(url, cb) {
		_routes[url] = cb;
	}

	function getRoutes() {
		return _routes;
	}

	return {
		init : init,
		go   : setHash,
		path : setRoute,
		all  : getRoutes
	};
}();