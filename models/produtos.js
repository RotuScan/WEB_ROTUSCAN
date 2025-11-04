// models/produtos.js
import { DataTypes } from "sequelize";
import connection from "../config/sequelize-config.js";

const Produto = connection.define(
  "produtos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    cod_barra: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nome_gen: {
      type: DataTypes.STRING,
      allowNull: false
    },
    marca_produto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url_imagem_produto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantidade: {
      type: DataTypes.STRING,
      allowNull: false
    },
    usuario_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false
      // não colocar 'references' aqui se você preferir usar associações em index.js
    }
  },
  {
    timestamps: true
  }
);

export default Produto;
