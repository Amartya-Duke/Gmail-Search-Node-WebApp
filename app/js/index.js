$(function() {
    $('.errorLogin').hide();
    $('#submit-btn').on('click', function() {
        login($('#no-of-days').val());
    })
    $('#codeSubmitBtn').on('click', function() {
        var code = $('#codeinput').val();
        var json = {};
        json.code = code;
        login($('#no-of-days').val(), json);
    })

    function login(noOfDays, code) {
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/getThreads/' + noOfDays,
            data: JSON.stringify(code),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data)
                if (!data.success) {
                    $('.errorLogin').show(1000);
                    window.open(data.redirectUrl, "Authorize access to your gmail account", "width=500,height=500");
                } else {
                    populateUI(data.data);
                }
            }
        });
    }

    function populateUI(data) {
        var table = $('#gmail-threads');
        table.html('');
        table.append('<tr>' +
            '<th>threadId</th>' +
            '<th>Snippet</th>' +
            '<th>historyId</th>' +
            '</tr>')
        for (var i = 0; i < data.length; i++) {
            var row = '<tr>' +
                '<td>' + data[i].id + '</td>' +
                '<td>' + data[i].snippet + '</td>' +
                '<td>' + data[i].historyId + '</td>' +
                '</tr>';
            table.append(row);
        }
    }
})