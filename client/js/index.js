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
            url: 'http://127.0.0.1:8080/app/login',
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




})