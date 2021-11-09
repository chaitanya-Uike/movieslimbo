async function registerUser(csrftoken, username, email, password1, password2) {
    const response = await fetch('/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            'username': username,
            'email': email,
            'password1': password1,
            'password2': password2,
        })
    })
    if (response.ok) {
        console.log("registration successfull")
        window.location.replace('/login/')
    }
    else {
        console.log("registeration failed!!")
        response.text().then(errors => {
            let alertCard = document.getElementById("alert-card")
            document.getElementById("errors").innerHTML = errors
            alertCard.style.display = "block"
        })
    }


}

document.getElementById("registration-form").addEventListener("submit", event => {
    event.preventDefault()

    let csrftoken = event.target['csrfmiddlewaretoken'].value
    let username = event.target['username'].value
    let email = event.target['email'].value
    let password1 = event.target['password1'].value
    let password2 = event.target['password2'].value

    registerUser(csrftoken, username, email, password1, password2)
})