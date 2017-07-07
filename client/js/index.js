$(function() {
    bindListner();
    login();
    var redirectUrl;

    function bindListner() {
        $('#loading').show();
        $('#login').hide();
        $('#code').show(1000);
        $('#codeSubmit').show(1000);
        $('.loading').hide();
        $('#codeSubmit').on('click', processAuthentication);

    }

    function processAuthentication(event) {
        event.preventDefault();
        var token = $('#code').val();
        if (token == "") {
            alert('You should copy and paste the code before submitting');
        } else {
            login(token, function(data) {
                if (!data.success) {
                    console.log('k')
                    $('#error').html(data.error)
                }
            })
        }
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function login(parameter1, parameter2) {
        var email = getCookie("email");
        var loginData, callback;
        var jsonData = {};

        console.log(document.cookie)
        if (typeof parameter1 === "function") {
            callback = parameter1;
        } else if (parameter1 && (typeof parameter2 === "function")) {
            jsonData.token = parameter1;
            callback = parameter2;
        }
        jsonData.email = email;
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/app/login',
            data: JSON.stringify(jsonData),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data);
                if (data.success) {
                    document.cookie = "email=" + data.email;
                    window.location = 'home.html'
                } else {
                    if (callback)
                        callback(data)
                    console.log(data.redirectUrl)
                    $('#login').attr('href', data.redirectUrl);
                    $('#loading').hide();
                    $('#login').show();
                    $('#code').show(1000);
                    $('#codeSubmit').show(1000);
                }
            },
            error: function(err) {
                console.log(err)
            }
        });
    }
})