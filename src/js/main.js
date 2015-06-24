// jQuery
var $ = require('jquery');

// Routing
var router  = require('./components/router.js');
var routes = require('./routes');
router.init(routes);



// Storage
var storage = require('./components/localstorage.js');

// Create links that trigger the router.

$(document).ready( function() {

	$("[data-link]").on('click', function(e) {
		var href = $(this).data('link') || $(this).attr('href');

		if(e.target.nodeName.toLowerCase() === 'a') e.preventDefault();
		router.go(href);
	});
});


