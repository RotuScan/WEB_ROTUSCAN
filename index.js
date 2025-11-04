// index.js (versão ajustada)
import express from "express";
const app = express();

import session from "express-session";

// ----- DB / Models -----
import connection from "./config/sequelize-config.js";
import Usuario from "./models/usuario.js";
import Produto from "./models/produtos.js";
import Ingredientes from "./models/ingredientes.js";
import Alergenicos from "./models/alergenicos.js";
import produtosIngredientes from "./models/produtosIngredientes.js";
import ingredientesAlergenicos from "./models/ingredientesAlergenicos.js";

// ----- Associações (executa apenas, sem export necessário) -----
// IMPORTANTE: garanta que ./config/associations.js importe os mesmos paths em minúsculas
import "./config/associations.js";

// ----- Middlewares -----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ----- Sessão -----
app.use(
  session({
    secret: "123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);

// ----- Controllers -----
import UsuarioController from "./controllers/UsuarioController.js";
import ProdutosController from "./controllers/ProdutosController.js";
import AddProdutosController from "./controllers/AddProdutosController.js";
import EditProdutosController from "./controllers/EditProdutosController.js";

app.use("/", UsuarioController);
app.use("/", ProdutosController);
app.use("/", AddProdutosController);
app.use("/", EditProdutosController);

// ----- View engine / static -----
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

// ----------------------------
// Sincroniza DB e (opcional) seed
// ----------------------------
(async () => {
  try {
    // Uma única sincronização centralizada
    await connection.sync({ force: false });
    console.log("✅ Banco sincronizado com sucesso.");

    // Seed leve — só se ainda não existir. Remova se não quiser popular automaticamente.
    const alergenosPadrao = [
      "Ovos","Leite","Aditivos alimentares","Sacarose","Frutose",
      "Lactose","Glúten","Alimentos vegetais","Farinhas e grãos",
      "Refrigerantes","Café e chocolate","Trigo","Soja",
      "Amendoim e oleaginosas","Crustáceos","Peixes","Sem alergênicos"
    ];

    for (const nome of alergenosPadrao) {
      await Alergenicos.findOrCreate({ where: { nome } });
    }

    console.log("✅ Seed de alérgenos (se necessário) executada.");
  } catch (err) {
    console.error("❌ Erro ao sincronizar/seed:", err);
  }
})();

// ----- Inicia servidor -----
const port = 8080;
app.listen(port, function (error) {
  if (error) {
    console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
  } else {
    console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
  }
});
