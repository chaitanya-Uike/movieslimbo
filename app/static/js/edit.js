const editButton = document.querySelector(".edit-button")
const editContainer = document.querySelector(".edit-container")
const closeEditContainer = document.querySelector(".close-edit-container")
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
    document.getElementById("delete-btn").style.display = "block"
}

async function updateData(csrftoken, status, score) {
    const response = await fetch(`/update/${id}/${type}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            "status": status,
            "score": score,
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

form.addEventListener("submit", event => {
    event.preventDefault()

    const csrftoken = event.target['csrfmiddlewaretoken'].value
    const status = event.target['status'].value
    const score = event.target['score'].value

    updateData(csrftoken, status, score)
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