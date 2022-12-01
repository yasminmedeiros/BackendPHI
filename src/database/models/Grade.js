const { Model, DataTypes } = require('sequelize');

class Grade extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: DataTypes.STRING,
        }, {
            sequelize,
            tableName: 'grades',
            modelName: 'Grade',
        });
    }

    static associate(models){
        this.hasMany(models.CurriculumMatrixGrade)
    }
}

module.exports = Grade;