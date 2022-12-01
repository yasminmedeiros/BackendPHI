const { Model, DataTypes } = require('sequelize');

class Address extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            zipcode: DataTypes.STRING,
            street: DataTypes.STRING(3000),
            number: DataTypes.STRING,
            addressable_type: DataTypes.STRING,
        }, {
            sequelize,
            tableName: 'addresses',
            modelName: 'Address',
        });
    }

    static associate(models){
        this.belongsTo(models.District, {
            foreignKey: 'district_id',
        });
    }
}

module.exports = Address;