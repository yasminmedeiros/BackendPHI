const { Model, DataTypes } = require('sequelize');

class Shift extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            value: DataTypes.INTEGER,
            position: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'shifts',
            modelName: 'Shift',
        });
    }

    static associate(models){
        this.belongsToMany(models.StatsEnrollment, {
            through: models.StatsEnrollment,
        });
    }
}

module.exports = Shift;