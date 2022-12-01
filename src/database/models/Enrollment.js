const { Model, DataTypes } = require('sequelize');

class Enrollment extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            school_class_id: DataTypes.INTEGER,
            student_id: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'enrollments',
            modelName: 'Enrollment',
        });
    }

    static associate(models){
        this.hasMany(models.SchoolClass, {
            foreignKey: 'school_class_id',            
        });
        
        this.hasMany(models.Student, {
            foreignKey: 'student_id',            
        });
    }
}

module.exports = Enrollment;