const searchBar = document.getElementById("search-bar")
const searchForm = document.getElementById("search-form")
const resultContainer = document.getElementById("result-container")
const searchButton = document.getElementById("search-icon")


async function getSearchResults(csrftoken, keyword) {
    const response = await fetch('/search/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            "keyword": keyword,
        })
    })

    if (response.ok) {
        const data = await response.json()
        const results = data.results

        if (results.length > 0)
            resultContainer.style.display = "block"
        else
            resultContainer.style.display = "none"

        resultContainer.innerHTML = ''

        //show only the first five results
        results.slice(0, 5).forEach(result => {
            if (result.poster_path == null) {
                resultContainer.innerHTML += `
                <a href="/info/${result.id}" class="result-card text-decoration-none">
                    <div class="img"><i class="material-icons">blur_on</i></div>
                    <h5>${result.title}</h5>
                    <p>${result.release_date}</p>
                </a>
                `
            }
            else {
                resultContainer.innerHTML += `
            <a href="/info/${result.id}" class="result-card">
                <img class="img" src="https://image.tmdb.org/t/p/w92/${result.poster_path}" alt="">
                <h5>${result.title}</h5>
                <p>${result.release_date}</p>
            </a>
            `}
        })
    }
    else {
        console.log("some error occured!")
    }
}


//set the timeout so that we dont make reqest on each key press
let searchTimeout
searchBar.addEventListener("keyup", event => {
    let csrftoken = searchForm['csrfmiddlewaretoken'].value
    let keyword = event.target.value

    if (searchTimeout != undefined)
        clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        getSearchResults(csrftoken, keyword)
    }, 700);
})

//to close the result container and clear searchbar 
document.getElementById("close-search-container").addEventListener("click", event => {
    event.target.style.display = "none"
    resultContainer.style.display = "none"
    searchBar.value = ""
})

searchBar.addEventListener("focus", event => {
    document.getElementById("close-search-container").style.display = "inline-block"
})