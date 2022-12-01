const { Model, DataTypes } = require('sequelize');

class SchoolClass extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            curriculum_matrix_grade_id: DataTypes.INTEGER,
            school_id: DataTypes.INTEGER,
            year: DataTypes.INTEGER,
            shift_id: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'school_classes',
            modelName: 'SchoolClass',
        });
    }

    static associate(models){
        this.belongsToMany(models.School, {
            through: models.School,
        });
        this.belongsToMany(models.CurriculumMatrixGrade, {
            through: models.CurriculumMatrixGrade,
        });
        this.belongsToMany(models.Shift, {
            through: models.Shift
        });
    }
}

module.exports = SchoolClass;