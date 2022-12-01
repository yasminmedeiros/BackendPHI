const { Model, DataTypes } = require('sequelize');

class StatsContract extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            contracts_count: DataTypes.INTEGER,
            administration_type: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'stats_contracts',
            modelName: 'StatsContract',
        });
    }

    static associate(models){
        this.belongsTo(models.RegionalAdministration, {
            foreignKey: 'regional_administration_id',
            // as: 'stats_contracts_regional',
        });

        this.belongsTo(models.City, {
            foreignKey: 'city_id',
            // as: 'stats_contracts_city',
        });

        this.belongsTo(models.School, {
            foreignKey: 'school_id',
            // as: 'stats_contracts_school',
        });
    }
}

module.exports = StatsContract;