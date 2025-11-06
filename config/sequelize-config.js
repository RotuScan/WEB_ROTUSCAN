// Importando o Sequelize
import { Sequelize } from 'sequelize';
// Criando os dados de conexão com o banco de dados
const connection = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    // Definindo o banco de dados da aplicação
    database: 'web_rotuscan',
    // Definindo o fuso horário de São Paulo
    timezone: '-03:00',
});

export default connection;