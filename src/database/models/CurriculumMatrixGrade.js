const { Model, DataTypes } = require('sequelize');

class CurriculumMatrixGrade extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            grade_id: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'curriculum_matrix_grades',
            modelName: 'CurriculumMatrixGrade',
        });
    }

    static associate(models){
        this.hasMany(models.Grade, {
            foreignKey: 'grade_id',
        });
    }
}

module.exports = CurriculumMatrixGrade;