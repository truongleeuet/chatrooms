var ConfigValue = require('./ConfigValue.json');

module.exports = {
    getConnectionString : function(){
        return `${ConfigValue.ConnectionString}`;
    }
}