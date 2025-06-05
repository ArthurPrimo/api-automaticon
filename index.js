require('dotenv').config();
const express = require('express');
const Sensor = require('./Models/Sensor.js');
const Acionador = require('./Models/Acionador.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Arthur");
  console.log("Rota base chamada");
});

// Atualizar valor do sensor
app.post("/sensor/:deviceID/:sensor", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const sensorName = req.params.sensor;
  const { valor } = req.body;

  if (!sensorName || isNaN(deviceID) || valor === undefined) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    const [updated] = await Sensor.update(
      { valor, dataAtt: new Date() },
      { where: { deviceID, sensor: sensorName } }
    );

    if (updated === 0) {
      return res.status(404).json({ erro: "Sensor não encontrado para atualizar" });
    }

    console.log(`Post: DeviceId: ${deviceID} / sensor: ${sensorName} / valor: ${valor}`);
    console.log('----------------------------------------------------------------------');
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ erro: "Erro ao atualizar sensor" });
  }
});

// Consultar valor do sensor
app.get("/sensor/:deviceID/:sensor", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const sensorName = req.params.sensor;

  if (!sensorName || isNaN(deviceID)) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    const sensor = await Sensor.findOne({ where: { deviceID, sensor: sensorName } });
    if (!sensor) {
      return res.status(404).json({ erro: "Sensor não encontrado" });
    }

    res.json({ valor: sensor.valor });
    console.log(`Get: DeviceId: ${deviceID} / sensor: ${sensorName} / valor: ${sensor.valor}`);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ erro: "Erro na consulta" });
  }
});

// Consultar todos sensores
app.get("/sensor", async (req, res) => {
  try {
    const sensores = await Sensor.findAll();

    const resultado = {};
    sensores.forEach(s => {
      resultado[s.sensor] = s.valor;
    });

    res.json(resultado);
    console.log("Get sensores:", resultado);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ erro: "Erro na consulta" });
  }
});

// Atualizar estado do acionador
app.post("/acionador/:deviceID/:nome", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const nome = req.params.nome;
  const { estado } = req.body;

  if (!nome || isNaN(deviceID) || estado === undefined) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    const [updated] = await Acionador.update(
      { estado, dataAtt: new Date() },
      { where: { deviceID, nome } }
    );

    if (updated === 0) {
      return res.status(404).json({ erro: "Acionador não encontrado para atualizar" });
    }

    console.log(`Post Acionador: DeviceId: ${deviceID} / nome: ${nome} / estado: ${estado}`);
    console.log('----------------------------------------------------------------------');
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ erro: "Erro ao atualizar estado" });
  }
});

// Consultar estado do acionador
app.get("/acionador/:deviceID/:nome", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const nome = req.params.nome;

  if (!nome || isNaN(deviceID)) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    const acionador = await Acionador.findOne({ where: { deviceID, nome } });
    if (!acionador) {
      return res.status(404).json({ erro: "Acionador não encontrado" });
    }

    res.json({ estado: acionador.estado });
    console.log(`Get Acionador: DeviceId: ${deviceID} / nome: ${nome} / estado: ${acionador.estado}`);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ erro: "Erro na consulta" });
  }
});

// Consultar todos acionadores
app.get("/acionador", async (req, res) => {
  try {
    const acionadores = await Acionador.findAll();

    const resultado = {};
    acionadores.forEach(a => {
      resultado[a.nome] = a.estado;
    });

    res.json(resultado);
    console.log("Get acionadores:", resultado);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ erro: "Erro na consulta" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
