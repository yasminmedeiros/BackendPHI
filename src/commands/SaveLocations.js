const StatsEnrollment = require('../database/models/StatsEnrollment');
const District = require('../database/models/District');
const Address = require('../database/models/Address');
const { Op, Sequelize } = require("sequelize");
const fs = require('fs');

require('../database/models/initConnection');

const SaveLocations = async () => {
    try {
        const districtIds = await Address.findAll({
            attributes: [
                'district_id',
            ],
            where: { addressable_type: 'School', },
            group: ['district_id'],
            order: [['district_id', 'ASC']],
        });

        const addresses = [];
        let address;
        let latitude;
        let longitude;

        for (const district of districtIds) {
            address = await Address.findOne({
                attributes: [ 'district_id', 'latitude', 'longitude', 'addressable_type' ],
                where: { 
                    district_id: district.district_id,
                    addressable_type: 'School',
                    latitude: { [Op.lt]: -6 },
                    latitude: { [Op.gt]: -8.5 },
                    latitude: { [Op.ne]: null },
                    longitude: { [Op.gt]: -39 },
                    longitude: { [Op.lt]: -35 },
                    longitude: { [Op.ne]: null },
                },
            });

            if (address) {
                latitude = parseFloat(address.getDataValue('latitude'));
                longitude = parseFloat(address.getDataValue('longitude'));

                if (
                    latitude < -6 && latitude > -8.5 && latitude != null
                    && longitude < -34 && longitude > -39 && longitude !=null
                ) {
                    addresses.push(address);
                }
            }
        }

        let cityId;
        let locations = [];
        let locations_state = [];
        let locations_municipal = [];

        for (const address of addresses){
            cityId = (await District.findOne({
                attributes: ['city_id'],
                where: { id: address.district_id }
            })).city_id;

            const sumEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year: 2020,
                    city_id: cityId,
                },
            });

            const countSchools = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.literal('COUNT(DISTINCT(school_id))'), 'count'],
                ],
                where: {
                    year: 2020,
                    city_id: cityId,
                },
            })

            const sumEnrollmentsState = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year: 2020,
                    city_id: cityId,
                    administration_type: 0, // Estadual
                },
            });

            const countSchoolsState = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.literal('COUNT(DISTINCT(school_id))'), 'count'],
                ],
                where: {
                    year: 2020,
                    city_id: cityId,
                    administration_type: 0, // Estadual
                },
            })

            const sumEnrollmentsMunicipal = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year: 2020,
                    city_id: cityId,
                    administration_type: 1, // Municipal
                },
            });

            const countSchoolsMunicipal = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.literal('COUNT(DISTINCT(school_id))'), 'count'],
                ],
                where: {
                    year: 2020,
                    city_id: cityId,
                    administration_type: 1, // Municipal
                },
            })
            
            locations.push({
                latitude: parseFloat(address.getDataValue('latitude')),
                longitude: parseFloat(address.getDataValue('longitude')),
                enrollments: parseInt(sumEnrollments.getDataValue('sum')),
                schools: parseInt(countSchools.getDataValue('count')),
            });

            locations_state.push({
                latitude: parseFloat(address.getDataValue('latitude')),
                longitude: parseFloat(address.getDataValue('longitude')),
                enrollments: parseInt(sumEnrollmentsState.getDataValue('sum')),
                schools: parseInt(countSchoolsState.getDataValue('count')),
            });

            locations_municipal.push({
                latitude: parseFloat(address.getDataValue('latitude')),
                longitude: parseFloat(address.getDataValue('longitude')),
                enrollments: parseInt(sumEnrollmentsMunicipal.getDataValue('sum')),
                schools: parseInt(countSchoolsMunicipal.getDataValue('count')),
            });
        }

        const obj = { locations, locations_municipal, locations_state };
        const json = JSON.stringify(obj);
        fs.writeFileSync("./src/utils/locations.json", json, 'utf8');

    } catch (error) {
        console.log(error);
    }
}

SaveLocations();