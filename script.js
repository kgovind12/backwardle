(async function () {
    let word;
    let reversedWord;

    // initialize today's word (random pick) and persist it so it stays the same for the day
    async function initDailyWord() {
        const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const storedDate = localStorage.getItem("dailyWordDate");
        const storedWord = localStorage.getItem("dailyWord");

        if (storedDate === todayStr && storedWord) {
            word = storedWord;
        } else {
            const words = await loadWordList();
            if (!words || words.length === 0) {
                word = "click"; // fallback
            } else {
                const idx = Math.floor(Math.random() * words.length);
                word = words[idx];
            }
            localStorage.setItem("dailyWord", word);
            localStorage.setItem("dailyWordDate", todayStr);
        }

        reversedWord = word.split("").reverse().join("");
        console.log("reversed word = ", reversedWord);
    }

    await initDailyWord();
    // ensure the full word list is loaded for validation (might not have been loaded inside initDailyWord)
    await loadWordList();

        async function loadWordList() {
        const response = await fetch("words.txt");
        const text = await response.text();

        const words = text
            .split("\n")
            .map(word => word.trim())
            .filter(word => word.length === 5);

            // expose the list globally for validation
            window.wordList = words;
            return words;
    }

    var currentRow = 0;
    var currentCol = 0;
    var currentWord = "";
    let isAnimating = false;

    // centralize key processing (keyboard + on-screen keyboard)
    async function processKey(key) {
        if (isAnimating) return;
        console.log("Key pressed:", key, "col", currentCol);

        if (/^[a-zA-Z]$/.test(key)) {
            if (currentCol < 5) {
                const col = document.querySelector(`#col-${currentRow}${currentCol}`);
                if (!col) return;
                col.textContent = key.toUpperCase();
                col.classList.add("filled");
                currentCol++;
                currentWord += key.toLowerCase();
            } else {
                console.log("Max columns reached");
                currentCol = 5;
                return;
            }
        } else if (key === "Enter") {
            if (currentCol < 5) return;

            // validate guess: either the guess itself or its reverse must be a real word
            const words = window.wordList || [];
            const guess = currentWord.toLowerCase();
            const guessRev = guess.split("").reverse().join("");

            if (!words.includes(guess) && !words.includes(guessRev)) {
                // invalid word: shake the current row briefly
                const rowEl = document.querySelector(`#row-${currentRow}`);
                if (rowEl) {
                    rowEl.classList.add('shake');
                    setTimeout(() => rowEl.classList.remove('shake'), 600);
                }
                return;
            }

            await checkWord(reversedWord, currentWord, currentRow);
            currentRow++;
            currentCol = 0;
            currentWord = "";
        } else if (key === "Backspace") {
            if (currentCol <= 0) return;
            const prevCol = document.querySelector(`#col-${currentRow}${currentCol - 1}`);
            if (!prevCol) return;
            prevCol.classList.remove("filled");
            currentCol--;
            currentWord = currentWord.slice(0, -1);
            prevCol.textContent = "";
        }
    }

    // physical keyboard
    document.addEventListener("keydown", (event) => {
        event.preventDefault();
        processKey(event.key);
    });

    // wire on-screen keyboard buttons
    function initOnscreenKeyboard() {
        const keys = document.querySelectorAll('.kb-key');
        keys.forEach(btn => {
            btn.addEventListener('click', () => {
                const txt = btn.textContent.trim();
                if (txt === '⌫') return processKey('Backspace');
                if (txt.toLowerCase() === 'enter') return processKey('Enter');
                return processKey(txt);
            });
        });
    }

    // initialize keyboard when DOM is ready (script runs at end of body or deferred)
    initOnscreenKeyboard();

    // function that checks the letters of the inputted word
    // compares to the reversed word (final word)
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
                setKeyStatus(inputWord[i], 'correct');
            } else if (reversedWord.includes(inputWord[i])) {
                // present but not in the right place
                col.classList.add("present");
                setKeyStatus(inputWord[i], 'present');
            } else {
                // not present in reversed word
                col.classList.add("absent");
                setKeyStatus(inputWord[i], 'absent');
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

    // helper: set keyboard key color state with priority (absent < present < correct)
    function setKeyStatus(letter, status) {
        if (!letter) return;
        const keyBtns = document.querySelectorAll('.kb-key');
        const target = Array.from(keyBtns).find(b => b.textContent.trim().toLowerCase() === letter.toLowerCase());
        if (!target) return;
        const priority = { absent: 1, present: 2, correct: 3 };
        let existing = null;
        if (target.classList.contains('correct')) existing = 'correct';
        else if (target.classList.contains('present')) existing = 'present';
        else if (target.classList.contains('absent')) existing = 'absent';
        if (!existing || priority[status] > priority[existing]) {
            target.classList.remove('absent', 'present', 'correct');
            target.classList.add(status);
        }
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