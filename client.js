var client = null;
var name = "User n°" + Math.floor(Math.random() * 10000);

// just to be sure that the image is reload despite of reusing the same file
var imagesCount = 0;
var blinking = false;

function connect() {
    if (client)
	return;	// already connected
   
    client = io();

    // update chat and clients number
    client.on("update", function(data) {
        name = data.name;
        $('#chat-id').text(name + " :");
        
        updateClientNumber(data.clientsConnected);
    });

    // client connection
    client.on("connection", function(data) {
        $("#chat-discussion").append("<p class=\"new-connection\">"+ data.name +" has connected.</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);

        updateClientNumber(data.clientsConnected);
    });

    // client disconnection
    client.on("disconnection", function(data) {
        $("#chat-discussion").append("<p class=\"disconnection\">" + data.name + " has disconnected.</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);

        updateClientNumber(data.clientsConnected);
    });

    // chat message
    client.on("message", function(data) {
        $("#chat-discussion").append("<p>(" + data.date + ") " + data.from + " : " + data.msg + "</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);

        newExcitingAlerts();
    });
}


function updateClientNumber(number) {
    var text = number+" user" + ((number > 1)?"s":"") + "<br/>connected";
    $('#users-connections').css("left", '-' + (9*10 + 2) + "px");
    $('#users-connections').html(text);
}


$(document).ready(function() {
    
    connect();
    
    // chat events
    $(window).bind('beforeunload', function(){
        client.emit("disconnection", name);
    });

    
    $("#chat-form").submit(function() {
        var message = $("#chat-text-input").val();
        
        if(message !== "") {
            client.emit('message', { from: name, msg: message });

            var date = new Date();
            var dateString = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear() + " " + date.getHours() + "h" + date.getMinutes();
            $("#chat-discussion").append("<p class=\"owner-message\">(" + dateString + ") You : " +  message + "</p>");
            $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);
            
            $("#chat-text-input").val("");
        }
        
        return false;
    });
});


/** FUNCTION DECLARATION **/
function newExcitingAlerts() {
    var oldTitle = document.title;
    var msg = "New message !";
    var timeoutId;
    var blink = function() { document.title = document.title == msg ? oldTitle : msg; };
    var clear = function() {
        clearInterval(timeoutId);
        document.title = oldTitle;
        window.onmousemove = null;
        timeoutId = null;
        blinking = false;
    };
    
    if (!timeoutId && !blinking) {
        blinking = true;
        timeoutId = setInterval(blink, 1000);
        window.onmousemove = clear;
    }
};
