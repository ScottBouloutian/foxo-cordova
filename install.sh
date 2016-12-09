#!/bin/sh

bower install
mkdir -p www/bower

# Copy app.js
cp bower_components/appjs/dist/app.min.js www/bower
cp bower_components/appjs/dist/app.min.css www/bower

# Copy crafty
cp bower_components/crafty/dist/crafty-min.js www/bower

# Copy zepto
( cd bower_components/zeptojs ; npm install ; npm run-script dist )
cp bower_components/zeptojs/dist/zepto.min.js www/bower
