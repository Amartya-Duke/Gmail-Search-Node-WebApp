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
        var threadsDiv = $('#wrapper');


        for (var i = 0; i < data.length; i++) {
            var row = '<div class="threads" id=' + data[i].id + '>' +
                '<div>' + data[i].snippet + '</div>' +
                '</div>';
            threadsDiv.append(row);
        }
        bindListner();
    }

    function bindListner() {
        $('.threads').on('click', getMessages);
    }

    function getMessages() {
        var clickedRow = event.currentTarget;
        console.log(clickedRow)
        var id = clickedRow.getAttribute('id');

        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:8080/getThreadsFromId/' + id,
            success: function(data) { //console.log(clickedRow.childNodes[2].childNodes[0])
                console.log(data.data.messages)
                var messageRow = "";
                var messageDiv = document.createElement('div');
                messageDiv.className = "messages";
                for (var i = 0; i < data.data.messages.length; i++) {
                    var messageRow = document.createElement('div');
                    messageRow.className = 'singlemessages';
                    messageRow.innerHTML = data.data.messages[i].snippet;
                    messageDiv.appendChild(messageRow);
                }
                document.getElementById(id).appendChild(messageDiv)
            }
        });
    }


})