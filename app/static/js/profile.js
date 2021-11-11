
const permission = JSON.parse(document.getElementById('auth').textContent)
if (permission) {
    const editButton = document.getElementsByClassName("edit-button")
    const editContainer = document.querySelector(".edit-container")
    const closeEditContainer = document.querySelector(".close-edit-container")
    const form = document.querySelector("#edit-form")

    let id;
    Array.from(editButton).forEach(element => {
        element.addEventListener("click", event => {
            let card = event.target.parentElement
            id = card.getAttribute("id")
            type = card.getAttribute("type")
            backdrop = card.getAttribute("backdrop")
            title = card.getAttribute("title")

            editContainer.style.display = "block"
            closeEditContainer.style.display = "block"

            document.querySelector(".edit-container-backdrop").setAttribute("src", `https://image.tmdb.org/t/p/w1280/${backdrop}`)
            document.querySelector("#edit-from-title").innerHTML = title

            document.getElementById("id_status").value = card.getAttribute("status")
            document.getElementById("id_score").value = card.getAttribute("score")
            document.getElementById("delete-btn").style.display = "block"
        })
    })


    closeEditContainer.addEventListener("click", event => {
        editContainer.style.display = "none"
        event.target.style.display = "none"
    })

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

        console.log(csrftoken);

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

}