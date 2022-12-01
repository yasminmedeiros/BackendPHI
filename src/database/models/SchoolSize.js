const { Model, DataTypes } = require('sequelize');

class SchoolSize extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            min_students: DataTypes.BIGINT,
            max_students: DataTypes.BIGINT,
            shifts: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'school_sizes',
            modelName: 'SchoolSize',
        });
    }

    static associate(models){
        this.belongsToMany(models.School, {
            through: models.School,
        });
    }
}

module.exports = SchoolSize;