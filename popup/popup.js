const selectModelElement = document.getElementById("selectModel")
const inputElement = document.getElementById("textInput")
const startButtonElement = document.getElementById("startButton")
const insertResultElement = document.getElementById("spaceForResult")
const parser = new DOMParser()

const analyseLabel = document.getElementById("analysing")
const finishedLabel = document.getElementById("finished")
const errorLabel = document.getElementById("error")

const labelList = [analyseLabel, finishedLabel, errorLabel]

startButtonElement.onclick = function () {
    if (!inputElement.value || inputElement.value.length < 4) {
        console.log("Input is invalid or too short uwu")
        showRightLabel(errorLabel)
    } else {
        disableElement(startButtonElement)
        showRightLabel(analyseLabel)
        fetch('http://127.0.0.1:5000/analyse-post-only', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sentence: inputElement.value, model: selectModelElement.value})
        })
            .then(response => response.json())
            .then(result => {
                addResultsToPopup(result)
                showRightLabel(finishedLabel)
                enableElement(startButtonElement)
            })
            .catch(error => {
                console.error('Fehler bei der Anfrage:', error)
                showRightLabel(errorLabel)
                enableElement(startButtonElement)
            });
    }
    console.log(inputElement.value)
}

function addResultsToPopup(result) {
    if (insertResultElement.hasChildNodes()) {
        insertResultElement.innerHTML = ''
    }
    let resultHtml = parser.parseFromString(result, "text/html")
    console.log(resultHtml)
    insertResultElement.appendChild(resultHtml.body)
}


function showRightLabel(labelToShow) {
    for (let label of labelList) {
        if (label !== labelToShow) {
            hideElement(label)
        } else {
            showElement(label)
        }
    }
}

function hideElement(element) {
    element.style.display = 'none'
}

function showElement(element) {
    element.style.display = ''
}

function disableElement(element) {
    element.disabled = true
}

function enableElement(element) {
    element.disabled = false
}