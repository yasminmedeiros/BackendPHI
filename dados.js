const CSVToJSON = require("csvtojson");

const porte = ['-','1-A','1-B','2-A','3-A','4-A','4-B','5-A','5-B','6-A','6-B','7-A','7-B','8-A','8-B'];
const gre = [ '01ª GRE (João Pessoa)', '02ª GRE (Guarabira)', '03ª GRE (Campina Grande)', '04ª GRE (Cuité)', '05ª GRE (Monteiro)', '06ª GRE (Patos)', '07ª GRE (Itaporanga)', '08ª GRE (Catolé do Rocha)', '09ª GRE (Cajazeiras)', '10ª GRE (Sousa)', '11ª GRE (Princesa Isabel)', '12ª GRE (Itabaiana)', '13ª GRE (Pombal)', '14ª GRE (Mamanguape)' ];

(async () => {
    try {
        //const escolas = await CSVToJSON().fromFile("data_saber2.csv");
        console.log(await mediaMatriculasPorGRE(escolas));
    } catch (error) {
        console.log(error);
    }
})();

async function totalEscolas(escolas) {
    return escolas.length;
}

async function exibirEscolasPorPorte(escolas) {
    let escolasPorPorte = porte.map((porte) => {
        let cont = 0
        escolas.map((porteEscola) => {
            if(porteEscola["Porte"] == porte) {
                cont++;
            }
        });
        return cont;
    });
    return escolasPorPorte;
}

async function totalMatriculasPorPorte(escolas) {
    let escolasPorPorte = porte.map((porte) => {
        let cont = 0
        escolas.map((porteEscola) => {
            if(porteEscola["Porte"] == porte) {
                cont += Number.parseInt(porteEscola["Matrículas*"]);
            }
        });
        return cont;
    });
    return escolasPorPorte;
}

async function totalEscolasPorGRE(escolas) {
    let escolasPorGRE = gre.map((gre) => {
        let cont = 0
        escolas.map((greEscola) => {
            if(greEscola["Gerência Regional"] == gre) {
                cont ++
            }
        });
        return cont;
    });
    return escolasPorGRE;
}

async function totalMatriculasPorGRE(escolas) {
    let escolasPorGRE = gre.map((gre) => {
        let cont = 0
        escolas.map((greEscola) => {
            if(greEscola["Gerência Regional"] == gre) {
                cont += Number.parseInt(greEscola["Matrículas*"]);
            }
        });
        return cont;
    });
    return escolasPorGRE;
}

async function mediaMatriculasPorGRE(escolas) {
    let totalMatriculas = await totalMatriculasPorGRE(escolas);
    let totalEscolas = await totalEscolasPorGRE(escolas);
    let media = totalMatriculas.map((matriculas, i) => {
        return Math.round((matriculas / totalEscolas[i]));
    });
    return media;
}