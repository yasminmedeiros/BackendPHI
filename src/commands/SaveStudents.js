const School = require('../database/models/School');
const { Op, Sequelize } = require("sequelize");
const fs = require('fs');
const SchoolClass = require('../database/models/SchoolClass');
const Enrollment = require('../database/models/Enrollment');
const EnrollmentRatingReport = require('../database/models/EnrollmentRatingReport');
const CurriculumMatrixGrade = require('../database/models/CurriculumMatrixGrade');
const Grade = require('../database/models/Grade');
const Course = require('../database/models/Course');
const console = require('console');
const { Console, time } = require('console');

require('../database/models/initConnection');

const SaveStudents = async (i) => {
    let courses = [];
    let students = [];
    let courseName = '';
    const intervalo = 1;
    console.time()

    var limite = i + intervalo;

    try {
        const enrollmentsIds = ( await EnrollmentRatingReport.findAll({
            attributes: ['enrollment_id'],
            group: ['enrollment_id'],
            offset: i,
            limit: intervalo,
            subQuery:false
        })).map(stats => stats.enrollment_id)
        var newLimit = enrollmentsIds.length
        for(let enrollmentId of enrollmentsIds) { 
            i = i + 1;
            const enrollRatingReports = await EnrollmentRatingReport.findAll({
                attributes: [
                    'enrollment_id',
                    'final_rating',
                    'final_result',
                    'course_id',
                ],
                where: { enrollment_id: enrollmentId },
            })

            for(let enrollRatingReport of enrollRatingReports) {
                courseName = ( await Course.findOne({
                    attributes: [
                        'name',
                    ],
                    where: { id: enrollRatingReport.course_id }
                })).name

                courses.push({
                    name: courseName,
                    final_rating: enrollRatingReport.final_rating,
                    final_result: enrollRatingReport.final_result,
                    course_id: enrollRatingReport.course_id,
                })
            }

            const enrollment = await Enrollment.findOne({
                attributes: [
                    'school_class_id',
                    'id',
                    'student_id'
                ],
                where: { 
                    id: enrollmentId,
                    school_class_id: {
                        [Op.ne]: null,
                    }
                }
            })

            const schoolClass = await SchoolClass.findOne({
                attributes: [
                    'name',
                    'school_id',
                    'curriculum_matrix_grade_id',
                    'id',
                    'shift_id',
                    'year'
                ],
                where: { 
                    id: enrollment.school_class_id,
                    school_id: {
                        [Op.ne]: null,
                    },
                    curriculum_matrix_grade_id: {
                        [Op.ne]: null,
                    },
                },
            })

            const school = await School.findOne({
                attributes: [
                    'name',
                    'id',
                    'administration_type',
                ],
                where: { id: schoolClass.school_id }
            })

            const currMatrixGrade = await CurriculumMatrixGrade.findOne({
                attributes: [
                    'grade_id',
                ],
                where: { 
                    id: schoolClass.curriculum_matrix_grade_id,
                    grade_id: {
                        [Op.ne]: null,
                    }
                }
            })

            const grade = await Grade.findOne({
                attributes: [
                    'name',
                    'id'
                ],
                where: { id: currMatrixGrade.grade_id }
            })

            students.push({
                enrollment_id: enrollmentId,
                grade: grade.name,
                grade_id: grade.id,
                shift_id: schoolClass.shift_id,
                school_class: schoolClass.name,
                school_class_id: schoolClass.id,
                student_id: enrollment.student_id,
                school: school.name,
                school_id: school.id,
                year: schoolClass.year,
                administration_type: school.administration_type,
                courses,
            });

            courses = [];
            courseName = '';
            if(i == newLimit) {
                break;
            }
        }

        const obj = { students };
        const json = JSON.stringify(obj);
        const limiteJson = JSON.stringify({"indice":limite});
        fs.writeFileSync(`./utils/students_${i}_2022.json`, json, 'utf8');
        fs.writeFileSync(`./utils/indice.json`, limiteJson, 'utf8');

        console.timeEnd()
    } catch (error) {
        console.log(error);
    }
}


fs.readFile('./utils/indice.json','utf8', function(err,data){
    let i = JSON.parse(data)["indice"];
    SaveStudents(i);
});
