const { Model, DataTypes } = require('sequelize');

class Student extends Model {
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
        }, {
            sequelize,
            tableName: 'students',
            modelName: 'Student',
        });
    }
    static associate(models){

    }
}

module.exports = Student;