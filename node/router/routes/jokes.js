/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");
var async = require("async");
const axios = require("axios");
const https = require('https');


const agent = new https.Agent({  
	rejectUnauthorized: false
  });
const URL = "https://api.chucknorris.io:443/jokes/random";
var api_joke_id;
var api_joke_text;
var results;
var counter = 3;

module.exports = function () {
	var app = express.Router();

	app.get("/", (req, res) => {
		return res.type("text/plain").status(200).send("Node.js - For Jokes use /jokes");
	});

	app.get("/jokes", (req, res) => {
		function dataAvailable(api_joke_id, api_joke_text, results) {
			if (Array.isArray(results) && results.length) {
				console.info("Result from DB not empty!");
				console.info("API retry counter = " + counter);
				if (counter > 0) {
					counter--;
					getjoke();
				} else {
					res.json("{id: 0, text:No new Jokes available}");
				}
			} else {
				console.info("Result from DB empty!");
				res.json({id: api_joke_id, text: api_joke_text});
			}
		}

		function checkdb(api_joke_id, api_joke_text) {
			let client = req.db;
			async.waterfall([
				function prepare(callback) {
					client.prepare(`SELECT "API_ID" FROM "DB_JOKES" WHERE "API_ID" = (?)`,
						(err, statement) => {
							callback(null, err, statement);
						});
				},
				function execute(err, statement, callback) {
					statement.exec([api_joke_id], (execErr, results) => {
						callback(null, execErr, results);
					});
				},
				function response(err, results, callback) {
					if (err) {
						console.info("SQL error = " + JSON.stringify(err));
						res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
					} else {
						dataAvailable(api_joke_id, api_joke_text, results);
					}
					return callback();
				}
			]);
		}

		function getjoke() {
			axios.get(URL, { httpsAgent: agent })
				.then(response => {
					const data_joke = response.data.value;
					const data_id = response.data.id;
					api_joke_id = data_id;
					api_joke_text = data_joke;
					console.info("API_JOKE_ID = " + api_joke_id);
					checkdb(api_joke_id, api_joke_text);
				})
				.catch(err => {
					console.error(err);
					res.json("Exception: API call failed with error: " + error.toString());
				});
		}
		var isAuthorized = req.authInfo.checkScope('$XSAPPNAME.access');
		if (isAuthorized) {
			console.info("Authorization success. User: " + req.user.id + ", Path: '/jokes'.");
			getjoke();
		} else {
			console.error("Authorization failed. User: " + req.user.id + ", Path: '/jokes'.");
			res.status(403).send('Forbidden');
		}
	});
	return app;
};