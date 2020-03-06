const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
let sequelize = null;
let modelStore = {};

function connectDatabase(databaseConfig) {
    const {database, host, port, user, password} = databaseConfig;
    sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
    return sequelize
        .authenticate();
}

function sync() {
    if(sequelize) {
        return sequelize.sync();
    }
    return null;    
}

function loadModels(baseFolderPath = `${__dirname}/../models/`) {
    function _getAllModels(folderName) {
        fs.readdirSync(folderName)
            .map((file) => {
                const fullName = path.join(folderName, file);
                const stat = fs.lstatSync(fullName);
                if (stat.isDirectory()) {
                    getAllModels(fullName);
                } else if ((file.indexOf('.') !== 0) && (file !== 'index.js')) {
                    const model = sequelize.import(fullName);
                    modelStore[model.name] = model;
                }
            });
    }
    const models = _getAllModels(baseFolderPath);
    Object.keys(modelStore).forEach(modelName => {
        if (modelStore[modelName].associate) {
            modelStore[modelName].associate(modelStore);
        }
    });
    return models;
}

function getModel(modelName) {
    if (modelStore.hasOwnProperty(modelName)) {
        return modelStore[modelName];
    }
    return null;
}

function createTransaction(callback) {
    if (sequelize) {
        return sequelize.transaction();
    }
    return;
}

function column(columnName) {
    return Sequelize.col(columnName);
}

function query(query) {
    return sequelize.query(query);
}

function functionExpression(functionName, cols) {
    return sequelize.fn(functionName, cols);
}
function selectQuery(query) {
    return sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
}

module.exports = {
    connectDatabase,
    sync,
    loadModels,
    getModel,
    createTransaction,
    column,
    query,
    selectQuery,
    functionExpression
};