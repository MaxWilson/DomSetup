function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function downloadLink(linkId, filename, text)
{
    $(linkId).attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
        .attr('title', filename) // set mouseover title
        .attr('download', filename);        
}

//download("myfile", Array(10000).join("hello world"));
$(function () {
    downloadLink('#modLink', "battle.mod", "This is the mod");
    downloadLink('#mapLink', "battle.map", "This is the map");
});
