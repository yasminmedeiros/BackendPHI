const Sequelize = require('sequelize');
const dbConfig = require('../config/config');

const StatsContract = require('./StatsContract');
const City = require('./City');
const RegionalAdministration = require('./RegionalAdministration');
const School = require('./School');
const StatsEnrollment = require('./StatsEnrollment');
const Shift = require('./Shift');
const SchoolSize = require('./SchoolSize');
const District = require('./District');
const Address = require('./Address');
const Course = require('./Course');
const EnrollmentRatingReport = require('./EnrollmentRatingReport');
const Grade = require('./Grade');
const CurriculumMatrixGrade = require('./CurriculumMatrixGrade');
const SchoolClass = require('./SchoolClass');
const Enrollment = require('./Enrollment');
const Student = require('./Student');

const connection = new Sequelize(dbConfig['development']);

StatsContract.init(connection);
City.init(connection);
RegionalAdministration.init(connection);
School.init(connection);
StatsEnrollment.init(connection);
Shift.init(connection);
SchoolSize.init(connection);
District.init(connection);
Address.init(connection);
Course.init(connection);
CurriculumMatrixGrade.init(connection);
EnrollmentRatingReport.init(connection);
Grade.init(connection);
SchoolClass.init(connection);
Enrollment.init(connection);
Student.init(connection);

StatsContract.associate(connection.models);
City.associate(connection.models);
RegionalAdministration.associate(connection.models);
School.associate(connection.models);
StatsEnrollment.associate(connection.models);
Shift.associate(connection.models);
SchoolSize.associate(connection.models);
District.associate(connection.models);
Address.associate(connection.models);
Course.associate(connection.models);
CurriculumMatrixGrade.associate(connection.models);
EnrollmentRatingReport.associate(connection.models);
Grade.associate(connection.models);
SchoolClass.associate(connection.models);
Enrollment.associate(connection.models);
Student.associate(connection.models);