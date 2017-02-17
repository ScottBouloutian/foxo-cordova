#!/bin/sh

bower install
mkdir -p www/bower/js www/bower/css www/bower/fonts

# Copy app.js
cp bower_components/appjs/dist/app.min.js www/bower/js
cp bower_components/appjs/dist/app.min.css www/bower/css

# Copy crafty
cp bower_components/crafty/dist/crafty-min.js www/bower/js

# Copy zepto
( cd bower_components/zeptojs ; npm install ; npm run-script dist )
cp bower_components/zeptojs/dist/zepto.min.js www/bower/js

# Copy Ionicons
cp bower_components/Ionicons/css/ionicons.min.css www/bower/css
cp bower_components/Ionicons/fonts/* www/bower/fonts
