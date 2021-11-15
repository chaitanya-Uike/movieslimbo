const editButton = document.querySelector(".edit-button")
const editContainer = document.querySelector(".edit-container")
const closeEditContainer = document.querySelector(".close-edit-container")
const favoriteButton = document.getElementById("id_favorite")
const form = document.querySelector("#edit-form")


const data = JSON.parse(document.getElementById('data').textContent)
const id = JSON.parse(document.getElementById('id').textContent)
const type = JSON.parse(document.getElementById('itemType').textContent)

editButton.addEventListener("click", event => {
    editContainer.style.display = "block"
    closeEditContainer.style.display = "block"
})

closeEditContainer.addEventListener("click", event => {
    editContainer.style.display = "none"
    event.target.style.display = "none"
})

if (data != "") {
    document.getElementById("id_status").value = data.status
    document.getElementById("id_score").value = data.score
    if (data.favorite) {
        favoriteButton.style.color = "#EC294B"
        favoriteButton.setAttribute("selected", "true")
    }
    document.getElementById("delete-btn").style.display = "block"
}

async function updateData(csrftoken, status, score, favorite) {
    const response = await fetch(`/update/${id}/${type}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            "status": status,
            "score": score,
            "favorite": favorite,
        })
    })

    if (response.ok) {
        console.log("saved successfully!")
        location.reload()
    }
    else {
        console.log("some error occured!")
    }
}

favoriteButton.addEventListener("click", event => {
    if (event.target.getAttribute("selected") == "false") {
        event.target.setAttribute("selected", "true")
        event.target.style.color = "#EC294B"
    }

    else {
        event.target.setAttribute("selected", "false")
        event.target.style.color = ""
    }
})


form.addEventListener("submit", event => {
    event.preventDefault()

    const csrftoken = event.target['csrfmiddlewaretoken'].value
    const status = event.target['status'].value
    const score = event.target['score'].value
    let favorite = false
    if (favoriteButton.getAttribute("selected") == "true")
        favorite = true

    updateData(csrftoken, status, score, favorite)
})

async function removeData() {
    const response = await fetch(`/remove/${id}/`)
    if (response.ok) {
        location.reload()
    }
}

document.getElementById("delete-btn").addEventListener("click", event => {
    removeData()
})