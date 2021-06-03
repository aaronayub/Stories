/* Fills out the stars on the "read" page with the rating the user has given, if any. */
function showUserRating(rating) {
    for (let i = 1; i <= 5; i++) {
        star = document.getElementById("rate"+i)
        if (rating >= i) {
            star.innerHTML = "&#9733;"
            star.classList.add('rateOn')
        }
        else {
            star.innerHTML = "&#9734;"
            star.classList.remove('rateOn')
        }
    }
}

/* Sends a request to the server to rate the story */
function rateStory(id,rating) {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            showUserRating(rating); // Update the rating displayed to the user
            document.getElementById("currentRating").innerHTML = this.responseText;
        }
    }
    xhr.open("POST", "/read/"+id+"/"+rating, true);
    xhr.send()
}