const School = require('../database/models/School');
const StatsEnrollment = require('../database/models/StatsEnrollment');
const { Op, Sequelize } = require("sequelize");
const RegionalAdministration = require('../database/models/RegionalAdministration');
const City = require('../database/models/City');
const fs = require('fs');

require('../database/models/initConnection');

const SaveSchools = async () => {
    try {
        const schools = await School.findAll({
            attributes: ['id', 'name', 'utb_code', 'code'],
        });

        const arg = process.argv.slice(2);
        const year = parseInt(arg[0]);
        let schoolsInfos = [];
        let municipalSchoolsInfos = [];
        let stateSchoolsInfos = [];
        let info;
        let enrollments;
        let municipalInfo;
        let municipalEnrollments;
        let stateInfo;
        let stateEnrollments;
    
        for (const school of schools) {
            enrollments = await StatsEnrollment.findOne({
                attributes: [
                    'school_id',
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year,
                    school_id: school.id,
                },
                group: ['school_id'],
            });
    
            info = await StatsEnrollment.findOne({
                where: { school_id: school.id },
                attributes: ['school_id'],
                include: [
                    {
                        model: RegionalAdministration,
                        attributes: ['name'],
                    },
                    {
                        model: City,
                        attributes: ['name'],
                    },
                ],
            });

            const numberEnrollments = enrollments ? parseInt(enrollments.getDataValue('sum')) : 0;

            console.log("all", enrollments);
    
            if (numberEnrollments > 1) {
                schoolsInfos.push({
                    school_id: school.id,
                    gre: info ? info.RegionalAdministration.name : '-',
                    utb: school.utb_code,
                    inep: school.code,
                    city: info ? info.City.name : '-',
                    school: school.name,
                    enrollments: numberEnrollments,
                });
            }

            municipalEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    'school_id',
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year,
                    school_id: school.id,
                    administration_type: 1, // Municipal
                },
                group: ['school_id'],
            });
    
            municipalInfo = await StatsEnrollment.findOne({
                where: {
                    school_id: school.id,
                    administration_type: 1, // Municipal
                },
                attributes: ['school_id'],
                include: [
                    {
                        model: RegionalAdministration,
                        attributes: ['name'],
                    },
                    {
                        model: City,
                        attributes: ['name'],
                    },
                ],
            });

            const municipalNumberEnrollments = municipalEnrollments ? parseInt(municipalEnrollments.getDataValue('sum')) : 0;

            console.log("municipalInfo", municipalNumberEnrollments);
    
            if (municipalNumberEnrollments > 1) {
                municipalSchoolsInfos.push({
                    school_id: school.id,
                    gre: municipalInfo ? municipalInfo.RegionalAdministration.name : '-',
                    utb: school.utb_code,
                    inep: school.code,
                    city: municipalInfo ? municipalInfo.City.name : '-',
                    school: school.name,
                    enrollments: municipalNumberEnrollments,
                });
            }

            stateEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    'school_id',
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year,
                    school_id: school.id,
                    administration_type: 0, // Estadual
                },
                group: ['school_id'],
            });
    
            stateInfo = await StatsEnrollment.findOne({
                where: {
                    school_id: school.id,
                    administration_type: 0, // Estadual
                },
                attributes: ['school_id'],
                include: [
                    {
                        model: RegionalAdministration,
                        attributes: ['name'],
                    },
                    {
                        model: City,
                        attributes: ['name'],
                    },
                ],
            });

            const stateNumberEnrollments = stateEnrollments ? parseInt(stateEnrollments.getDataValue('sum')) : 0;

            console.log("stateInfo", stateNumberEnrollments);
    
            if (stateNumberEnrollments > 1) {
                stateSchoolsInfos.push({
                    school_id: school.id,
                    gre: stateInfo ? stateInfo.RegionalAdministration.name : '-',
                    utb: school.utb_code,
                    inep: school.code,
                    city: stateInfo ? stateInfo.City.name : '-',
                    school: school.name,
                    enrollments: stateNumberEnrollments,
                });
            }
        }

        schoolsInfos.sort(function (a, b) {
            if (a.school > b.school) {
                return 1;
            }
            return -1;
        });

        municipalSchoolsInfos.sort(function (a, b) {
            if (a.school > b.school) {
                return 1;
            }
            return -1;
        });

        stateSchoolsInfos.sort(function (a, b) {
            if (a.school > b.school) {
                return 1;
            }
            return -1;
        });
    

        const obj = { schoolsInfos, municipalSchoolsInfos, stateSchoolsInfos };
        const json = JSON.stringify(obj);
        fs.writeFileSync("./src/utils/schools.json", json, 'utf8');
        
    } catch (error) {
        console.log(error);
    }
}

SaveSchools();