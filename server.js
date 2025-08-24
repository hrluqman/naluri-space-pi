const express = require("express");
const cors = require('cors');
const { port } = require('./src/config');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Success!" });
});

app.listen(port, () => {
  console.log(`Naluri Space Pi server running on port ${port}`);
  console.log('Endpoints: GET /status, POST /control { action: start|pause|stop|reset }');
});
