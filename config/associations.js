// config/associations.js
import Ingredientes from "../models/ingredientes.js";
import Alergenicos from "../models/alergenicos.js";
import ingredientesAlergenicos from "../models/ingredientesAlergenicos.js";
import Produto from "../models/produtos.js";
import produtosIngredientes from "../models/produtosIngredientes.js"; // NOTE: caixa minúscula

// Ingredientes ↔ Alergenicos (N:N)
Ingredientes.belongsToMany(Alergenicos, {
  through: ingredientesAlergenicos,
  foreignKey: "ingredienteId",
  otherKey: "alergenoId",
  as: "alergenicos"
});
Alergenicos.belongsToMany(Ingredientes, {
  through: ingredientesAlergenicos,
  foreignKey: "alergenoId",
  otherKey: "ingredienteId",
  as: "ingredientes"
});

// Produtos ↔ Ingredientes (N:N)
Produto.belongsToMany(Ingredientes, {
  through: produtosIngredientes,
  foreignKey: "produtoId",
  otherKey: "ingredienteId",
  as: "ingredientes"
});
Ingredientes.belongsToMany(Produto, {
  through: produtosIngredientes,
  foreignKey: "ingredienteId",
  otherKey: "produtoId",
  as: "produtos"
});

console.log("✅ Associações entre tabelas configuradas com sucesso!");
