const express = require("express");
const config = require("./config");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post("/discord/:channel", (req, res) => {
	let channel = config.channels[req.params.channel];

	if (!channel) {
		res.writeHead(404);
		res.end();
		return;
	}

	if (req.get("authentication") !== channel.authentication) {
		res.writeHead(504);
		res.end("bad authentication");
		return;
	}

	if (!req.body) {
		res.writeHead(400);
		res.end("bad data");
		return;
	}

	axios({
		method: "post",
		url: channel.url,
		data: req.body
	}).then(proxyres => {
		res.writeHead(proxyres.status, proxyres.statusText, proxyres.headers);
		res.end();
	});
});

app.post("/errors", (req, res) => {
	let channel = config.channels.errors;

	if (!channel) {
		res.writeHead(404);
		res.end();
		return;
	}

	if (req.query.auth !== channel.authentication) {
		res.writeHead(504);
		res.end();
		return;
	}

	if (!req.body || !req.body.hash || !req.body.error || !req.body.stack || !req.body.realm || !req.body.os) {
		res.writeHead(400);
		res.end();
		return;
	}

	axios.post(channel.url, {
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