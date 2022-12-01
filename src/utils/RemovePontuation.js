const removePontuation = (str) => {
    with_pontuation = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    without_pontuation = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
    newStr="";

    for(i=0; i<str.length; i++) {
        change=false;
        for (a=0; a<with_pontuation.length; a++) {
            if (str.substr(i,1)==with_pontuation.substr(a,1)) {
                newStr+=without_pontuation.substr(a,1);
                change=true;
                break;
            }
        }
        if (change==false) {
            newStr+=str.substr(i,1);
        }
    }

    return newStr;
}

module.exports = removePontuation;