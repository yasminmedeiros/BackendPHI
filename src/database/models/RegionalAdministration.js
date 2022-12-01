const { Model, DataTypes } = require('sequelize');

class RegionalAdministration extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            code: DataTypes.STRING,
            name: DataTypes.STRING,
            department_id: DataTypes.INTEGER,
            utb_code: DataTypes.STRING,
        }, {
            sequelize,
            tableName: 'regional_administrations',
            modelName: 'RegionalAdministration',
        });
    }

    static associate(models){
        this.hasMany(models.StatsContract);
        
        this.hasOne(models.City, {
            foreignKey: 'city_id',
            as: 'regional_city',
        });
    }
}

module.exports = RegionalAdministration;