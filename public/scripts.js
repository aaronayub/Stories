/* Fills out the stars on the "read" page with the rating the user has given, if any. */
function showUserRating(rating) {
    if (rating >= 1) document.getElementById("rate1").innerHTML = "&#9733;";
    else document.getElementById("rate1").innerHTML = "&#9734;";

    if (rating >= 2) document.getElementById("rate2").innerHTML = "&#9733;";
    else document.getElementById("rate2").innerHTML = "&#9734;";

    if (rating >= 3) document.getElementById("rate3").innerHTML = "&#9733;";
    else document.getElementById("rate3").innerHTML = "&#9734;";

    if (rating >= 4) document.getElementById("rate4").innerHTML = "&#9733;";
    else document.getElementById("rate4").innerHTML = "&#9734;";

    if (rating >= 5) document.getElementById("rate5").innerHTML = "&#9733;";
    else document.getElementById("rate5").innerHTML = "&#9734;";
}

/* Sends a request to the server to rate the story */
function rateStory(id,rating) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            showUserRating(rating); // Update the rating displayed to the user
            document.getElementById("currentRating").innerHTML = this.responseText;
        }
    };
    xhttp.open("POST", "/read/"+id+"/"+rating, true);
    xhttp.send();
}