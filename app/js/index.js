$(function() {
    $('.errorLogin').hide();
    $('#submit-btn').on('click', function() {
        login();
    })
    $('#codeSubmitBtn').on('click', function() {
        var code = $('#codeinput').val();
        var json = {};
        json.code = code;
        login(json);
    })

    function login(code) {
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/login',
            data: JSON.stringify(code),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {

                if (!data.success) {
                    $('.errorLogin').show(1000);
                    window.open(data.redirectUrl, "Authorize access to your gmail account", "width=500,height=500");
                }
            }
        });
    }
})