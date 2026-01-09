(function () {
    // set date
    const startDate = new Date("2026-01-09");
    const today = new Date();
    const dayNumber = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    // load the word list
    // loadWordList().then(wordList => {
    //     console.log("Loaded words:", wordList.length);
    //     localStorage.setItem("wordList", JSON.stringify(wordList));
    // });

    // let WORDS = localStorage.getItem("wordList");

    // const word = WORDS[dayNumber % WORDS.length];
    // const reversedWord = word.split("").reverse().join("");

    // localStorage.setItem("game-2026-01-08", JSON.stringify(gameState));

    const word = "click";
    const reversedWord = word.split("").reverse().join("");

    console.log("reversed word = ", reversedWord);

    var currentRow = 0;
    var currentCol = 0;
    var currentWord = "";
    let isAnimating = false;

    document.addEventListener("keydown", (event) => {
        event.preventDefault();
        if (isAnimating) return;

        console.log("Key pressed:", currentCol);
        if (/^[a-zA-Z]$/.test(event.key)) {
            if (currentCol < 5) {
                console.log("Alphabet key:", event.key);
                var col = document.querySelector(`#col-${currentRow}${currentCol}`);
                col.textContent = event.key.toUpperCase();
                col.classList.add("filled");
                currentCol++;
                currentWord += event.key;
            } else {
                console.log("Max columns reached");
                currentCol = 5;
                return;
            }
        } else if (event.key === "Enter") {
            if (currentCol < 5) {
                return;
            }
            checkWord(reversedWord, currentWord, currentRow);
            currentRow++;
            currentCol = 0;
            currentWord = "";
        } else if (event.key === "Backspace") {
            if (currentCol <= 0) {
                return;
            }
            currentCol--;
            currentWord = currentWord.slice(0, -1);
            var col = document.querySelector(`#col-${currentRow}${currentCol}`);
            col.textContent = "";
        }
    });

    async function loadWordList() {
        const response = await fetch("words.txt");
        const text = await response.text();

        const words = text
            .split("\n")
            .map(word => word.trim())
            .filter(word => word.length === 5);

        return words;
    }

    async function checkWord(reversedWord, inputWord, currentRow) {
        isAnimating = true;

        const tileFlipDuration = 350;
        const animationDuration = 600;

        for (var i = 0; i < inputWord.length; i++) {
            var col = document.querySelector(`#col-${currentRow}${i}`);
            if (!col) continue;

            if (inputWord[i] == reversedWord[i]) {
                // correct
                col.classList.add("correct");
            } else if (reversedWord.includes(inputWord[i])) {
                // present but not in the right place
                col.classList.add("present");
            } else {
                // not present in reversed word
                col.classList.add("absent");
            }

            col.classList.add("flip");
            await delay(tileFlipDuration);
        }

        await delay(animationDuration);

        isAnimating = false;

        if (inputWord === reversedWord) {
            showPopup(true);
        } else if (currentRow === 5) {
            showPopup(false);
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function showPopup(gameWon) {
        const popup = document.querySelector("#gameoverpopup");
        if (gameWon) {
            popup.textContent = "Congratulations! You've guessed the word.";
        } else {
            popup.textContent = "Game Over! The word was: " + reversedWord;
        }
        popup.classList.remove("hide");
    }
})();