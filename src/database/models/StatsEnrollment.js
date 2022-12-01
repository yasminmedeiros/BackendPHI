const { Model, DataTypes } = require('sequelize');

class StatsEnrollment extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            year: DataTypes.INTEGER,
            enrollments_count: DataTypes.INTEGER,
            treatment: DataTypes.INTEGER,
            administration_type: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'stats_enrollments',
            modelName: 'StatsEnrollment',
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

        // this.belongsTo(models.Education, {
        //     foreignKey: 'education_id',
        // });

        this.hasOne(models.Shift, {
            foreignKey: 'shift_id',
        });
    }
}

module.exports = StatsEnrollment;