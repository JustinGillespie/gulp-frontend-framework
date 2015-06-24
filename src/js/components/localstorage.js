
module.exports = function() {

	function set(key, value) {
		localStorage.setItem(key, value);
	}

	function get(key) {
		return localStorage.getItem(key);
	}

	function clear() {
		localStorage.clear();
	}

	return {
		set   : set,
		get   : get,
		clear : clear
	};
}();