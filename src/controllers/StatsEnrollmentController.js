const StatsEnrollment = require('../database/models/StatsEnrollment');
const City = require('../database/models/City');
const RegionalAdministration = require('../database/models/RegionalAdministration');
const School = require('../database/models/School');
const { Op, Sequelize } = require("sequelize");
const SchoolSize = require('../database/models/SchoolSize');
const removePontuation = require('../utils/RemovePontuation');
const fs = require('fs');

module.exports = {
    async getYears(req, res){
        const { type } = req.query;
        let where = {};

        if(type != '3') where.administration_type = type;

        try {
            const years = await StatsEnrollment.findAll({
                where,
                attributes: ['year'],
                group: ['year'],
                order: [['year', 'DESC']]
            });

            res.json(years);
        } catch (error) {
            console.log(error);
        }
    },

    async getGres(req, res) {
        try {
            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            const serializedGres = [];
            for (const gre of gres) {
                serializedGres.push({
                    label: gre.name,
                    value: gre.id,
                });
            }

            res.json(serializedGres);
        } catch (error) {
            console.log(error);
        }
    },

    async getSizes(req, res) {
        try {
            const schoolSizes = await SchoolSize.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            const serializedSchoolSizes = [];
            for (const size of schoolSizes) {
                serializedSchoolSizes.push({
                    label: size.name,
                    value: size.id,
                });
            }

            res.json(serializedSchoolSizes);
        } catch (error) {
            console.log(error);
        }
    },

    async getSchools(req, res){
        const { name, type } = req.query;

        const json = fs.readFileSync('./src/utils/schools.json', 'utf8');
        const obj = JSON.parse(json);
        let schools = [];

        switch (type) {
            case '1':
                schools = obj.municipalSchoolsInfos;
                break;
            case '0':
                schools = obj.stateSchoolsInfos;
                break;
            default:
                schools = obj.schoolsInfos;
                break;
        }

        let schoolsNames = [];
        let lowerName;
        let lowerQuery;

        for (const info of schools) {
            if (name && name != '') {
                lowerName = info.school.toLowerCase();
                lowerName = removePontuation(lowerName);

                lowerQuery = name.toLowerCase();
                lowerQuery = removePontuation(lowerQuery);

                if (lowerName.includes(lowerQuery)) {
                    schoolsNames.push({
                        label: info.school,
                        value: info.school_id,
                    });
                }
            }
            else {
                schoolsNames.push({
                    label: info.school,
                    value: info.school_id,
                });
            }
            // if (schoolsNames.length > 199) break;
        }

        res.json(schoolsNames);
    },

    async findHighestEnrollments(req, res){
        const { year, type } = req.query;

        let where = { year }

        if(type != '3') where.administration_type = type

        try {
            const response = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
                ],
                where,
                group: ['school_id'],
                order: [[Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'DESC']],
                limit: 10,
            });

            res.json(response);
        } catch (error) {
            console.log(error);
        }
    },

    async findLowestEnrollments(req, res){
        try {
            const response = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
                ],
                where: {
                    year: 2021,
                },
                group: ['school_id'],
                order: [[Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'ASC']],
                limit: 10,
            });

            res.json(response);
        } catch (error) {
            console.log(error);
        }
    },

    async findHighestEnrollmentsPerCity(req, res){
        const { cityName, year, type } = req.query;

        try {
            const city = await City.findOne({
                attributes: [
                    'id',
                ],
                where: {
                    name: cityName,
                }
            }) 

            if(city) {
                let where = { year, city_id: city.id }
                if(type != '3') where.administration_type = type

                const response = await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                        'city_id',
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                        [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
                        [Sequelize.literal(`(SELECT "name" FROM "cities" WHERE "cities"."id" = "StatsEnrollment"."city_id")`), 'cidade'],
                    ],
                    where,
                    group: ['school_id', 'city_id'],
                    order: [[Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'DESC']],
                    limit: 10,
                });
    
                res.json(response);
            }
            else {
                res.json([]);
            }
        } catch (error) {
            console.log(error);
        }
    },

    async findAllSchoolsPerSize(req, res){
        const { year, type } = req.query;
        let school;
        let count_schools;
        let schoolPerSize = [];
        let where = { year }

        if(type != '3') where.administration_type = type

        const statsenrollments = await StatsEnrollment.findAll({
            attributes: [
                'school_id',
            ],
            where,
            group: ['school_id'],
        });

        const schoolIds = statsenrollments.map(stats => stats.school_id);

        const schoolSizes = await SchoolSize.findAll({
            attributes: ['id', 'name'],
            order: [
                ['name', 'ASC']
            ],
        });

        where = { school_size_id: null, id: schoolIds }

        school = await School.findOne({
            where,
            attributes: [
                [Sequelize.fn('count', Sequelize.col('id')), 'count'],
            ],
        });

        count_schools = school.getDataValue('count');

        if (parseInt(count_schools || '0') > 0) {
            schoolPerSize.push({ key: '-', data: count_schools });
        }
        

        for (const size of schoolSizes) {
            where = { school_size_id: size.id, id: schoolIds }
            school = await School.findOne({
                where,
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                ],
            });

            count_schools = school.getDataValue('count');

            if (parseInt(count_schools || '0') > 0) {
                schoolPerSize.push({ key: size.name, data: count_schools });
            }
        }

        res.json(schoolPerSize);
    },

    async findAllEnrollmentsPerSize(req, res){
        const { year, type } = req.query;

        try {
            let sumEnrollments;
            let schoolIdsPerSize;
            let enrollmentsPerSize = [];
            let school_enrollments_count = 0;
            let where = { year }

            if(type != '3') where.administration_type = type

            const statsenrollments = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                ],
                where,
                group: ['school_id'],
            });

            const schoolIds = statsenrollments.map(stats => stats.school_id);

            const schoolSizes = await SchoolSize.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            where = {school_size_id: null, id: schoolIds }

            schoolIdsPerSize = (await School.findAll({
                attributes: ['id'],
                where,
            })).map(item => item.id);

            where = { year, school_id: schoolIdsPerSize }

            sumEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where,
            });

            school_enrollments_count = sumEnrollments.getDataValue('sum');

            if (parseInt(school_enrollments_count || '0') > 0) {
                enrollmentsPerSize.push({ key: '-', data: school_enrollments_count });
            }
      

            for(const size of schoolSizes) {
                schoolIdsPerSize = (await School.findAll({
                    attributes: ['id'],
                    where: {
                        school_size_id: size.id,
                        id: schoolIds,
                    }
                })).map(item => item.id);

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where: {
                        year,
                        school_id: schoolIdsPerSize,
                    },
                });

                school_enrollments_count = sumEnrollments.getDataValue('sum');

                if (parseInt(school_enrollments_count || '0') > 0) {
                    enrollmentsPerSize.push({ key: size.name, data: school_enrollments_count });
                }
            }

            res.json(enrollmentsPerSize);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllAveragesPerSize(req, res){
        const { year, type } = req.query;

        try {
            let school;
            let sumEnrollments;
            let schoolIdsPerSize;
            let averages = [];

            let count_schools = 0;
            let school_enrollments_count = 0;
            
            let where = { year }
            
            if(type != '3') where.administration_type = type

            const statsenrollments = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                ],
                where,
                group: ['school_id'],
            });

            const schoolIds = statsenrollments.map(stats => stats.school_id);

            const schoolSizes = await SchoolSize.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            school = await School.findOne({
                where: { 
                    school_size_id: null,
                    id: schoolIds,
                },
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                ],
            });

            schoolIdsPerSize = (await School.findAll({
                attributes: ['id'],
                where: {
                    school_size_id: null,
                    id: schoolIds,
                }
            })).map(item => item.id);

            sumEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year,
                    school_id: schoolIdsPerSize,
                },
            });

            count_schools = school.getDataValue('count') 
                && school.getDataValue('count');
            school_enrollments_count = sumEnrollments.getDataValue('sum') 
                && sumEnrollments.getDataValue('sum');

            count_schools > 0 && school_enrollments_count > 0 && averages.push({
                key: '-',
                data: (school_enrollments_count / count_schools).toFixed(2),
            });
            
            for(const size of schoolSizes) {
                school = await School.findOne({
                    where: { 
                        school_size_id: size.id,
                        id: schoolIds,
                    },
                    attributes: [
                        [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                    ],
                });

                schoolIdsPerSize = (await School.findAll({
                    attributes: ['id'],
                    where: {
                        school_size_id: size.id,
                        id: schoolIds,
                    }
                })).map(item => item.id);

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where: {
                        year,
                        school_id: schoolIdsPerSize,
                    },
                });

                count_schools = school.getDataValue('count') && school.getDataValue('count');
                school_enrollments_count = sumEnrollments.getDataValue('sum') 
                    && sumEnrollments.getDataValue('sum');

                count_schools > 0 && school_enrollments_count > 0 && averages.push({
                    key: size.name,
                    data: (school_enrollments_count / count_schools).toFixed(2),
                });
            }

            res.json(averages);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllSchoolsPerGre(req, res){
        const { year, type } = req.query;

        try {
            let school;
            let schoolPerGre = [];

            let count_schools = 0;

            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            for(const gre of gres) {
                where = { year, regional_administration_id: gre.id }
                if(type != '3') where.administration_type = type

                school = (await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    where,
                    group: ['school_id'],
                })).length;

                count_schools = school;
                if (count_schools > 0) {
                    schoolPerGre.push({ key: gre.name, data: count_schools });
                }
            }

            res.json(schoolPerGre);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllEnrollmentsPerGre(req, res){
        const { year, type } = req.query;

        try {
            let sumEnrollments;
            let enrollmentsPerGre = [];
            let school_enrollments_count = 0;

            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            for(const gre of gres) {
                where = { year, regional_administration_id: gre.id }
                if(type != '3') where.administration_type = type;

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where,
                });

                school_enrollments_count = sumEnrollments.getDataValue('sum') 
                    && sumEnrollments.getDataValue('sum');

                if (parseInt(school_enrollments_count || '0') > 0) {
                    enrollmentsPerGre.push({ key: gre.name, data: school_enrollments_count });
                }
            }

            res.json(enrollmentsPerGre);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllAveragesPerGre(req, res){
        const { year, type } = req.query;

        try {
            let school;
            let sumEnrollments;
            let averages = [];

            let count_schools = 0;
            let school_enrollments_count = 0;

            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            for(const gre of gres) {
                let where = { year, regional_administration_id: gre.id }
                if(type != '3') where.administration_type = type;

                school = (await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    where,
                    group: ['school_id'],
                })).length;

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where,
                });

                count_schools = school && school;
                school_enrollments_count = sumEnrollments.getDataValue('sum') 
                    && sumEnrollments.getDataValue('sum');

                count_schools > 0 && school_enrollments_count > 0 && averages.push({
                    key: gre.name,
                    data: (school_enrollments_count / count_schools).toFixed(2),
                });
            }

            res.json(averages);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllCityLocation (req, res) {
        const { type } = req.query;

        try {
            const json = fs.readFileSync('./src/utils/locations.json', 'utf8');
            const obj = JSON.parse(json);

            switch (type) {
                case '1':
                    res.json(obj.locations_municipal)
                    break;
                case '0':
                    res.json(obj.locations_state)
                    break;
                default:
                    res.json(obj.locations)
                    break;
            }

        } catch (error) {
            console.log(error);
        }
    },

    async allSchoolsInfos(req, res) {
        try {
            const { limit, page, type } = req.query;
            let schoolInfos;
            const json = fs.readFileSync('./src/utils/schools.json', 'utf8');
            const obj = JSON.parse(json);
            let info = [];

            switch (type) {
                case '1':
                    info = obj.municipalSchoolsInfos;
                    break;
                case '0':
                    info = obj.stateSchoolsInfos;
                    break;
                default:
                    info = obj.schoolsInfos;
                    break;
            }
            
            if (limit && page) {
                const start = (parseInt(page)) * parseInt(limit);
                const end = start + parseInt(limit);

                schoolInfos = info.slice(start, end);
            }
            else {
                schoolInfos = info;
            }
        
            res.json(schoolInfos);
        } catch (error) {
            console.log(error);
        }
    },

    async enrollmentsInYears(req, res) {
        const { school_id, type } = req.query;

        try {
            let enrollmentsInYears = [];
            let enrollmentsInYear;
            let sum = 0;
            let where = {};

            if(type != 3) where.administration_type = type

            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = {year: oneYear.year, school_id}
                if(type != '3') where.administration_type = type;

                enrollmentsInYear = await StatsEnrollment.findOne({
                    attributes: [
                        'school_id',
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    /*where: {
                        year: oneYear.year,
                        school_id,
                    },*/
                    where,
                    group: ['school_id'],
                });

                if (enrollmentsInYear) sum = parseInt(enrollmentsInYear.getDataValue('sum'));
                else sum = 0;

                if (sum > 0) {
                    enrollmentsInYears.push({
                        key: oneYear.year,
                        data: sum,
                    });
                }

            }

            res.json(enrollmentsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    async totalEnrollmentsInYears(req, res) {
        const { type } = req.query;

        try {
            let totalEnrollmentsInYears = [];
            let totalEnrollmentsInYear;
            let sum = 0;
            let = where = {};

            if(type != '3') where.administration_type = type;

            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = { year: oneYear.year}
                if(type != '3') where.administration_type = type

                totalEnrollmentsInYear = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where,
                });

                if (totalEnrollmentsInYear) sum = parseInt(totalEnrollmentsInYear.getDataValue('sum'));
                else sum = 0;

                if (sum > 0) {
                    totalEnrollmentsInYears.push({
                        key: oneYear.year,
                        data: sum,
                    });
                }
            }

            res.json(totalEnrollmentsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    async schoolsInYearsPerGre(req, res) {
        const { gre_id, type } = req.query;

        try {
            let schoolsInYears = [];
            let schoolsInYear;
            let count = 0;
            let where = {};

            if(type != '3') where.administration_type = type

            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = { year: oneYear.year, regional_administration_id: gre_id }
                if(type != '3') where.administration_type = type;

                schoolsInYear = (await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    /*where: {
                        year: oneYear.year,
                        regional_administration_id: gre_id,
                    },*/
                    where,
                    group: ['school_id'],
                })).length;

                if (schoolsInYear) count = schoolsInYear;
                else count = 0;

                if (count > 0) {
                    schoolsInYears.push({
                        key: oneYear.year,
                        data: count,
                    });
                }
            }

            res.json(schoolsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    async schoolsInYearsPerSize(req, res) {
        const { size_id, type } = req.query;

        try {
            let schoolsInYears = [];
            let school;
            let count = 0;
            let where = {};

            if(type != '3') where.administration_type = type;


            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = { year: oneYear.year }
                if(type != '3') where.administration_type = type;
                
                const statsenrollments = await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    where,
                    group: ['school_id'],
                });
        
                const schoolIds = statsenrollments.map(stats => stats.school_id);
                
                school = await School.findOne({
                    where: {
                        school_size_id: size_id,
                        id: schoolIds,
                    },
                    attributes: [
                        [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                    ],
                });

                if (school) count = parseInt(school.getDataValue('count'));
                else count = 0;

                if (count > 0) {
                    schoolsInYears.push({
                        key: oneYear.year,
                        data: count,
                    });
                }
            }

            res.json(schoolsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    // ENSINO PROFISSIONAL

    async getProfessionalSchoolCount(req, res){
        const { type, year } = req.query;
        let where = {};

        where = {
            education_id: {
                [Op.between]: [51, 53],
                [Op.or]: 11,
                [Op.or]: 121,
            },
            year,
        }

        if(type != '3') where.administration_type = type;

        try {
            const response = await StatsEnrollment.findAll({
                where,
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('school_id')), 'count'],
                    'year',
                    'school_id',
                    'education_id',
                ],
            });

            res.json(response);
        } catch (error) {
            console.log(error);
        }
    },
    
    async getProHighestEnrollments(req, res){
        const { type, year } = req.query;
        let where = {};

        where = {
            education_id: {
                [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
            },
            year,
        }

        if(type != '3') where.administration_type = type;

        try {
            const response = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    [Sequelize.literal(`(SELECT "name" from "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
                ],
                where,
                group: ['school_id'],
                order: [[Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'DESC']],
                limit: 10,
            })

            res.json(response);
        } catch (error) {
            console.log(error);
        }
    },

    async findProHighestEnrollmentsPerCity(req, res){
        const { cityName, year, type } = req.query;

        try {
            const city = await City.findOne({
                attributes: [
                    'id',
                ],
                where: {
                    name: cityName,
                }
            }) 

            if(city) {
                let where = { 
                    year,
                    city_id: city.id,
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }
                if(type != '3') where.administration_type = type

                const response = await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                        'city_id',
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                        [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
                        [Sequelize.literal(`(SELECT "name" FROM "cities" WHERE "cities"."id" = "StatsEnrollment"."city_id")`), 'cidade'],
                    ],
                    where,
                    group: ['school_id', 'city_id'],
                    order: [[Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'DESC']],
                    limit: 10,
                });
    
                res.json(response);
            }
            else {
                res.json([]);
            }
        } catch (error) {
            console.log(error);
        }
    },

    async findAllProSchoolsPerSize(req, res){
        const { year, type } = req.query;
        let school;
        let count_schools;
        let schoolPerSize = [];
        let where = {
            year,
            education_id: {
                [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
            },
        }

        if(type != '3') where.administration_type = type

        const statsenrollments = await StatsEnrollment.findAll({
            attributes: [
                'school_id',
            ],
            where,
            group: ['school_id'],
        });

        const schoolIds = statsenrollments.map(stats => stats.school_id);

        const schoolSizes = await SchoolSize.findAll({
            attributes: ['id', 'name'],
            order: [
                ['name', 'ASC']
            ],
        });

        where = { school_size_id: null, id: schoolIds }

        school = await School.findOne({
            where,
            attributes: [
                [Sequelize.fn('count', Sequelize.col('id')), 'count'],
            ],
        });

        count_schools = school.getDataValue('count');

        if (parseInt(count_schools || '0') > 0) {
            schoolPerSize.push({ key: '-', data: count_schools });
        }

        for (const size of schoolSizes) {
            where = { school_size_id: size.id, id: schoolIds }
            school = await School.findOne({
                where,
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                ],
            });

            count_schools = school.getDataValue('count');

            if (parseInt(count_schools || '0') > 0) {
                schoolPerSize.push({ key: size.name, data: count_schools });
            }
        }

        res.json(schoolPerSize);
    },

    async findAllProEnrollmentsPerSize(req, res){
        const { year, type } = req.query;

        try {
            let sumEnrollments;
            let schoolIdsPerSize;
            let enrollmentsPerSize = [];
            let school_enrollments_count = 0;
            let where = {
                year,
                education_id: {
                    [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                },
            }

            if(type != '3') where.administration_type = type

            const statsenrollments = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                ],
                where,
                group: ['school_id'],
            });

            const schoolIds = statsenrollments.map(stats => stats.school_id);

            const schoolSizes = await SchoolSize.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            where = {school_size_id: null, id: schoolIds }

            schoolIdsPerSize = (await School.findAll({
                attributes: ['id'],
                where,
            })).map(item => item.id);

            where = { year, school_id: schoolIdsPerSize }

            sumEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where,
            });

            school_enrollments_count = sumEnrollments.getDataValue('sum');

            if (parseInt(school_enrollments_count || '0') > 0) {
                enrollmentsPerSize.push({ key: '-', data: school_enrollments_count || 0 });
            }

            for(const size of schoolSizes) {
                schoolIdsPerSize = (await School.findAll({
                    attributes: ['id'],
                    where: {
                        school_size_id: size.id,
                        id: schoolIds,
                    }
                })).map(item => item.id);

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where: {
                        year,
                        school_id: schoolIdsPerSize,
                    },
                });

                school_enrollments_count = sumEnrollments.getDataValue('sum');

                if (parseInt(school_enrollments_count || '0') > 0) {
                    enrollmentsPerSize.push({ key: size.name, data: school_enrollments_count || 0 });
                }
            }

            res.json(enrollmentsPerSize);
        } catch (error) {
            console.log(error);
        }
    },
    
    async findAllProAveragesPerSize(req, res){
        const { year, type } = req.query;

        try {
            let school;
            let sumEnrollments;
            let schoolIdsPerSize;
            let averages = [];

            let count_schools = 0;
            let school_enrollments_count = 0;
            
            let where = {
                year,
                education_id: {
                    [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                },
            }
            
            if(type != '3') where.administration_type = type

            const statsenrollments = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                ],
                where,
                group: ['school_id'],
            });

            const schoolIds = statsenrollments.map(stats => stats.school_id);

            const schoolSizes = await SchoolSize.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            school = await School.findOne({
                where: { 
                    school_size_id: null,
                    id: schoolIds,
                },
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                ],
            });

            schoolIdsPerSize = (await School.findAll({
                attributes: ['id'],
                where: {
                    school_size_id: null,
                    id: schoolIds,
                }
            })).map(item => item.id);

            sumEnrollments = await StatsEnrollment.findOne({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                ],
                where: {
                    year,
                    school_id: schoolIdsPerSize,
                },
            });

            count_schools = school.getDataValue('count') 
                && school.getDataValue('count');
            school_enrollments_count = sumEnrollments.getDataValue('sum') 
                && sumEnrollments.getDataValue('sum');

            count_schools > 0 && school_enrollments_count > 0 && averages.push({
                key: '-',
                data: (school_enrollments_count / count_schools).toFixed(2),
            });
            
            for(const size of schoolSizes) {
                school = await School.findOne({
                    where: { 
                        school_size_id: size.id,
                        id: schoolIds,
                    },
                    attributes: [
                        [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                    ],
                });

                schoolIdsPerSize = (await School.findAll({
                    attributes: ['id'],
                    where: {
                        school_size_id: size.id,
                        id: schoolIds,
                    }
                })).map(item => item.id);

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where: {
                        year,
                        school_id: schoolIdsPerSize,
                    },
                });

                count_schools = school.getDataValue('count') && school.getDataValue('count');
                school_enrollments_count = sumEnrollments.getDataValue('sum') 
                    && sumEnrollments.getDataValue('sum');

                count_schools > 0 && school_enrollments_count > 0 && averages.push({
                    key: size.name,
                    data: (school_enrollments_count / count_schools).toFixed(2),
                });
            }

            res.json(averages);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllProSchoolsPerGre(req, res){
        const { year, type } = req.query;

        try {
            let school;
            let schoolPerGre = [];

            let count_schools = 0;

            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            for(const gre of gres) {
                where = {
                    year,
                    regional_administration_id: gre.id,
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }

                if(type != '3') where.administration_type = type

                school = (await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    where,
                    group: ['school_id'],
                })).length;

                count_schools = school;

                if (parseInt(count_schools || '0') > 0) {
                    schoolPerGre.push({ key: gre.name, data: count_schools });
                }
            }

            res.json(schoolPerGre);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllProEnrollmentsPerGre(req, res){
        const { year, type } = req.query;

        try {
            let sumEnrollments;
            let enrollmentsPerGre = [];
            let school_enrollments_count = 0;

            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            for(const gre of gres) {
                where = {
                    year,
                    regional_administration_id: gre.id,      
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }

                if(type != '3') where.administration_type = type;

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where,
                });

                school_enrollments_count = sumEnrollments.getDataValue('sum') 
                    && sumEnrollments.getDataValue('sum');

                if (parseInt(school_enrollments_count || '0') > 0) {
                    enrollmentsPerGre.push({ key: gre.name, data: school_enrollments_count });
                }
            }

            res.json(enrollmentsPerGre);
        } catch (error) {
            console.log(error);
        }
    },

    async findAllProAveragesPerGre(req, res){
        const { year, type } = req.query;

        try {
            let school;
            let sumEnrollments;
            let averages = [];

            let count_schools = 0;
            let school_enrollments_count = 0;

            const gres = await RegionalAdministration.findAll({
                attributes: ['id', 'name'],
                order: [
                    ['name', 'ASC']
                ],
            });

            for(const gre of gres) {
                let where = {
                    year,
                    regional_administration_id: gre.id,      
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }

                if(type != '3') where.administration_type = type;

                school = (await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    /*where: {
                        year,
                        regional_administration_id: gre.id,
                    },*/
                    where,
                    group: ['school_id'],
                })).length;

                console.log(gre.name, school);

                sumEnrollments = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    /*where: {
                        year,
                        regional_administration_id: gre.id,
                    },*/
                    where,
                });

                count_schools = school && school;
                school_enrollments_count = sumEnrollments.getDataValue('sum') 
                    && sumEnrollments.getDataValue('sum');

                count_schools > 0 && school_enrollments_count > 0 && averages.push({
                    key: gre.name,
                    data: (school_enrollments_count / count_schools).toFixed(2),
                });
            }

            res.json(averages);
        } catch (error) {
            console.log(error);
        }
    },

    async proEnrollmentsInYears(req, res) {
        const { school_id, type } = req.query;

        try {
            let enrollmentsInYears = [];
            let enrollmentsInYear;
            let sum = 0;
            let where = {};

            if(type != 3) where.administration_type = type

            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = {
                    year: oneYear.year,
                    school_id
                }
                if(type != '3') where.administration_type = type;

                enrollmentsInYear = await StatsEnrollment.findOne({
                    attributes: [
                        'school_id',
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    /*where: {
                        year: oneYear.year,
                        school_id,
                    },*/
                    where,
                    group: ['school_id'],
                });

                if (enrollmentsInYear) sum = parseInt(enrollmentsInYear.getDataValue('sum'));
                else sum = 0;

                if (sum > 0) {
                    enrollmentsInYears.push({
                        key: oneYear.year,
                        data: sum,
                    });
                }
            }

            res.json(enrollmentsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    async totalProEnrollmentsInYears(req, res) {
        const { type } = req.query;

        try {
            let totalEnrollmentsInYears = [];
            let totalEnrollmentsInYear;
            let sum = 0;
            let = where = {};

            if(type != '3') where.administration_type = type;

            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = {
                    year: oneYear.year,      
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }

                if(type != '3') where.administration_type = type

                totalEnrollmentsInYear = await StatsEnrollment.findOne({
                    attributes: [
                        [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
                    ],
                    where,
                });

                if (totalEnrollmentsInYear) sum = parseInt(totalEnrollmentsInYear.getDataValue('sum'));
                else sum = 0;

                if (sum > 0) {
                    totalEnrollmentsInYears.push({
                        key: oneYear.year,
                        data: sum,
                    });
                }
            }

            res.json(totalEnrollmentsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    async proSchoolsInYearsPerGre(req, res) {
        const { gre_id, type } = req.query;

        try {
            let schoolsInYears = [];
            let schoolsInYear;
            let count = 0;
            let where = {};

            if(type != '3') where.administration_type = type

            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = {
                    year: oneYear.year,
                    regional_administration_id: gre_id,
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }
                if(type != '3') where.administration_type = type;

                schoolsInYear = (await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    /*where: {
                        year: oneYear.year,
                        regional_administration_id: gre_id,
                    },*/
                    where,
                    group: ['school_id'],
                })).length;

                if (schoolsInYear) count = schoolsInYear;
                else count = 0;

                if (count > 0) {
                    schoolsInYears.push({
                        key: oneYear.year,
                        data: count,
                    });
                }
            }

            res.json(schoolsInYears);
        } catch (error) {
            console.log(error);
        }
    },

    async proSchoolsInYearsPerSize(req, res) {
        const { size_id, type } = req.query;

        try {
            let schoolsInYears = [];
            let school;
            let count = 0;
            let where = {};

            if(type != '3') where.administration_type = type;


            const years = await StatsEnrollment.findAll({
                attributes: ['year'],
                where,
                group: ['year'],
                order: [['year', 'ASC']]
            });

            for (const oneYear of years) {
                where = {
                    year: oneYear.year,
                    education_id: {
                        [Op.or]: [{[Op.between]: [51, 53]}, 11, 121],
                    },
                }
                if(type != '3') where.administration_type = type;
                
                const statsenrollments = await StatsEnrollment.findAll({
                    attributes: [
                        'school_id',
                    ],
                    where,
                    group: ['school_id'],
                });
        
                const schoolIds = statsenrollments.map(stats => stats.school_id);
                
                school = await School.findOne({
                    where: {
                        school_size_id: size_id,
                        id: schoolIds,
                    },
                    attributes: [
                        [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                    ],
                });

                if (school) count = parseInt(school.getDataValue('count'));
                else count = 0;

                if (count > 0) {
                    schoolsInYears.push({
                        key: oneYear.year,
                        data: count,
                    });
                }
            }

            res.json(schoolsInYears);
        } catch (error) {
            console.log(error);
        }
    },
    
    async findAllProSchoolsThatWereRegular(req, res) {
        const { type } = req.query;

        let where = {
            education_id: {
                [Op.or]: [{[Op.between]: [50, 53]}, 11, 121],
            },
        }

        if(type != '3') where.administration_type = type

        const proSchools = await StatsEnrollment.findAll({
            attributes: [
                'school_id',
                'education_id',
                'year',
            ],
            where,
        });

        const schoolIds = proSchools.map(stats => stats.school_id);

        where = {
            education_id: {
                [Op.not]: [50, 51, 52, 53, 11, 121],
            },
            school_id: schoolIds,
        }

        const previousRegSchools = await StatsEnrollment.findAll({
            attributes: [
                'school_id',
                'year',
                [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
            ],
            where,
            group: ['school_id', 'year'],
        });

        console.log(previousRegSchools);
        
        res.json(previousRegSchools);
    },

    async findAllProSchoolsThatWereRegularInYears(req, res) {
        const { type } = req.query;
        let proSchoolsInYear;
        let count = 0;
        let proSchoolsInYears = [];

        const years = await StatsEnrollment.findAll({
            attributes: [
                'year',
            ],
            group: ['year'],
            order: [['year', 'ASC']]
        })

        for(const oneYear of years) {
            let where = {
                education_id: {
                    [Op.or]: [{[Op.between]: [50, 53]}, 11, 121],
                },
                year: oneYear.year,
            }

            if(type != '3') where.administration_type = type

            const proSchools = await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                ],
                where,
            });
    
            const schoolIds = proSchools.map(stats => stats.school_id);
    
            where = {
                education_id: {
                    [Op.not]: [50, 51, 52, 53, 11, 121],
                },
                school_id: schoolIds,
                year: oneYear.year,
            }
    
            proSchoolsInYear = ( await StatsEnrollment.findAll({
                attributes: [
                    'school_id',
                ],
                where,
            })).length;

            if (proSchoolsInYear) count = proSchoolsInYear;
            else count = 0;

            if (count > 0) {
                proSchoolsInYears.push({
                    key: oneYear.year,
                    data: count,
                });
            }
        }
        
        res.json(proSchoolsInYears);
    },

    async findAllProSchools(req, res) {
        const { type } = req.query;

        let where = {
            education_id: {
                //[Op.or]: [{[Op.between]: [50, 53]}, 11, 121],
                [Op.eq]: 121,
            },
            year: 2020,
        }

        if(type != '3') where.administration_type = type

        const proSchools = await StatsEnrollment.findAll({
            attributes: [
                'school_id',
                'education_id',
                [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
            ],
            where,
        });
        console.log(proSchools);
        res.json(proSchools);
    },
    
    async getAllCurrentIntSchoolsThatWereRegular(req, res) {
        const { type } = req.query;
        let where = {};
        const integralID = 3;
        if(type != '3') where.administration_type = type;

        // Listar as escolas integrais atuais
        where = {
            shift_id: integralID,
            year: 2021,
        }

        if(type != '3') where.administration_type = type;

        const currentIntSchools = await StatsEnrollment.findAll({
            attributes: ['school_id'],
            where,
            group: ['school_id'],
        })

        const currentIntSchoolIds = currentIntSchools.map(stats => stats.school_id);

        // Listar, das escolas integrais atuais, quais eram regulares, anteriormente
        where = {
            school_id: currentIntSchoolIds,
            shift_id: {
                [Op.not]: integralID,
            },
        }

        const schools = await StatsEnrollment.findAll({
            attributes: [
                'school_id',
                [Sequelize.literal(`(SELECT "name" FROM "schools" WHERE "schools"."id" = "StatsEnrollment"."school_id")`), 'escolas'],
            ],
            where,
            group: ['school_id'],
        })

        const serializedSchools = [];
        let i = 0;
        for (const school of schools) {
            serializedSchools.push({
                label: schools[i].getDataValue('escolas'),
                value: school.school_id,
            });
            i += 1;
        }

        res.json(serializedSchools);
    },

    async averageIntSchoolsEvasion(req, res) {
        const { school_id, type } = req.query;
        let where = {};
        const integralID = [3];

        let countIntYears;
        let enrollmentsIntYears;
        let count_int_years = 0;
        let int_school_enrollments_count = 0;

        let countRegYears;
        let enrollmentsRegYears;
        let count_reg_years = 0;
        let reg_school_enrollments_count = 0;

        where = {
            school_id: school_id,
            shift_id: integralID,
        }

        if(type != '3') where.administration_type = type;

        // Anos em que a escola é integral
        countIntYears = await StatsEnrollment.findAll({
            attributes: [
                [Sequelize.literal('COUNT(DISTINCT(year))'), 'count']
            ],
            where,
        })

        enrollmentsIntYears = await StatsEnrollment.findAll({
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
            ],
            where,
        })

        where = {
            school_id: school_id,
            shift_id: {
                [Op.not]: integralID,
            }
        }

        if(type != '3') where.administration_type = type;

        // Anos em que a escola foi regular
        countRegYears = await StatsEnrollment.findAll({
            attributes: [
                [Sequelize.literal('COUNT(DISTINCT(year))'), 'count']
            ],
            where,
        })

        enrollmentsRegYears = await StatsEnrollment.findAll({
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('enrollments_count')), 'sum'],
            ],
            where,
        })

        if(enrollmentsRegYears && enrollmentsRegYears.length > 0) {
            reg_school_enrollments_count = enrollmentsRegYears[0].getDataValue('sum');
        }

        if(countRegYears && countRegYears.length > 0) {
            count_reg_years = countRegYears[0].getDataValue('count');
        }

        if(enrollmentsIntYears && enrollmentsIntYears.length > 0) {
            int_school_enrollments_count = enrollmentsIntYears[0].getDataValue('sum');
        }

        if(countIntYears && countIntYears.length > 0) {
            count_int_years = countIntYears[0].getDataValue('count')
        }

        const response = [
            { key: 'Média de Matrículas (Regular)', data: (reg_school_enrollments_count / count_reg_years).toFixed(2) },
            { key: 'Média de Matrículas (Integral)', data: (int_school_enrollments_count / count_int_years).toFixed(2) },
        ]

        res.json(response);
    },
};