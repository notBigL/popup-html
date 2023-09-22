const selectModelElement = document.getElementById("selectModel")
const inputElement = document.getElementById("textInput")
const startButtonElement = document.getElementById("startButton")
const insertResultSentenceElement = document.getElementById("spaceForResultSentence")
const insertHighlightedWordsElement = document.getElementById("spaceForHighlightedWords")
const parser = new DOMParser()

const analyseLabel = document.getElementById("analysing")
const finishedLabel = document.getElementById("finished")
const errorLabel = document.getElementById("error")
const readyLabel = document.getElementById("ready")

const statusLabelList = [analyseLabel, finishedLabel, errorLabel, readyLabel]

const resultRegex = /(\S+)/
const numberRegex = /(\d\.\d{2})/

const verySureString = "The model is very sure that this text is "
const prettySureString = "The model is pretty sure that this text is "
const thinksString = "The model thinks this text is "
const notSureString = "The model is not sure but thinks this text is "


startButtonElement.onclick = function () {
    if (!inputElement.value || inputElement.value.length < 4 || inputElement.value.length > 1000) {
        console.log("Input is invalid or too short or too long. Please put in values between 4 and 999 characters.")
        showRightStatusLabel(errorLabel)
    } else {
        disableElement(startButtonElement)
        showRightStatusLabel(analyseLabel)
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
                showRightStatusLabel(finishedLabel)
                enableElement(startButtonElement)
            })
            .catch(error => {
                console.error('Fehler bei der Anfrage:', error)
                showRightStatusLabel(errorLabel)
                enableElement(startButtonElement)
            });
    }
}

function addResultsToPopup(result) {
    insertResultSentenceElement.innerHTML = ''
    insertHighlightedWordsElement.innerHTML = ''

    let resultHtml = parser.parseFromString(result, "text/html")
    let tableWithResults = resultHtml.body.getElementsByTagName("table")[0]
    let resultSentenceNode = document.createTextNode(getResultSentence(tableWithResults));
    insertResultSentenceElement.appendChild(resultSentenceNode)
    insertHighlightedWordsElement.appendChild(getHighlightedWords(tableWithResults))
}


function getResultSentence(table) {
    let result = table.children[0].children[1].children[1].children[0].children[0].innerText
    let category = result.match(resultRegex)[0]
    let certainty = parseFloat(result.match(numberRegex)[0])
    let readableCategory = makeCategoryReadable(category.toLowerCase())

    if (certainty > 0.85) {
        return verySureString + readableCategory
    } else if (certainty > 0.7) {
        return prettySureString + readableCategory
    } else if (certainty > 0.55) {
        return thinksString + readableCategory
    } else {
        return notSureString + readableCategory
    }
}


function getHighlightedWords(table) {
    let result = table.children[0].children[1].children[4]
    result.removeChild(result.children[0])
    result.removeChild(result.children[result.children.length - 1])
    return result
}

function makeCategoryReadable(category) {
    switch (category) {
        case "label_2":
        case "pos":
        case "positive":
            return "positive"
        case "label_1":
        case "neu":
        case "neutral":
            return "neutral"
        case "label_0":
        case "neg":
        case "negative":
            return "negative"
        case "irony":
            return "ironic"
        case "non_irony":
            return "not ironic"
        default:
            return "category not found"
    }
}

function showRightStatusLabel(labelToShow) {
    for (let label of statusLabelList) {
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