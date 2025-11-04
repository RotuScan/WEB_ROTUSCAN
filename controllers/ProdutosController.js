// controllers/ProdutosController.js
import express from "express";
import { Op } from "sequelize";

import Produto from "../models/produtos.js";
import Usuario from "../models/usuario.js";
import Ingredientes from "../models/ingredientes.js";
import Alergenicos from "../models/alergenicos.js";

const router = express.Router();

// -------------------- Helpers --------------------
function normalizeString(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isSemAlergenico(normalizedName) {
  return normalizedName.includes("sem") && normalizedName.includes("alerg");
}

// -------------------- Rotas --------------------

// Redireciona /produtos/pesquisar -> /produtos?q=...
router.get("/produtos/pesquisar", (req, res) => {
  const q = req.query.q || "";
  res.redirect(`/produtos?q=${encodeURIComponent(q)}`);
});

// Lista produtos (com ingredientes e alérgenos)
router.get("/produtos", async (req, res) => {
  const termoPesquisa = req.query.q || "";
  const whereClause = {};
  if (termoPesquisa) whereClause.nome_gen = { [Op.like]: `%${termoPesquisa}%` };

  try {
    const produtos = await Produto.findAll({
      where: whereClause,
      include: [
        {
          model: Ingredientes,
          as: "ingredientes",
          through: { attributes: [] },
          include: [
            {
              model: Alergenicos,
              as: "alergenicos",
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // busca nomes dos usuários (otimizado: pega apenas os ids presentes)
    const userIds = [...new Set(produtos.map((p) => p.usuario_id_fk).filter(Boolean))];

    const usuarios = userIds.length
      ? await Usuario.findAll({ where: { id: userIds }, attributes: ["id", "nome"], raw: true })
      : [];

    const userMap = {};
    usuarios.forEach((u) => (userMap[u.id] = u.nome));

    // Serializa produtos e calcula aviso de alergênicos
    const produtosComNome = produtos.map((pInstance) => {
      const p = pInstance.get({ plain: true });

      const alergSet = new Set();
      (p.ingredientes || []).forEach((ing) => {
        (ing.alergenicos || []).forEach((a) => {
          const nomeOriginal = (a.nome || "").toString();
          const normalized = normalizeString(nomeOriginal);
          if (!isSemAlergenico(normalized)) alergSet.add(nomeOriginal);
        });
      });

      const alergens = Array.from(alergSet);
      const aviso =
        alergens.length > 0
          ? `Atenção — contém: ${alergens.join(", ")}. Se você tem alergia a qualquer um desses ingredientes, não consuma.`
          : "Sem alergênicos.";

      return {
        ...p,
        nomeCadastrador: p.usuario_id_fk ? userMap[p.usuario_id_fk] || "Não Encontrado" : "Não Registrado",
        aviso,
      };
    });

    const usuarioLogado = req.session.Usuario || null;

    res.render("produtos", {
      produtos: produtosComNome,
      usuarioLogado,
      termoPesquisa,
    });
  } catch (error) {
    console.error(`Erro ao carregar produtos (q=${termoPesquisa}):`, error);
    res.status(500).render("erro", { mensagem: "Não foi possível carregar os produtos. Tente novamente." });
  }
});

// Detalhe do produto por id (inclui ingredientes + alérgenos)
router.get("/produto/:id", async (req, res) => {
  const produtoId = req.params.id;
  const usuarioLogado = req.session.Usuario || null;
  let nomeCadastrador = "Usuário Não Encontrado";

  try {
    const produto = await Produto.findByPk(produtoId, {
      include: [
        {
          model: Ingredientes,
          as: "ingredientes",
          through: { attributes: [] },
          include: [
            {
              model: Alergenicos,
              as: "alergenicos",
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!produto) return res.redirect("/produtos");

    if (produto.usuario_id_fk) {
      const cadastrador = await Usuario.findByPk(produto.usuario_id_fk, { raw: true });
      if (cadastrador && cadastrador.nome) nomeCadastrador = cadastrador.nome;
    }

    const produtoJSON = produto.get({ plain: true });

    // Monta lista única de alérgenos (ignorando "Sem alergênicos")
    const alergensSet = new Set();
    (produtoJSON.ingredientes || []).forEach((ing) => {
      (ing.alergenicos || []).forEach((a) => {
        const nomeOriginal = (a.nome || "").toString();
        const normalized = normalizeString(nomeOriginal);
        if (!isSemAlergenico(normalized)) alergensSet.add(nomeOriginal);
      });
    });
    const alergiasDetectadas = Array.from(alergensSet);

    // Prepara ingredientes para a view (apenas id, nome, alergenicos[] nomes)
    const ingredientesView = (produtoJSON.ingredientes || []).map((ing) => ({
      id: ing.id,
      nome: ing.nome,
      alergenicos: (ing.alergenicos || []).map((a) => a.nome),
    }));

    res.render("viewsProdutos", {
      produto: produtoJSON,
      usuarioLogado,
      nomeCadastrador,
      alergiasDetectadas,
      ingredientes: ingredientesView,
    });
  } catch (error) {
    console.error(`Erro ao buscar produto ID=${produtoId}:`, error);
    res.redirect("/produtos");
  }
});

// Delete seguro (apenas proprietário)
router.post("/produtos/delete/:id", async (req, res) => {
  const produtoId = req.params.id;
  const userId = req.session.Usuario ? req.session.Usuario.id : null;
  if (!userId) return res.status(401).send("Acesso negado. Faça login.");

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) return res.redirect("/produtos");

    if (String(produto.usuario_id_fk) !== String(userId)) return res.status(403).send("Ação proibida. Só seu produto.");

    await Produto.destroy({ where: { id: produtoId } });
    res.redirect("/produtos");
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).send("Erro interno ao excluir produto.");
  }
});

export default router;
