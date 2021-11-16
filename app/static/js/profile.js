const editContainer = document.querySelector(".edit-container")
const closeEditContainer = document.querySelector(".close-edit-container")
const form = document.querySelector("#edit-form")
let favoriteBtn = document.querySelector("#id_favorite")
const filter_status = document.getElementById("filter_status")
const filter_sort = document.getElementById("filter_sort")

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

// Event listeners

document.getElementById("delete-btn").addEventListener("click", event => {
    removeData()
})

function favoriteBtnToggle() {
    if (favoriteBtn.getAttribute("selected") == "true") {
        favoriteBtn.setAttribute("selected", "false")
        favoriteBtn.style.color = ""
    }
    else {
        favoriteBtn.style.color = "#EC294B"
        favoriteBtn.setAttribute("selected", "true")
    }
    console.log(favoriteBtn.getAttribute("selected"))
}

favoriteBtn.addEventListener("click", favoriteBtnToggle)

//event delegation
let id
let type
function editButtonClicked(event) {
    let card = event.target.parentElement
    id = card.getAttribute("id")
    let data = JSON.parse(document.getElementById(`data-${id}`).textContent)
    type = data.type
    let backdrop = data.backdrop
    let title = data.title

    editContainer.style.display = "block"
    closeEditContainer.style.display = "block"

    document.querySelector(".edit-container-backdrop").setAttribute("src", `https://image.tmdb.org/t/p/w1280/${backdrop}`)
    document.querySelector("#edit-from-title").innerHTML = title

    // showing the initial values
    document.getElementById("id_status").value = data.status
    document.getElementById("id_score").value = data.score
    if (data.favorite == true) {
        favoriteBtn.style.color = "#EC294B"
        favoriteBtn.setAttribute("selected", "true")
    }
    else {
        favoriteBtn.style.color = ""
        favoriteBtn.setAttribute("selected", "false")
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
        fetchList(username)
            .then(data => {

                showStats(data.distribution)

                populateList(data.data, filter_status.value, filter_sort.value)

                //[...data] gives the copy of an array, send a copy bcoz .sort() is inplace

                filter_status.addEventListener("change", event => {
                    populateList([...data.data], event.target.value, filter_sort.value)
                })

                filter_sort.addEventListener("change", event => {
                    populateList([...data.data], filter_status.value, event.target.value)
                })
            })

        //close the editContainer
        editContainer.style.display = ""
        closeEditContainer.style.display = ""
    }
    else {
        console.log("some error occured!")
    }
}

async function removeData() {
    const response = await fetch(`/remove/${id}/`)
    if (response.ok) {
        fetchList(username)
            .then(data => {

                showStats(data.distribution)

                populateList(data.data, filter_status.value, filter_sort.value)

                //[...data] gives the copy of an array, send a copy bcoz .sort() is inplace

                filter_status.addEventListener("change", event => {
                    populateList([...data.data], event.target.value, filter_sort.value)
                })

                filter_sort.addEventListener("change", event => {
                    populateList([...data.data], filter_status.value, event.target.value)
                })
            })

        //close the editContainer
        editContainer.style.display = ""
        closeEditContainer.style.display = ""
    }
}

listContainer.addEventListener("click", event => {
    if (event.target && event.target.matches("i.edit-button")) {
        editButtonClicked(event)
    }
})


closeEditContainer.addEventListener("click", event => {
    editContainer.style.display = "none"
    event.target.style.display = "none"
})

form.addEventListener("submit", event => {
    event.preventDefault()

    const csrftoken = event.target['csrfmiddlewaretoken'].value
    const status = event.target['status'].value
    const score = event.target['score'].value
    let favorite = false
    if (favoriteBtn.getAttribute("selected") == "true")
        favorite = true

    updateData(csrftoken, status, score, favorite)
})



function populateList(data, status, sort) {
    listContainer.innerHTML = `        
    <div class="list-header info-card">
        <h6 class="title">Title</h6>
        <h6 class="type">Type</h6>
        <h6 class="status">Status</h6>
        <h6 class="score">Score</h6>
    </div>`

    if (sort == "score")
        data.sort((a, b) => b.score - a.score)

    for (let i = 0; i < data.length; i++) {
        if ((status != "Favorite" || data[i].favorite != true) && status != "All" && data[i].status != status)
            continue

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

    if (listContainer.childElementCount == 1) {
        listContainer.innerHTML += '<div class="extra-info-container">No items present in the list</div>'
    }
}

function showStats(stats) {
    document.querySelector(".total").innerHTML =
        `<p class="heading">Total entries</p>
        <p>${stats['total']}</p>`
    document.querySelector(".comp").innerHTML =
        `<p class="heading">Completed</p>
        <p>${stats['Completed']}</p>`
    document.querySelector(".watch").innerHTML =
        `<p class="heading">watching</p>
        <p>${stats['Watching']}</p>`
    document.querySelector(".ptw").innerHTML =
        `<p class="heading">Plan to watch</p>
        <p>${stats['Plan to watch']}</p>`
    document.querySelector(".oh").innerHTML =
        `<p class="heading">On hold</p>
        <p>${stats['On hold']}</p>`
}


window.onload = () =>
    fetchList(username)
        .then(data => {

            showStats(data.distribution)

            populateList(data.data, "All", "date_added")

            //[...data] gives the copy of an array, send a copy bcoz .sort() is inplace

            filter_status.addEventListener("change", event => {
                populateList([...data.data], event.target.value, filter_sort.value)
            })

            filter_sort.addEventListener("change", event => {
                populateList([...data.data], filter_status.value, event.target.value)
            })
        })


// follow/unfollow logic
if (!permission) {


    let following = JSON.parse(document.getElementById('follow').textContent)
    const follow_btn = document.querySelector(".follow-btn")


    if (following) {
        follow_btn.innerHTML = "Unfollow"
    }
    else {
        follow_btn.innerHTML = "Follow"
    }

    follow_btn.addEventListener("click", async event => {
        if (following) {
            const response = await fetch(`/unfollow/${username}/`)
            if (response.ok) {
                following = false
                follow_btn.innerHTML = "Follow"
            }
            else {
                console.log("some error occured")
            }

        }

        else {
            const response = await fetch(`/follow/${username}/`)
            if (response.ok) {
                following = true
                follow_btn.innerHTML = "UnFollow"
            }
            else {
                console.log("some error occuress")
            }
        }
    })
}




