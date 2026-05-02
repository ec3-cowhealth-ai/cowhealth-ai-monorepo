import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (_request, response) => {
    response.json({ message: "A API da CowHealth AI está rodando." });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});