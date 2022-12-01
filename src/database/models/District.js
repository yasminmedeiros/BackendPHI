const { Model, DataTypes } = require('sequelize');

class District extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            code: DataTypes.STRING,
            city_id: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'districts',
            modelName: 'District',
        });
    }

    static associate(models){
        this.belongsTo(models.City, {
            foreignKey: 'city_id',
        });
        this.hasMany(models.Address);
    }
}

module.exports = District;