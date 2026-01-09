(function () {
    const rootStyles = getComputedStyle(document.documentElement);
    const correctColor = rootStyles.getPropertyValue("--correct");
    const presentColor = rootStyles.getPropertyValue("--present");
    const absentColor = rootStyles.getPropertyValue("--absent");

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

    const word = "horse";
    const reversedWord = word.split("").reverse().join("");

    console.log("reversed word = ", reversedWord);

    var currentRow = 0;
    var currentCol = 0;
    var currentWord = "";
    document.addEventListener("keydown", (event) => {
        event.preventDefault();
        console.log("Key pressed:", currentCol);
        if (/^[a-zA-Z]$/.test(event.key)) {
            if (currentCol < 5) {
                console.log("Alphabet key:", event.key);
                var col = document.querySelector(`#col-${currentRow}${currentCol}`);
                col.textContent = event.key.toUpperCase();
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
        for (var i = 0; i < inputWord.length; i++) {
            var col = document.querySelector(`#col-${currentRow}${i}`);
            if (!col) continue;

            if (inputWord[i] == reversedWord[i]) {
                // correct
                col.style.backgroundColor = correctColor;
            } else if (reversedWord.includes(inputWord[i])) {
                // present but not in the right place
                col.style.backgroundColor = presentColor;
            } else {
                // not present in reversed word
                col.style.backgroundColor = absentColor;
            }

            col.classList.add("flip");
            await delay(350);
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();