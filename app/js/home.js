$(function() {



    bindListners();

    function bindListners() {
        $('#refresh').on('click', refresh);
        $('#search-submit-btn').on('click', search);
        $('#logout').on('click', logout);
    }

    function search(event) {
        event.preventDefault();
        var query = $('#search-input').val();
        console.log(query)
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/fetchData/' + query,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data)
                populateUI(data);
            },
            error: function(err) {
                console.log(err)
            }
        });
    }

    function refresh(event) {
        event.preventDefault();
        var noOfDays = prompt('Enter no of days of history you want to fetch from your Gmail account:');
        if (isNaN(noOfDays)) {
            alert("Please enter only numeric values");
            return;
        }
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/getThreads/' + noOfDays,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data)
                if (data.success) {
                    window.location = "index.html"
                } else {
                    alert('Error loging out' + data.err);
                }
            },
            error: function(err) {
                console.log(err)
            }
        });
    }

    function logout(event) {
        event.preventDefault();
        if (confirm('Are you sure to logout ?')) {
            $.ajax({
                type: 'POST',
                url: 'http://127.0.0.1:8080/logout',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    console.log(data)
                    if (data.success) {
                        window.location = "index.html"
                    } else {
                        alert('Error loging out' + data.err);
                    }
                },
                error: function(err) {
                    console.log(err)
                }
            });
        }
    }


    function populateUI(data) {
        var threadsDiv = $('#wrapper');
        if (data.length == 0) {
            $('#msg').html("No result found. If this is your first time please click refresh to fetch data from your Gmail account. This is one time process only");
        }

        for (var i = 0; i < data.length; i++) {
            var mainDiv = document.createElement('div');
            mainDiv.className = "threads";
            mainDiv.id = data[i].id;

            var divThread = document.createElement('div');
            divThread.innerHTML = data[i].snippet;

            var messageDiv = document.createElement('div');
            messageDiv.className = "messages";
            for (var j = 0; j < data[i].messages.length; j++) {
                var messageRow = document.createElement('div');
                messageRow.className = 'singlemessages';
                messageRow.innerHTML = data[i].messages[j].snippet;
                messageDiv.appendChild(messageRow);
            }
            mainDiv.appendChild(divThread);
            mainDiv.appendChild(messageDiv);
            document.getElementById('wrapper').appendChild(mainDiv);

        }
    }
})