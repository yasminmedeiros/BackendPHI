const School = require('../database/models/School');
const { Op, Sequelize } = require("sequelize");
const SchoolClass = require('../database/models/SchoolClass');
const Enrollment = require('../database/models/Enrollment');
const StatsEnrollment = require('../database/models/StatsEnrollment');
const EnrollmentRatingReport = require('../database/models/EnrollmentRatingReport');
const fs = require('fs');
const console = require('console');

module.exports = {
    async findStudentsSituation(req, res) {
        try {
            const reproved = await EnrollmentRatingReport.findAll({
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('final_result')), 'reproved'],
                ],
                where: {
                    final_rating: {
                        [Op.lt]: 2.5,
                        [Op.between]: [10.1, 25]
                    }
                }
            });

            const approved = await EnrollmentRatingReport.findAll({
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('final_result')), 'approved'],
                ],
                where: {
                    final_rating: {
                        [Op.between]: [7.0, 10.0],
                        [Op.between]: [70.0, 100.0]
                    }
                }
            });


            res.json(response);
        } catch (error) {
            console.log(error);
        }
    },

    async studentsRetention(req, res) {
        const { type,year } = req.query;
        try { 
            const { year, type } = req.query;
            const json = fs.readFileSync('./src/utils/generateGraphicsJsons2022/students.json', 'utf8');
            // const json = fs.readFileSync('./src/utils/students.json', 'utf8');
            const obj = JSON.parse(json);

            const retention = [
                { key: 'Ensino Infantil', data: obj["infantil"][year] },
                { key: 'Ensino Fundamental', data: obj["fundamental"][year] },
                { key: 'Ensino Médio', data: obj["medio"][year] },
                { key: 'EJA', data: obj["eja"][year] },
            ]

            res.json(retention);
        } catch (error) {
            console.log(error);
        }
    },

    async studentsReturnToEJA(req, res) {
        try {
            const { year, type } = req.query;
            const json = fs.readFileSync('./src/utils/generateGraphicsJsons2022/eja_ex.json', 'utf8');
            const obj = JSON.parse(json);
            const response = [
                { key: 'Alunos do Ensino Fundamental que voltaram pelo EJA', data: obj["alunos_eja_f"][year] },
                { key: 'Alunos do Ensino Infantil que voltaram pelo EJA', data: obj["alunos_eja_i"][year] },
                { key: 'Alunos do Ensino Médio que voltaram pelo EJA', data: obj["alunos_eja_em"][year] },
            ]

            res.json(response);
        } catch (error) {
            console.log(error);
        }
    },

    async studentsRetentionByGradeInfantil(req, res) {
        try {
            const { year, type } = req.query;
            const json = fs.readFileSync('./src/utils/generateGraphicsJsons2022/infantil.json', 'utf8');
            // const json = fs.readFileSync('./src/utils/students.json', 'utf8');
            const obj = JSON.parse(json);
            
            const retention = [
                { key: 'Creche: Bebês', data: obj["bebes"][year] },
                { key: 'Creche: Crianças bem pequenas', data: obj["criancas_bem_pequenas"][year] },
                { key: 'Pré-escola: Crianças pequenas', data: obj["criancas_pequenas"][year] },
            ]

            res.json(retention);
        } catch (error) {
            console.log(error)
        }
    },
    
    async studentsRetentionByGradeFundamental(req, res) {
        try {
            const { year, type } = req.query;
            const json = fs.readFileSync('./src/utils/generateGraphicsJsons2022/fudamental.json', 'utf8');
            // const json = fs.readFileSync('./src/utils/students.json', 'utf8');
            const obj = JSON.parse(json);
            const retention = [
                { key: 'Primeiro Ano', data: obj["alunos_1_ano"][year] },
                { key: 'Segundo Ano', data: obj["alunos_2_ano"][year] },
                { key: 'Terceiro Ano', data: obj["alunos_3_ano"][year] },
                { key: 'Quarto Ano', data: obj["alunos_4_ano"][year] },
                { key: 'Quinto Ano', data: obj["alunos_5_ano"][year] },
                { key: 'Sexto Ano', data: obj["alunos_6_ano"][year] },
                { key: 'Setimo Ano', data: obj["alunos_7_ano"][year] },
                { key: 'Oitavo Ano', data: obj["alunos_8_ano"][year] },
                { key: 'Nono Ano', data: obj["alunos_9_ano"][year] },
            ]

            res.json(retention);
        } catch (error) {
            console.log(error)
        }
    },

    async studentsRetentionByGradeMedio(req, res) {
        try {
            const { year, type } = req.query;
            const json = fs.readFileSync('./src/utils/generateGraphicsJsons2022/medio.json', 'utf8');
            // const json = fs.readFileSync('./src/utils/students.json', 'utf8');
            const obj = JSON.parse(json);
            
            const retention = [
                { key: '1ª Série', data: obj["alunos_medio_1_ano"][year] },
                { key: '2ª Série', data: obj["alunos_medio_2_ano"][year]  },
                { key: '3ª Série', data: obj["alunos_medio_3_ano"][year]  },
            ]

            res.json(retention);
        } catch (error) {
            console.log(error)
        }
    },

    async studentsRetentionByGradeEJA(req, res) {
        try {
            const { year, type } = req.query;
            const json = fs.readFileSync('./src/utils/generateGraphicsJsons2022/eja.json', 'utf8');
            const obj = JSON.parse(json);

            const retention = [
                { key: 'Ciclo I', data: obj["alunos_eja_1_ciclo"][year] },
                { key: 'Ciclo II', data: obj["alunos_eja_2_ciclo"][year] },
                { key: 'Ciclo III', data: obj["alunos_eja_3_ciclo"][year] },
                { key: 'Ciclo IV', data: obj["alunos_eja_4_ciclo"][year] },
                { key: 'Ciclo V', data: obj["alunos_eja_5_ciclo"][year] },
                { key: 'Ciclo VI', data: obj["alunos_eja_6_ciclo"][year] },
            ]

            res.json(retention);
        } catch (error) {
            console.log(error)
        }
    },
    //Contagem turmas e turnos:
    async findAllEarlyFundamentalStudentsInYears(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/Data/early_fundamental.json', 'utf8');
        const obj = JSON.parse(json);
        let studentsEarlyYears = [];
        let total = {}
        
        if(type != '3') {
            for(const key of Object.keys(obj[type])){
                studentsEarlyYears.push(
                    {
                        key: key,
                        data: obj[type][key]
                    }
                )
            }
        }else{
            for(const t of Object.keys(obj)){
                for(const year of Object.keys(obj[t])){
                    if(year in total){
                        total[year] = parseInt(total[year], 10) + parseInt(obj[t][year], 10);
                    }else{
                        total[year] = obj[t][year];
                    }
                }
            }
            for(const key of Object.keys(total)){
                studentsEarlyYears.push(
                    {
                        key: key,
                        data: total[key]
                    }
                )
            }
        }

        res.json(studentsEarlyYears);

    },

    async findAllLateFundamentalStudentsInYears(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/Data/late_fundamental.json', 'utf8');
        const obj = JSON.parse(json);
        let studentsLateYears = [];
        let total = {}
        
        if(type != '3') {
            for(const key of Object.keys(obj[type])){
                studentsLateYears.push(
                    {
                        key: key,
                        data: obj[type][key]
                    }
                )
            }
        }else{
            for(const t of Object.keys(obj)){
                for(const year of Object.keys(obj[t])){
                    if(year in total){
                        total[year] = parseInt(total[year], 10) + parseInt(obj[t][year], 10);
                    }else{
                        total[year] = obj[t][year];
                    }
                }
            }
            for(const key of Object.keys(total)){
                studentsLateYears.push(
                    {
                        key: key,
                        data: total[key]
                    }
                )
            }
        }

        res.json(studentsLateYears);
    },
    
    async findAllFirstMedioStudentsInYears(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/Data/first_medio.json', 'utf8');
        // const json = fs.readFileSync('./src/utils/students.json', 'utf8');
        const obj = JSON.parse(json);
        let firstMedioInYears = [];
        let total = {}
        
        if(type != '3') {
            for(const key of Object.keys(obj[type])){
                firstMedioInYears.push(
                    {
                        key: key,
                        data: obj[type][key]
                    }
                )
            }
        }else{
            for(const t of Object.keys(obj)){
                for(const year of Object.keys(obj[t])){
                    if(year in total){
                        total[year] = parseInt(total[year], 10) + parseInt(obj[t][year], 10);
                    }else{
                        total[year] = obj[t][year];
                    }
                }
            }
            for(const key of Object.keys(total)){
                firstMedioInYears.push(
                    {
                        key: key,
                        data: total[key]
                    }
                )
            }
        }

        res.json(firstMedioInYears);
    },
    
    async findAllSecondMedioStudentsInYears(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/Data/second_medio.json', 'utf8');
        const obj = JSON.parse(json);
        let secondMedioInYears = [];
        let total = {}
        
        if(type != '3') {
            for(const key of Object.keys(obj[type])){
                secondMedioInYears.push(
                    {
                        key: key,
                        data: obj[type][key]
                    }
                )
            }
        }else{
            for(const t of Object.keys(obj)){
                for(const year of Object.keys(obj[t])){
                    if(year in total){
                        total[year] = parseInt(total[year], 10) + parseInt(obj[t][year], 10);
                    }else{
                        total[year] = obj[t][year];
                    }
                }
            }
            for(const key of Object.keys(total)){
                secondMedioInYears.push(
                    {
                        key: key,
                        data: total[key]
                    }
                )
            }
        }

        res.json(secondMedioInYears);
    },
    
    async findAllThirdMedioStudentsInYears(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/Data/third_medio.json', 'utf8');
        const obj = JSON.parse(json);
        let thirdMedioInYears = [];
        let total = {}
        
        if(type != '3') {
            for(const key of Object.keys(obj[type])){
                thirdMedioInYears.push(
                    {
                        key: key,
                        data: obj[type][key]
                    }
                )
            }
        }else{
            for(const t of Object.keys(obj)){
                for(const year of Object.keys(obj[t])){
                    if(year in total){
                        total[year] = parseInt(total[year], 10) + parseInt(obj[t][year], 10);
                    }else{
                        total[year] = obj[t][year];
                    }
                }
            }
            for(const key of Object.keys(total)){
                thirdMedioInYears.push(
                    {
                        key: key,
                        data: total[key]
                    }
                )
            }
        }

        res.json(thirdMedioInYears);
    },
    
    async findAllIntegralStudentsInYears(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/Data/integral.json', 'utf8');
        const obj = JSON.parse(json);
        let integralInYears = [];
        let total = {}
        
        if(type != '3') {
            for(const key of Object.keys(obj[type])){
                integralInYears.push(
                    {
                        key: key,
                        data: obj[type][key]
                    }
                )
            }
        }else{
            for(const t of Object.keys(obj)){
                for(const year of Object.keys(obj[t])){
                    if(year in total){
                        total[year] = parseInt(total[year], 10) + parseInt(obj[t][year], 10);
                    }else{
                        total[year] = obj[t][year];
                    }
                }
            }
            for(const key of Object.keys(total)){
                integralInYears.push(
                    {
                        key: key,
                        data: total[key]
                    }
                )
            }
        }

        res.json(integralInYears);
    },
    
    // REQUESTS CENSO PB 2021
    async censoEarlyYearsFundamentalComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/CensoComp/comp_early_fund.json', 'utf8');
        const obj = JSON.parse(json);
        let count;
        let count_pb
        
        if(type != '3') {
            count = parseInt(obj[type]["quantidade_matricula"], 10)
            count_pb = parseInt(obj[type]["quantidade_matricula_censo"], 10)
        }else{
            count = parseInt(obj["0"]["quantidade_matricula"], 10) + parseInt(obj["1"]["quantidade_matricula"], 10)
            count_pb = parseInt(obj["0"]["quantidade_matricula_censo"], 10) + parseInt(obj["1"]["quantidade_matricula_censo"], 10)
        }

        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    },
        
    async censoLateYearsFundamentalComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/CensoComp/comp_late_fund.json', 'utf8');
        const obj = JSON.parse(json);
        let count;
        let count_pb
        
        if(type != '3') {
            count = parseInt(obj[type]["quantidade_matricula"], 10)
            count_pb = parseInt(obj[type]["quantidade_matricula_censo"], 10)
        }else{
            count = parseInt(obj["0"]["quantidade_matricula"], 10) + parseInt(obj["1"]["quantidade_matricula"], 10)
            count_pb = parseInt(obj["0"]["quantidade_matricula_censo"], 10) + parseInt(obj["1"]["quantidade_matricula_censo"], 10)
        }

        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    },
        
    async censoInfantilComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/students_40k_att.json', 'utf8');
        const json_pb = fs.readFileSync('./src/utils/Dados Censo PB 2021/censo pb 2021.json', 'utf-8')
        // const json = fs.readFileSync('./src/utils/students.json', 'utf8');
        const obj = JSON.parse(json);
        const obj_censo = JSON.parse(json_pb);
        let censoInfantil = []
        let count_pb = 0

        const infantil = [1, 2, 3]
        count = 0;
        obj.students.forEach(item => {
            if (infantil.includes(item.grade_id)) {
                if(item.administration_type == type) {
                    if(item.year == '2021') {
                        count += 1;
                    }        
                }
                if(type == '3') {
                    if(item.year == '2021') {
                        count += 1;
                    }  
                }
            }
        })

        if(type == 0) {
            count_pb = obj_censo[0]['Creche Parcial'] + obj_censo[0]['Creche Integral']+ obj_censo[0]['Pré Escola Parcial']+ obj_censo[0]['Pré Escola Integral'] + obj_censo[1]['Creche Parcial'] + obj_censo[1]['Creche Integral']+ obj_censo[1]['Pré Escola Parcial']+ obj_censo[1]['Pré Escola Integral']
        }
        if(type == 1) {
            count_pb = obj_censo[2]['Creche Parcial'] + obj_censo[2]['Creche Integral']+ obj_censo[2]['Pré Escola Parcial']+ obj_censo[2]['Pré Escola Integral'] + obj_censo[3]['Creche Parcial'] + obj_censo[3]['Creche Integral']+ obj_censo[3]['Pré Escola Parcial']+ obj_censo[3]['Pré Escola Integral']
        }
        if(type == 3) {
            count_pb = obj_censo[4]['Creche Parcial'] + obj_censo[4]['Creche Integral']+ obj_censo[4]['Pré Escola Parcial']+ obj_censo[4]['Pré Escola Integral']

        }

        console.log(obj_censo[1]['Creche Parcial'] + obj_censo[2]['Creche Parcial'])
        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    //     censoInfantil.push({ 
    //         key: 'Quantidade de Matrículas',
    //         data: count,
    //     })

    // res.json(censoInfantil);

    },
        
    async censoMedioComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/CensoComp/comp_med.json', 'utf8');
        const obj = JSON.parse(json);
        let count;
        let count_pb
        
        if(type != '3') {
            count = parseInt(obj[type]["quantidade_matricula"], 10)
            count_pb = parseInt(obj[type]["quantidade_matricula_censo"], 10)
        }else{
            count = parseInt(obj["0"]["quantidade_matricula"], 10) + parseInt(obj["1"]["quantidade_matricula"], 10)
            count_pb = parseInt(obj["0"]["quantidade_matricula_censo"], 10) + parseInt(obj["1"]["quantidade_matricula_censo"], 10)
        }

        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    },
        
    async censoIntegralComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/CensoComp/comp_int.json', 'utf8');
        const obj = JSON.parse(json);
        let count;
        let count_pb
        
        if(type != '3') {
            count = parseInt(obj[type]["quantidade_matricula"], 10)
            count_pb = parseInt(obj[type]["quantidade_matricula_censo"], 10)
        }else{
            count = parseInt(obj["0"]["quantidade_matricula"], 10) + parseInt(obj["1"]["quantidade_matricula"], 10)
            count_pb = parseInt(obj["0"]["quantidade_matricula_censo"], 10) + parseInt(obj["1"]["quantidade_matricula_censo"], 10)
        }

        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    },
        
    async censoEJAFundamentalComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/CensoComp/comp_eja_fund.json', 'utf8');
        const obj = JSON.parse(json);
        let count;
        let count_pb
        
        if(type != '3') {
            count = parseInt(obj[type]["quantidade_matricula"], 10)
            count_pb = parseInt(obj[type]["quantidade_matricula_censo"], 10)
        }else{
            count = parseInt(obj["0"]["quantidade_matricula"], 10) + parseInt(obj["1"]["quantidade_matricula"], 10)
            count_pb = parseInt(obj["0"]["quantidade_matricula_censo"], 10) + parseInt(obj["1"]["quantidade_matricula_censo"], 10)
        }

        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    },
        
    async censoEJAMedioComparison(req, res) {
        const { type } = req.query;
        const json = fs.readFileSync('./src/utils/CensoComp/comp_eja_med.json', 'utf8');
        const obj = JSON.parse(json);
        let count;
        let count_pb
        
        if(type != '3') {
            count = parseInt(obj[type]["quantidade_matricula"], 10)
            count_pb = parseInt(obj[type]["quantidade_matricula_censo"], 10)
        }else{
            count = parseInt(obj["0"]["quantidade_matricula"], 10) + parseInt(obj["1"]["quantidade_matricula"], 10)
            count_pb = parseInt(obj["0"]["quantidade_matricula_censo"], 10) + parseInt(obj["1"]["quantidade_matricula_censo"], 10)
        }

        const response = [
            { key: 'Quantidade de Matrículas', data: count },
            { key: 'Quantidade de Matrículas (Censo)', data: count_pb },
        ]

        res.json(response);
    },

};