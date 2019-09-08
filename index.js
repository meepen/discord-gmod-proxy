const express = require("express");
const config = require("./config");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post("/", (req, res) => {
	if (req.get("authentication") !== config.authentication) {
		res.writeHead(504);
		res.end("bad authentication");
		return;
	}

	if (!req.body || !req.body.data) {
		res.writeHead(400);
		res.end("bad data");
		return;
	}

	let json;
	try {
		json = JSON.parse(req.body.data);
	}
	catch(E) {
		res.writeHead(400);
		res.end("bad data");
		return;
	}

	axios.post(config.url, json).then(proxyres => {
		res.writeHead(proxyres.status, proxyres.statusText, proxyres.headers);
		res.end();
	}).catch(reason => {
		res.writeHead(500, reason.toString());
		res.end();
	});
});

app.post("/lua", (req, res) => {
	if (!config.lua_url) {
		res.writeHead(404);
		res.end();
		return;
	}

	if (req.query.auth !== config.authentication) {
		res.writeHead(504);
		res.end();
		return;
	}

	if (!req.body || !req.body.hash || !req.body.error || !req.body.stack || !req.body.realm || !req.body.os) {
		res.writeHead(400);
		res.end();
		return;
	}

	axios.post(config.lua_url, {
		embeds: [
			{
				color: 16711680,
				timestamp: 0,
				author: {
					name: "Submitted By: " + req.ip
				},
				title: req.body.realm + " error",
				fields: [
					{
						name: req.body.error,
						value: req.body.stack,
					},
					{
						name: "OS",
						value: req.body.os,
					}
				],
			}
		]
	}).then(proxyres => {
		res.writeHead(proxyres.status, proxyres.statusText, proxyres.headers);
		res.end();
	}).catch(error => {
		res.writeHead(500);
		res.end();
	});

});

app.listen(config.port);