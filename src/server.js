const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  // Return the current state
  res.json({ message: "Success!" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
