async function fetchList(username) {
    const response = await fetch(`/list/${username}/`)
    if (response.ok) {
        const data = await response.json()
        return data
    }
    else {
        console.log("some error occured")
    }
}

const listContainer = document.querySelector(".list-container")
const permission = JSON.parse(document.getElementById('auth').textContent)
const username = JSON.parse(document.getElementById('username').textContent)

function populateList(data) {
    listContainer.innerHTML = `        
    <div class="list-header info-card">
        <h6 class="title">Title</h6>
        <h6 class="type">Type</h6>
        <h6 class="status">Status</h6>
        <h6 class="score">Score</h6>
    </div>`
    if (data.length == 0) {
        listContainer.innerHTML += '<div class="extra-info-container">No items present in the list</div>'
    }
    else {
        for (let i = 0; i < data.length; i++) {
            let infoCard = document.createElement("div")
            infoCard.classList.add("info-card")
            infoCard.setAttribute("id", data[i].movie_id)

            // sending the data to access use the id "data-{movie_id}"
            infoCard.innerHTML += `<script id="data-${data[i].movie_id}" type="application/json">${JSON.stringify(data[i])}</script>`

            //populating the card
            infoCard.innerHTML += `<img class="card-img" src="https://image.tmdb.org/t/p/w92/${data[i].img}" alt="poster">`

            if (data[i].type == "Movie") {
                infoCard.innerHTML += `<a class="title text-decoration-none" href="/info/movie/${data[i].movie_id}/">${data[i].title}</a>`
            }
            else {
                infoCard.innerHTML += `<a class="title text-decoration-none" href="/info/TV/${data[i].movie_id}/">${data[i].title}</a>`
            }

            infoCard.innerHTML += `            
                <p class="type">${data[i].type}</p>
                <p class="status">${data[i].status}</p>
                <p class="score">${data[i].score}</p>`

            if (permission) {
                infoCard.innerHTML += `<i class="material-icons edit-button">dehaze</i>`
            }

            listContainer.appendChild(infoCard)
        }


        //handling the edit button
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
                    data = JSON.parse(document.getElementById(`data-${id}`).textContent)
                    console.log(data)
                    type = data.type
                    backdrop = data.backdrop
                    title = data.title

                    editContainer.style.display = "block"
                    closeEditContainer.style.display = "block"

                    document.querySelector(".edit-container-backdrop").setAttribute("src", `https://image.tmdb.org/t/p/w1280/${backdrop}`)
                    document.querySelector("#edit-from-title").innerHTML = title

                    document.getElementById("id_status").value = data.status
                    document.getElementById("id_score").value = data.score
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
    }
}


window.onload = () =>
    fetchList(username, "All", "date_added")
        .then(data => {
            populateList(data)
        })
const filter_status = document.getElementById("filter_status")
const filter_sort = document.getElementById("filter_sort")


