const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const filePath = path.join(__dirname, process.env.TASKS_FOLDER, 'tasks.txt');

const app = express();

app.use(bodyParser.json());

const extractAndVerifyToken = async (headers) => {
	if (!headers.authorization) {
		throw new Error('Token não foi informado.');
	}
	const token = headers.authorization.split(' ')[1];

	const response = await axios.get(
		`http://${process.env.AUTH_ADDRESS}/verify-token/` + token
	);
	return response.data.uid;
};

app.get('/tasks', async (req, res) => {
	try {
		const uid = await extractAndVerifyToken(req.headers);
		fs.readFile(filePath, (err, data) => {
			if (err) {
				console.log(err);
				return res
					.status(500)
					.json({ message: 'Carregamento das tarefas falhou.' });
			}
			const strData = data.toString();
			const entries = strData.split('TASK_SPLIT');
			entries.pop();
			console.log(entries);
			const tasks = entries.map((json) => JSON.parse(json));
			res.status(200).json({ message: 'Tarefas atualizadas', tasks: tasks });
		});
	} catch (err) {
		console.log(err);
		return res
			.status(401)
			.json({ message: err.message || 'Falha ao carregar tarefas.' });
	}
});

app.post('/tasks', async (req, res) => {
	try {
		const uid = await extractAndVerifyToken(req.headers);
		const text = req.body.text;
		const title = req.body.title;
		const task = { title, text };
		const jsonTask = JSON.stringify(task);
		fs.appendFile(filePath, jsonTask + 'TASK_SPLIT', (err) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ message: 'Falha ao armazenar tarefas.' });
			}
			res
				.status(201)
				.json({ message: 'Tarefa armazenada.', createdTask: task });
		});
	} catch (err) {
		return res
			.status(401)
			.json({ message: 'Não foi possível verificar token.' });
	}
});

app.listen(8000);
