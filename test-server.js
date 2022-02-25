// - Install node & npm
// - Run: npm i connect serve-static
// - Run: node test-server.js
// - In your browser go to: localhost:9000

const connect = require('connect');
const serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(9000);

console.log('Running on localhost:9000/');