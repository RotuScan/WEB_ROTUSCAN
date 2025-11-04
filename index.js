// index.js (versão final — com seed completo de ingredientes e alérgenos)
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

// ----- Associações -----
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
// Sincroniza DB + seed inicial
// ----------------------------
(async () => {
  try {
    await connection.sync({ force: false });
    console.log("✅ Banco sincronizado com sucesso.");

    // --- Seed de alérgenos ---
    const alergenosPadrao = [
      "Ovos", "Leite", "Aditivos alimentares", "Sacarose", "Frutose",
      "Lactose", "Glúten", "Alimentos vegetais", "Farinhas e grãos",
      "Refrigerantes", "Café e chocolate", "Trigo", "Soja",
      "Amendoim e oleaginosas", "Crustáceos", "Peixes", "Sem alergênicos"
    ];
    for (const nome of alergenosPadrao) {
      await Alergenicos.findOrCreate({ where: { nome } });
    }
    console.log("✅ Seed de alérgenos concluído.");

    // --- Seed de ingredientes (ampliado) ---
    const seed = [
      { nome: "Clara de ovo", descricao: "Derivado de ovo", alergeno: "Ovos" },
      { nome: "Gema de ovo", descricao: "Derivado de ovo", alergeno: "Ovos" },
      { nome: "Leite integral", descricao: "Produto lácteo", alergeno: "Leite" },
      { nome: "Queijo", descricao: "Produto fermentado do leite", alergeno: "Leite" },
      { nome: "Lactose", descricao: "Açúcar do leite", alergeno: "Lactose" },
      { nome: "Soro de leite", descricao: "Subproduto lácteo", alergeno: "Lactose" },
      { nome: "Glutamato monossódico", descricao: "Realçador de sabor", alergeno: "Aditivos alimentares" },
      { nome: "Corante artificial", descricao: "Aditivo alimentar", alergeno: "Aditivos alimentares" },
      { nome: "Açúcar refinado", descricao: "Sacarose comum", alergeno: "Sacarose" },
      { nome: "Xarope de milho", descricao: "Fonte de frutose", alergeno: "Frutose" },
      { nome: "Farinha de trigo", descricao: "Contém glúten", alergeno: "Farinhas e grãos" },
      { nome: "Cevada", descricao: "Grão que contém glúten", alergeno: "Glúten" },
      { nome: "Trigo duro", descricao: "Variedade de trigo", alergeno: "Trigo" },
      { nome: "Aveia", descricao: "Grãos com possível contaminação por glúten", alergeno: "Farinhas e grãos" },
      { nome: "Tomate", descricao: "Ingrediente vegetal", alergeno: "Alimentos vegetais" },
      { nome: "Soja verde", descricao: "Produto vegetal", alergeno: "Alimentos vegetais" },
      { nome: "Ácido fosfórico", descricao: "Usado em refrigerantes", alergeno: "Refrigerantes" },
      { nome: "Aromatizante de cola", descricao: "Aditivo de refrigerante", alergeno: "Refrigerantes" },
      { nome: "Cacau", descricao: "Ingrediente de chocolate", alergeno: "Café e chocolate" },
      { nome: "Café torrado", descricao: "Ingrediente de bebida", alergeno: "Café e chocolate" },
      { nome: "Soja em pó", descricao: "Derivado da soja", alergeno: "Soja" },
      { nome: "Óleo de soja", descricao: "Óleo vegetal", alergeno: "Soja" },
      { nome: "Amendoim torrado", descricao: "Oleaginosa comum", alergeno: "Amendoim e oleaginosas" },
      { nome: "Avelã", descricao: "Oleaginosa (castanha)", alergeno: "Amendoim e oleaginosas" },
      { nome: "Camarão", descricao: "Crustáceo comum", alergeno: "Crustáceos" },
      { nome: "Lagosta", descricao: "Crustáceo", alergeno: "Crustáceos" },
      { nome: "Salmão", descricao: "Peixe de água salgada", alergeno: "Peixes" },
      { nome: "Atum", descricao: "Peixe de água salgada", alergeno: "Peixes" },
      { nome: "Arroz integral", descricao: "Ingrediente neutro", alergeno: "Sem alergênicos" },
    ];

    for (const item of seed) {
      const [ing] = await Ingredientes.findOrCreate({
        where: { nome: item.nome },
        defaults: { descricao: item.descricao },
      });

      const alerg = await Alergenicos.findOne({ where: { nome: item.alergeno } });
      if (alerg) {
        await ingredientesAlergenicos.findOrCreate({
          where: { ingredienteId: ing.id, alergenoId: alerg.id },
          defaults: { ingredienteId: ing.id, alergenoId: alerg.id },
        });
      }
    }

    console.log("✅ Seed de ingredientes e relações concluído.");
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
