async function loginUser(csrftoken, username, password) {
    const response = await fetch('/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
        })
    })
    if (response.ok) {
        window.location.replace("/home/")
    }
    else {
        console.log("Login failed!!")
        document.getElementById("alert-card").style.display = "block"

    }

}

document.getElementById("login-form").addEventListener("submit", event => {
    event.preventDefault()

    let csrftoken = event.target['csrfmiddlewaretoken'].value
    let username = event.target['username'].value
    let password = event.target['password'].value

    loginUser(csrftoken, username, password)
})