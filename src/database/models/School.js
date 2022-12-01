const { Model, DataTypes } = require('sequelize');

class School extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            code: DataTypes.STRING,
            utb_code: DataTypes.STRING,
            name: DataTypes.STRING,
            enrollments_count: DataTypes.BIGINT,
            administration_type: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'schools',
            modelName: 'School',
        });
    }

    static associate(models){
        this.belongsTo(models.SchoolSize, {
            foreignKey: 'school_size_id',
            sourceKey: 'id',
        });

        this.hasMany(models.StatsContract);

        this.hasMany(models.StatsEnrollment, {
            foreignKey: 'school_id',            
        });
    }
}

module.exports = School;