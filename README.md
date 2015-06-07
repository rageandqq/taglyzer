#TagLyzer
A tool to analyze the behaviour of hashtags of incoming tweets in real-time.

##Details
Created using Node.js to stream tweets from Twitter's Public Streaming API.
React.JS is used on the front-end to render incoming data.
Epoch.js is used to chart changing time-series data, and Leaflet+Heatmap.js are used to chart distribution data.
Bootstrap used for styling.

NPM and Gulp are used to script and setup the environment, while Bower and NPM are used for dependency management.

##Installation
After cloning, run `npm run build` and then `npm run start` to launch the server.
Be sure to create a file called `config.js` and store your Twitter credentials there (see `app.js` for the structure).

##License
GNU GPL V3

##Authors
Developed by Sameer Chitley.
