$(function() {



    bindListners();

    function bindListners() {
        $('#refresh').on('click', refresh);
        $('#search-submit-btn').on('click', search);
        $('#logout').on('click', logout);

    }

    function search(event) {
        event.preventDefault();
        $('.loading').hide();
        var query = $('#search-input').val();
        console.log(query)
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/fetchData/' + query,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data)
                populateUI(data, query);
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
        $('#msg').hide();
        $('#wrapper').html("");
        $('.loading').show();
        $('.loading img').show();
        $('.loading p').html('Please wait while your inbox is downloaded')
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/getThreads/' + noOfDays,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data)
                if (data.success) {
                    $('.loading img').hide();
                    $('.loading p').html(data.count + ' threads downloaded from your inbox')
                }
            },
            error: function(err) {
                console.log(err)
            }
        });
    }

    function logout(event) {
        event.preventDefault();
        console.log('sjn')
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


    function populateUI(data, query) {
        var threadsDiv = $('#wrapper');
        if (data.length == 0) {
            $('#msg').html("No result found. If this is your first time please click refresh to fetch data from your Gmail account. This is one time process only").show(500);
        } else {
            $('#msg').hide();
        }
        threadsDiv.html("")
        for (var i = 0; i < data.length; i++) {
            var mainDiv = document.createElement('div');
            mainDiv.className = "threads";
            mainDiv.id = data[i].id;

            var divThread = document.createElement('div');
            divThread.innerHTML = data[i].snippet.replace(new RegExp(query, "ig"), '<span class="increase-size">' + query.toLowerCase() + '</span>');

            var messageDiv = document.createElement('div');
            messageDiv.className = "messages";
            for (var j = 0; j < data[i].messages.length; j++) {
                var messageRow = document.createElement('div');
                messageRow.className = 'singlemessages';
                messageRow.innerHTML = data[i].messages[j].snippet.replace(new RegExp(query, "ig"), '<span class="increase-size">' + query.toLowerCase() + '</span>');
                messageDiv.appendChild(messageRow);
            }
            mainDiv.appendChild(divThread);
            mainDiv.appendChild(messageDiv);
            mainDiv.addEventListener('click', dropdown);
            document.getElementById('wrapper').appendChild(mainDiv);

        }
    }

    function dropdown(event) {
        var selector = "#" + event.currentTarget.id + ">div:last-child";
        if ($(selector).css('display') === 'none')
            $(selector).show(300);
        else
            $(selector).hide(300);
    }
})