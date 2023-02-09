/*-- ZIPKIN START --*/
const appzip = require('appmetrics-zipkin')({
	host: process.env.ZIPKIN_COLLECTOR_SERVICE_HOST,
	port: process.env.ZIPKIN_COLLECTOR_SERVICE_PORT,
	serviceName: 'zipkin',
	sampleRate: 1.0,
});
/*-- ZIPKIN END --*/

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

app.post('/signup', async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	if (
		!password ||
		password.trim().length === 0 ||
		!email ||
		email.trim().length === 0
	) {
		return res
			.status(422)
			.json({ message: 'Um e-mail e uma senha devem ser informados!' });
	}

	try {
		console.log(hashedPW, email);
		const hashedPW = await axios.get(
			`http://${process.env.AUTH_ADDRESS}/hashed-password/` + password
		);
		console.log(hashedPW, email);
		res.status(201).json({ message: 'Usuário criado!' });
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			message: 'Falha ao criar usuário - por favor tente mais tarde.',
		});
	}
});

app.post('/login', async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	if (
		!password ||
		password.trim().length === 0 ||
		!email ||
		email.trim().length === 0
	) {
		return res
			.status(422)
			.json({ message: 'Um e-mail e uma senha devem ser informados!' });
	}

	const hashedPassword = password + '_hash';
	const response = await axios.get(
		`http://${process.env.AUTH_SERVICE_SERVICE_HOST}/token/` +
			hashedPassword +
			'/' +
			password
	);
	if (response.status === 200) {
		return res.status(200).json({ token: response.data.token });
	}
	return res.status(response.status).json({ message: 'Loggin falhou' });
});
app.get('/starwars', async (req, res) => {
	try {
		const starwars = await axios.get('http://swapi.dev/api/people/');
		console.log(starwars);
		res.status(200).json({ message: 'StarWars api' });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Falha ao buscar api StarWars@' });
	}
});

app.listen(8080);
