const express = require('express');
// const StatsContractController = require('./controllers/StatsContractController');
const StatsEnrollmentController = require('./controllers/StatsEnrollmentController');
const EnrollmentRatingReportController = require('./controllers/EnrollmentRatingReportController');

const routes = express.Router();

routes.get("/enrollments/get-years", StatsEnrollmentController.getYears);
routes.get("/enrollments/get-schools", StatsEnrollmentController.getSchools);
routes.get("/enrollments/get-gres", StatsEnrollmentController.getGres);
routes.get("/enrollments/get-sizes", StatsEnrollmentController.getSizes);

routes.get("/enrollments/by-city", StatsEnrollmentController.findHighestEnrollmentsPerCity);
routes.get("/enrollments/in-years", StatsEnrollmentController.enrollmentsInYears);
routes.get("/schools/in-years-gre", StatsEnrollmentController.schoolsInYearsPerGre);
routes.get("/schools/in-years-size", StatsEnrollmentController.schoolsInYearsPerSize);
routes.get("/enrollments/total-in-years", StatsEnrollmentController.totalEnrollmentsInYears);

routes.get("/enrollments/get-highest", StatsEnrollmentController.findHighestEnrollments);
routes.get("/enrollments/get-lowest", StatsEnrollmentController.findLowestEnrollments);

routes.get("/enrollments/get-schools-by-size", StatsEnrollmentController.findAllSchoolsPerSize);
routes.get("/enrollments/get-enrollments-by-size", StatsEnrollmentController.findAllEnrollmentsPerSize);
routes.get("/enrollments/get-average-by-size", StatsEnrollmentController.findAllAveragesPerSize);

routes.get("/enrollments/get-schools-by-gre", StatsEnrollmentController.findAllSchoolsPerGre);
routes.get("/enrollments/get-enrollments-by-gre", StatsEnrollmentController.findAllEnrollmentsPerGre);
routes.get("/enrollments/get-average-by-gre", StatsEnrollmentController.findAllAveragesPerGre);

//routes.get("/enrollmentsratings/get-approved-students", EnrollmentRatingReportController.findAllApprovedEnrollments);
//routes.get("/enrollmentsratings/get-reproved-students", EnrollmentRatingReportController.findAllReprovedEnrollments);
routes.get("/enrollmentsratings/get-returning-students-eja", EnrollmentRatingReportController.studentsReturnToEJA);
routes.get("/enrollmentsratings/get-student-retention", EnrollmentRatingReportController.studentsRetention);
routes.get("/enrollmentsratings/get-infantil-retention", EnrollmentRatingReportController.studentsRetentionByGradeInfantil)
routes.get("/enrollmentsratings/get-fundamental-retention", EnrollmentRatingReportController.studentsRetentionByGradeFundamental);
routes.get("/enrollmentsratings/get-medio-retention", EnrollmentRatingReportController.studentsRetentionByGradeMedio);
routes.get("/enrollmentsratings/get-eja-retention", EnrollmentRatingReportController.studentsRetentionByGradeEJA);

routes.get("/enrollments/get-city-location", StatsEnrollmentController.findAllCityLocation);

routes.get("/enrollments/get-all-schools-info", StatsEnrollmentController.allSchoolsInfos);

routes.get("/enrollments/get-pro-highest-enroll", StatsEnrollmentController.getProHighestEnrollments);
routes.get("/enrollments/get-pro-schools-per-city", StatsEnrollmentController.findProHighestEnrollmentsPerCity);
routes.get("/enrollments/get-pro-schools-by-size", StatsEnrollmentController.findAllProSchoolsPerSize);
routes.get("/enrollments/get-pro-enrollments-by-size", StatsEnrollmentController.findAllProEnrollmentsPerSize);
routes.get("/enrollments/get-pro-averages-by-size", StatsEnrollmentController.findAllProAveragesPerSize);
routes.get("/enrollments/get-pro-schools-by-gre", StatsEnrollmentController.findAllProSchoolsPerGre);
routes.get("/enrollments/get-pro-enrollments-by-gre", StatsEnrollmentController.findAllProEnrollmentsPerGre);
routes.get("/enrollments/get-pro-averages-by-gre", StatsEnrollmentController.findAllProAveragesPerGre);
routes.get("/schools/pro-in-years-gre", StatsEnrollmentController.proSchoolsInYearsPerGre);
routes.get("/schools/pro-in-years-size", StatsEnrollmentController.proSchoolsInYearsPerSize);
routes.get("/enrollments/pro-total-in-years", StatsEnrollmentController.totalProEnrollmentsInYears);
routes.get("/schools/get-pro-schools", StatsEnrollmentController.findAllProSchools);
routes.get("/enrollments/get-early-fundamental-students-in-years", EnrollmentRatingReportController.findAllEarlyFundamentalStudentsInYears);
routes.get("/enrollments/get-integral-students-in-years", EnrollmentRatingReportController.findAllIntegralStudentsInYears);
routes.get("/enrollments/get-late-fundamental-students-in-years", EnrollmentRatingReportController.findAllLateFundamentalStudentsInYears);
routes.get("/enrollments/get-mean-integral-school-evasion-previously-regular", StatsEnrollmentController.averageIntSchoolsEvasion);
routes.get("/schools/get-all-integral-schools-that-were-regular", StatsEnrollmentController.getAllCurrentIntSchoolsThatWereRegular);

routes.get("/enrollments/get-first-medio-students-in-years", EnrollmentRatingReportController.findAllFirstMedioStudentsInYears);
routes.get("/enrollments/get-second-medio-students-in-years", EnrollmentRatingReportController.findAllSecondMedioStudentsInYears);
routes.get("/enrollments/get-third-medio-students-in-years", EnrollmentRatingReportController.findAllThirdMedioStudentsInYears);

routes.get("/enrollments/get-pro-schools-that-were-regular", StatsEnrollmentController.findAllProSchoolsThatWereRegular);
routes.get("/enrollments/get-pro-schools-that-were-regular-in-years", StatsEnrollmentController.findAllProSchoolsThatWereRegularInYears);

routes.get("/enrollments/get-censo-early-fundamental-comparison", EnrollmentRatingReportController.censoEarlyYearsFundamentalComparison);
routes.get("/enrollments/get-censo-late-fundamental-comparison", EnrollmentRatingReportController.censoLateYearsFundamentalComparison);
routes.get("/enrollments/get-censo-infantil-comparison", EnrollmentRatingReportController.censoInfantilComparison);
routes.get("/enrollments/get-censo-integral-comparison", EnrollmentRatingReportController.censoIntegralComparison);
routes.get("/enrollments/get-censo-medio-comparison", EnrollmentRatingReportController.censoMedioComparison);
routes.get("/enrollments/get-censo-eja-fundamental-comparison", EnrollmentRatingReportController.censoEJAFundamentalComparison);
routes.get("/enrollments/get-censo-eja-medio-comparison", EnrollmentRatingReportController.censoEJAMedioComparison);


routes.get("/escolas", async (req, res) => {
    const escolas = await CSVToJSON().fromFile("data_saber3.csv");
    res.json({ escolas });
});

routes.get("/coordenadas_escolas", async (req, res) => {
    const escolas = await CSVToJSON().fromFile("coordenadas_escolas.csv");
    res.json({ escolas });
});

routes.get("/coordenadas_matriculas", async (req, res) => {
    const escolas = await CSVToJSON().fromFile("coordenadas_matriculas.csv");
    res.json({ escolas });
});

module.exports = routes;