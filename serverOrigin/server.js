require("dotenv").config();
const express = require('express');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Configuração da conexão com o banco
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let conexao = null;

// Conexão com reconexão automática
async function conecta() {
  if (!conexao || !conexao.connected) {
    try {
      conexao = await sql.connect(config);
      console.log("Conectado ao banco de dados");
    } catch (e) {
      console.error("Erro ao conectar:", e);
      throw e;
    }
  }
  return conexao;
}

// Ping de manutenção da conexão
function manterConexao() {
  setInterval(async () => {
    try {
      const conn = await conecta();
      await conn.request().query('SELECT 1');
      console.log("Ping: conexão ainda ativa");
    } catch (e) {
      console.error("Erro no ping da conexão:", e);
    }
  }, 5 * 60 * 1000); // A cada 5 minutos
}

// ---------------------- ROTAS ----------------------

app.get("/", (req, res) => {
  res.json("Arthur");
  console.log("Rota base chamada");
});

app.post("/sensor/:deviceID/:sensor", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const sensor = req.params.sensor;
  const { valor } = req.body;

  if (!sensor || isNaN(deviceID) || valor === undefined) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    //await conecta();
    const request = conexao.request();
    request.input('deviceID', sql.Int, deviceID);
    request.input('sensor', sql.VarChar(50), sensor);
    request.input('valor', sql.Float, valor);

    const result = await request.query(`
      UPDATE sensores
      SET valor = @valor,
          dataAtt = (SELECT GETDATE())
      WHERE deviceID = @deviceID AND sensor = @sensor
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: "Sensor não encontrado para atualizar" });
    }

    console.log(`Post: DeviceId: ${deviceID} / sensor: ${sensor} / valor: ${valor}`);
    console.log('----------------------------------------------------------------------');
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro ao atualizar sensor" });
    }
  }
});

app.get("/sensor/:deviceID/:sensor", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const sensor = req.params.sensor;

  if (!sensor || isNaN(deviceID)) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    await conecta();
    const request = conexao.request();
    request.input('deviceID', sql.Int, deviceID);
    request.input('sensor', sql.VarChar(50), sensor);

    const { recordset } = await request.query(`
      SELECT valor 
      FROM sensores 
      WHERE deviceID = @deviceID AND sensor = @sensor
    `);

    if (recordset.length === 0) {
      return res.status(404).json({ erro: "Sensor não encontrado" });
    }

    res.json(recordset[0]);
    console.log(`Get: DeviceId: ${deviceID} / sensor: ${sensor} / valor: ${recordset[0].valor}`);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro na consulta" });
    }
  }
});

app.get("/sensor/", async (req, res) => {
  try {
   // await conecta();
    const request = conexao.request();

    const { recordset } = await request.query(`
      SELECT s.sensor, s.valor
      FROM sensores s
    `);

    const resultado = {};
    recordset.forEach(row => {
      resultado[row.sensor] = row.valor;
    });

    res.json(resultado);
    console.log("Get sensores:", resultado);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro na consulta" });
    }
  }
});

app.post("/acionador/:deviceID/:nome", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const nome = req.params.nome;
  const { estado } = req.body;

  if (!nome || isNaN(deviceID) || estado === undefined) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    await conecta();
    const request = conexao.request();
    request.input('deviceID', sql.Int, deviceID);
    request.input('nome', sql.VarChar(50), nome);
    request.input('estado', sql.Bit, estado);

    const result = await request.query(`
      UPDATE acionadores
      SET estado = @estado,
          dataAtt = (SELECT GETDATE())
      WHERE deviceID = @deviceID AND nome = @nome
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: "Acionador não encontrado para atualizar" });
    }

    console.log(`Post Acionador: DeviceId: ${deviceID} / nome: ${nome} / estado: ${estado}`);
    console.log('----------------------------------------------------------------------');
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro ao atualizar estado" });
    }
  }
});

app.get("/acionador/:deviceID/:nome", async (req, res) => {
  const deviceID = parseInt(req.params.deviceID);
  const nome = req.params.nome;

  if (!nome || isNaN(deviceID)) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  try {
    await conecta();
    const request = conexao.request();
    request.input('deviceID', sql.Int, deviceID);
    request.input('nome', sql.VarChar(50), nome);

    const { recordset } = await request.query(`
      SELECT estado 
      FROM acionadores 
      WHERE deviceID = @deviceID AND nome = @nome
    `);

    if (recordset.length === 0) {
      return res.status(404).json({ erro: "Acionador não encontrado" });
    }

    res.json(recordset[0]);
    const { estado } = recordset[0];
    console.log(`Get Acionador: DeviceId: ${deviceID} / nome: ${nome} / estado: ${estado}`);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro na consulta" });
    }
  }
});

app.get("/acionador", async (req, res) => {
  try {
   // await conecta();
    const request = conexao.request();

    const { recordset } = await request.query(`
      SELECT a.nome, a.estado
      FROM acionadores a
    `);

    const resultado = {};
    recordset.forEach(row => {
      resultado[row.nome] = row.estado;
    });

    res.json(resultado);
    console.log("Get acionadores:", resultado);
    console.log('----------------------------------------------------------------------');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro na consulta" });
    }
  }
});


// Iniciar servidor
(async () => {
  try {
    await conecta();        // Conecta inicialmente
    manterConexao();        // Inicia o ping de manutenção
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (err) {
    console.error("Erro ao conectar com o banco:", err);
  }
})();
