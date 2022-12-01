const { Model, DataTypes } = require('sequelize');

class Course extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: DataTypes.STRING,
        }, {
            sequelize,
            tableName: 'courses',
            modelName: 'Course',
        });
    }

    static associate(models){
        this.belongsToMany(models.EnrollmentRatingReport, {
            through: models.EnrollmentRatingReport,
        })
    }
}

module.exports = Course;