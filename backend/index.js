const express = require("express");
const bodyParser = require("body-parser");
const codeRouter = require("./routes/code");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use("/code", codeRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
