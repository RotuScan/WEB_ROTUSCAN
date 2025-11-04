// models/usuario.js
import { DataTypes } from "sequelize";
import connection from "../config/sequelize-config.js";

// Note: definimos a tabela como 'usuarios' (plural) para coincidir com a referência usada.
const Usuario = connection.define(
  "usuarios", // nome da tabela (plural)
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true
  }
);

export default Usuario;
