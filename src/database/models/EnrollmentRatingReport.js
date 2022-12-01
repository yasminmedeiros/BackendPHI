const { Model, DataTypes } = require('sequelize');

class EnrollmentRatingReport extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            final_result: DataTypes.STRING,
            final_rating: DataTypes.STRING,
            course_id: DataTypes.INTEGER,
            enrollment_id: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'enrollment_rating_reports',
            modelName: 'EnrollmentRatingReport',
        });
    }

    static associate(models){
        this.hasMany(models.Enrollment, {
            foreignKey: 'enrollment_id',            
        });
        
        this.hasMany(models.Course, {
            foreignKey: 'course_id',            
        });
    }
}

module.exports = EnrollmentRatingReport;