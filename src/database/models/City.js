const { Model, DataTypes } = require('sequelize');

class City extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            code: DataTypes.STRING,
            microregion_id: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'cities',
            modelName: 'City',
        });
    }

    static associate(models){
        this.belongsTo(models.RegionalAdministration, {
            foreignKey: 'regional_administration_id',
            as: 'city_regional',
        });

        this.hasMany(models.StatsContract);

        // this.belongsTo(models.MicroRegion, {
        //     foreignKey: 'microregion_id',
        //     as: 'city_microregion',
        // });
    }
}

module.exports = City;