var router = require('./components/router.js');
module.exports =  function() {

	// Routes go here:

	router.path('/brady', function() {
		console.log('ruff', 'route 1 triggered!')
	});
	
	router.path('/brady/{param}', function(param) {
		console.log('ruff', 'route 2 triggered!')
		console.log('ruff', 'data: ' + param)
	});

} // end of file
