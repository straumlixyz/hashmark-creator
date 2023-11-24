(function(){
    
    function onChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    async function hash(message) {
        const preprocessedBuffer = message.trim().replace(/\s+/g, ' ').toLowerCase();
        const msgBuffer = new TextEncoder().encode(preprocessedBuffer);                    
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async function processCSV(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [headers];
        console.log(lines)

        for (var i=1; i<allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var tarr = [];
                for (var j=0; j<headers.length; j++) {
                    if (j == 0) {
                        tarr.push(data[j]);
                    } else {
                        if (data[j] == "") {
                            tarr.push("");    
                        } else {
                            tarr.push(await hash(data[j]));
                        }
                    }
                }
                lines.push(tarr);
            }
        }
        return lines;
    }

    function onReaderLoad(event){
        processCSV(event.target.result).then((lines) => {
            let csvContent = "data:text/csv;charset=utf-8," + lines.map(e => e.join(",")).join("\n");
            var label = document.getElementById("button-label")
            label.setAttribute("for", "");
            label.style.display = "none";


            var wrapper = document.getElementById("download-link")
            wrapper.style.display = "block";
            wrapper.setAttribute("href", encodeURI(csvContent));
            wrapper.setAttribute("download", "my_data.csv");
        })
        
    }

    document.getElementById('file').addEventListener('change', onChange);

}());