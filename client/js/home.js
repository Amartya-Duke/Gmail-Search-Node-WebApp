$(function() {
    setSignedInStatus();
    getLastRefresh();
    bindListners();

    function setSignedInStatus() {
        $('.userid').html(getCookie("email"))
    }

    function getLastRefresh() {
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:8080/app/refresh/' + getCookie("email"),
            success: function(data) {
                console.log(data)
                populateRefreshInfo(data)
            },
            error: function(err) {
                console.log(err)
            }
        });
    }

    function bindListners() {
        $('#refresh').on('click', refresh);
        $('#search-submit-btn').on('click', search);
        $('#logout').on('click', logout);
    }

    function search(event) {
        event.preventDefault();
        $('.loading').hide();
        var query = $('#search-input').val();
        if (query == "") {
            alert('Use keyword {{all}} to fetch entire data')
        }
        var email = getCookie("email");
        console.log(query)
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:8080/app/data/' + query + "/" + email,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data);
                if (data.success == false) {
                    alert("You must login first");
                    window.location = "index.html";
                }
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
        if (noOfDays <= 0) {
            alert("Please enter positive value");
            return;
        }
        $('#msg').hide();
        $('#wrapper').html("");
        $('.loading').show();
        $('.loading img').show();
        $('.loading p').html('Please wait while your inbox is downloaded');
        var jsonData = {};
        jsonData.email = getCookie("email");
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/app/threads/' + noOfDays,
            data: JSON.stringify(jsonData),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                console.log(data)
                $('.loading img').hide();
                if (data.success) {
                    $('.loading p').html(data.threadDownloadedCount + ' threads containing ' + data.messageDownloadedCount + ' messages downloaded from your inbox \n ');
                    populateRefreshInfo(data);
                } else {
                    $('.loading p').html('Error:' + data.err)
                }
            },
            error: function(err) {
                console.log(err)
            }
        });
    }

    function populateRefreshInfo(data) {
        if (data.lastRefresh == undefined)
            data.lastRefresh = 'never';
        $('#last-refresh').html('Last refreshed: ' + data[0].lastRefresh);
        if (data.length != 0)
            $('#info').html('<span style="font-weight:bold">' + data[0].messageDownloadedCount + ' messages downloaded of ' + data[0].totalMessageCount + ' messages' + '</span>')
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

    function logout(event) {
        event.preventDefault();
        var email = getCookie("email");
        var jsonData = {};
        jsonData.email = email;
        if (confirm('Are you sure to logout ?')) {
            $.ajax({
                type: 'POST',
                url: 'http://127.0.0.1:8080/app/logout',
                data: JSON.stringify(jsonData),
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    console.log(data)
                    if (data.success) {
                        document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
            divThread.innerHTML = '<div style="float:right;font-weight:bold">[' + data[i].messages.length + ']</div>'
            divThread.innerHTML += data[i].snippet.replace(new RegExp(query, "ig"), '<span class="increase-size">' + query.toLowerCase() + '</span>');

            var messageDiv = document.createElement('div');
            messageDiv.className = "messages";
            for (var j = 0; j < data[i].messages.length; j++) {
                var messageRow = document.createElement('div');
                messageRow.className = 'singlemessages';
                var span = document.createElement('span');
                span.setAttribute('style', 'display: block; font-weight: bold ');
                span.innerHTML = 'in[' + data[i].messages[j].labelIds + ']<div style="float:right;font-weight:bold">' + data[i].messages[j].internalDate + '</div>';
                var subdiv = document.createElement('div');
                subdiv.innerHTML += '<div>' + data[i].messages[j].snippet.replace(new RegExp(query, "ig"), '<span class="increase-size">' + query.toLowerCase() + '</span>') + '</div>';

                messageRow.appendChild(span);
                messageRow.appendChild(subdiv)
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