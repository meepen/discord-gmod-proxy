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
		proxyres.pipe(res);
	}).catch(reason => {
		res.writeHead(500, reason.toString());
		res.end();
	});
});

app.listen(config.port);