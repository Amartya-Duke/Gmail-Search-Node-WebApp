$(function() {
    login();
    bindListner();
    var redirectUrl;

    function bindListner() {
        $('#login').on('click', function(event) {
            event.preventDefault();
            $('#code').show(1000);
            $('#codeSubmit').show(1000);
            login(function(data) {
                window.open(data.redirectUrl, "Authorize access to your gmail account", "width=500,height=500");
            })
        });
        $('#codeSubmit').on('click', processAuthentication);
        $('#code').hide();
        $('#codeSubmit').hide();
    }

    function processAuthentication(event) {
        event.preventDefault();
        var token = $('#code').val();
        if (token == "") {
            alert('You should copy and paste the code before submitting');
        } else {
            var jsonToken = {};
            jsonToken.token = token;
            login(jsonToken, function(data) {
                if (!data.success) {
                    $('#error').html(data.error)
                }
            })
        }
    }



    function login(parameter1, parameter2) {
        var loginData, callback;
        var jsonData;
        if (typeof parameter1 === "function") {
            callback = parameter1;
        } else if (parameter1 && (typeof parameter2 === "function")) {
            jsonData = parameter1;
            callback = parameter2;
        }
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/login',
            data: JSON.stringify(jsonData),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data);
                if (data.success)
                    window.location = 'home.html'
                else {
                    if (callback)
                        callback(data)
                }
            },
            error: function(err) {
                console.log(err)
            }
        });
    }

    function getMessages(event) {
        var clickedRow = event.currentTarget;
        console.log(clickedRow)
        var id = clickedRow.getAttribute('id');

        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:8080/getMessagesFromThreadId/' + id,
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