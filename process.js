(function () {

    function onChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    async function hash(question, answer) {
        const preprocessedPass = answer.trim().replace(/\s+/g, ' ').toLowerCase();
        const preprocessedSalt = question.trim().replace(/\s+/g, ' ').toLowerCase();

        return await argon2.hash({
            pass: preprocessedPass,
            salt: preprocessedSalt,
            time: 32,
            mem: 102400,
            type: argon2.ArgonType.Argon2id
        }).then(h => h.hashHex);
    }

    async function processCSV(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [headers];
        console.log(lines)

        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var tarr = [];
                for (var j = 0; j < headers.length; j++) {
                    if (j == 0) {
                        tarr.push(data[j]);
                    } else {
                        if (data[j] == "") {
                            tarr.push("");
                        } else {
                            tarr.push(await hash(data[0], data[j]))
                        }
                    }
                }
                lines.push(tarr);
            }
        }
        return lines;
    }

    function onReaderLoad(event) {
        var wrapper = document.getElementById("button-wrapper");
        wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-10 h-10 inline mr-4 mb-1">
        <path stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
    Processing file... (~1 minute / answer)`;

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