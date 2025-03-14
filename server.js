import app from "./index.js";

const port = 8080;
app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}.`);
});