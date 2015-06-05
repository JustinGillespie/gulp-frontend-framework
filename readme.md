
Gulp Frontend Framework
==========

This is under active development.


Getting Started
------------
Make a fresh build when you first install:

    gulp build

Run the default command to launch server and track all the development files

    gulp


<br>

Using Gulp
------------

### View all available tasks
    gulp help
    
Running the gulp help task will list all available tasks you can run along with a description of what it does.

### Default Task

    gulp

Running the default task automatically watches your project folders for any changes and runs the accompanying task. For example, if you've elected to run tasks on your JavaScript, anytime you change a JavaScript file gulp will automatically run those tasks, including a browser refresh if you've included BrowserSync.

### CSS

    gulp styles

Running the gulp styles task will run your selected CSS tasks once.

### Javascript
	
	gulp modernizr
	
	gulp jquery

    gulp scripts

Running the gulp scripts task will run your selected JavaScript tasks once.

### Gulp Images

    gulp images

Running the gulp images task will run your selected image tasks once.
