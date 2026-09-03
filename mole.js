const bgMusic = new Audio("./sounds/background.mp3");
const hitSound = new Audio("./sounds/hit.mp3");
const gameOverSound = new Audio("./sounds/gameover.mp3");
const clickSound = new Audio("./sounds/miss click.mp3");

// Giữ đúng mức âm thanh gốc của project.
const BASE_AUDIO = {
    background: 0.7,
    hit: 0.3,
    gameOver: 0.7,
    click: 0.5
};

const audioSettings = {
    masterVolume: 1,
    sfxVolume: 1,
    musicVolume: 1,
    masterEnabled: true,
    sfxEnabled: true,
    musicEnabled: true,
    quickMuted: false
};

bgMusic.loop = true;

let currMoleTile;
let currPlantTile;
let score = 0;
let gameOver = false;

// Lưu interval để Reset không tạo thêm nhiều vòng lặp chồng lên nhau.
let moleIntervalId = null;
let plantIntervalId = null;

// Trình duyệt chỉ cho phát nhạc sau khi người dùng tương tác lần đầu.
let audioUnlocked = false;

window.onload = function() {
    setGame();
    setupAudioControls();
    applyAudioSettings();

    document.addEventListener("pointerdown", unlockAudio, { once: true });
}

function setGame() {
    // Chỉ tạo bảng đúng một lần.
    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);
    }

    startGameIntervals();
}

function startGameIntervals() {
    stopGameIntervals();

    moleIntervalId = setInterval(setMole, 1000);
    plantIntervalId = setInterval(setPlant, 2000);
}

function stopGameIntervals() {
    if (moleIntervalId !== null) {
        clearInterval(moleIntervalId);
        moleIntervalId = null;
    }

    if (plantIntervalId !== null) {
        clearInterval(plantIntervalId);
        plantIntervalId = null;
    }
}

function getRandomTile() {
    // math.random --> 0-1 --> (0-1) * 9 = (0-9) --> round down to (0-8) integers
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setMole() {
    if (gameOver) {
        return;
    }

    if (currMoleTile) {
        currMoleTile.innerHTML = "";
    }

    let mole = document.createElement("img");
    mole.src = "./monty-mole.png";

    let num = getRandomTile();
    if (currPlantTile && currPlantTile.id == num) {
        return;
    }

    currMoleTile = document.getElementById(num);
    currMoleTile.appendChild(mole);
}

function setPlant() {
    if (gameOver) {
        return;
    }

    if (currPlantTile) {
        currPlantTile.innerHTML = "";
    }

    let plant = document.createElement("img");
    plant.src = "./piranha-plant.png";

    let num = getRandomTile();
    if (currMoleTile && currMoleTile.id == num) {
        return;
    }

    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
}

function selectTile() {
    unlockAudio();

    if (gameOver) {
        return;
    }

    if (this == currMoleTile) {
        score += 10;
        document.getElementById("score").innerText = score.toString();

        playSfx(hitSound);
    }
    else if (this == currPlantTile) {
        document.getElementById("score").innerText = "GAME OVER: " + score.toString();
        gameOver = true;

        stopGameIntervals();
        bgMusic.pause();

        playSfx(gameOverSound);
    }
    else {
        // Dùng đúng file thật đang có trong folder sounds.
        playSfx(clickSound);
    }
}

function resetGame() {
    unlockAudio();
    playSfx(clickSound);

    stopGameIntervals();

    score = 0;
    gameOver = false;
    document.getElementById("score").innerText = "0";

    // Xóa mole / plant đang hiển thị nhưng giữ nguyên 9 ô board.
    document.querySelectorAll("#board div").forEach(function(tile) {
        tile.innerHTML = "";
    });

    currMoleTile = null;
    currPlantTile = null;

    // Đưa nhạc nền về đầu bài rồi chạy lại nếu setting cho phép.
    bgMusic.pause();
    bgMusic.currentTime = 0;

    startGameIntervals();
    resumeBackgroundMusic();
}

function setupAudioControls() {
    const audioModal = document.getElementById("audioModal");
    const audioBackdrop = document.getElementById("audioBackdrop");
    const settingsButton = document.getElementById("settingsButton");
    const closeAudioButton = document.getElementById("closeAudioButton");
    const doneAudioButton = document.getElementById("doneAudioButton");
    const muteButton = document.getElementById("muteButton");
    const resetButton = document.getElementById("resetButton");

    const masterVolume = document.getElementById("masterVolume");
    const sfxVolume = document.getElementById("sfxVolume");
    const musicVolume = document.getElementById("musicVolume");

    const masterToggle = document.getElementById("masterToggle");
    const sfxToggle = document.getElementById("sfxToggle");
    const musicToggle = document.getElementById("musicToggle");

    settingsButton.addEventListener("click", function() {
        unlockAudio();
        playSfx(clickSound);
        openAudioModal();
    });

    muteButton.addEventListener("click", function() {
        unlockAudio();
        toggleQuickMute();
    });

    resetButton.addEventListener("click", resetGame);

    closeAudioButton.addEventListener("click", function() {
        playSfx(clickSound);
        closeAudioModal();
    });

    doneAudioButton.addEventListener("click", function() {
        playSfx(clickSound);
        closeAudioModal();
    });

    audioBackdrop.addEventListener("click", closeAudioModal);

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && audioModal.classList.contains("is-open")) {
            closeAudioModal();
        }
    });

    masterVolume.addEventListener("input", function() {
        audioSettings.masterVolume = Number(this.value) / 100;
        updateVolumeText("masterVolumeValue", this.value);
        applyAudioSettings();
    });

    sfxVolume.addEventListener("input", function() {
        audioSettings.sfxVolume = Number(this.value) / 100;
        updateVolumeText("sfxVolumeValue", this.value);
        applyAudioSettings();
    });

    musicVolume.addEventListener("input", function() {
        audioSettings.musicVolume = Number(this.value) / 100;
        updateVolumeText("musicVolumeValue", this.value);
        applyAudioSettings();
    });

    masterToggle.addEventListener("change", function() {
        audioSettings.masterEnabled = this.checked;
        applyAudioSettings();
    });

    sfxToggle.addEventListener("change", function() {
        audioSettings.sfxEnabled = this.checked;
        applyAudioSettings();
    });

    musicToggle.addEventListener("change", function() {
        audioSettings.musicEnabled = this.checked;
        applyAudioSettings();
    });
}

function openAudioModal() {
    const audioModal = document.getElementById("audioModal");
    audioModal.classList.add("is-open");
    audioModal.setAttribute("aria-hidden", "false");
}

function closeAudioModal() {
    const audioModal = document.getElementById("audioModal");
    audioModal.classList.remove("is-open");
    audioModal.setAttribute("aria-hidden", "true");
}

function toggleQuickMute() {
    audioSettings.quickMuted = !audioSettings.quickMuted;
    applyAudioSettings();
    updateMuteButton();

    // Khi vừa mở tiếng lại, tiếp tục nhạc nền nếu game chưa kết thúc.
    if (!audioSettings.quickMuted) {
        resumeBackgroundMusic();
        playSfx(clickSound);
    }
}

function updateMuteButton() {
    const muteButton = document.getElementById("muteButton");
    const muteButtonLabel = document.getElementById("muteButtonLabel");
    const soundOnIcon = document.getElementById("soundOnIcon");
    const soundOffIcon = document.getElementById("soundOffIcon");

    const muted = audioSettings.quickMuted;

    muteButton.classList.toggle("is-muted", muted);
    muteButtonLabel.innerText = muted ? "Unmute" : "Mute";
    muteButton.setAttribute("aria-label", muted ? "Restore all sounds" : "Mute all sounds");

    soundOnIcon.classList.toggle("hidden-icon", muted);
    soundOffIcon.classList.toggle("hidden-icon", !muted);
}

function updateVolumeText(elementId, value) {
    document.getElementById(elementId).innerText = value + "%";
}

function unlockAudio() {
    if (!audioUnlocked) {
        audioUnlocked = true;
        resumeBackgroundMusic();
    }
}

function resumeBackgroundMusic() {
    if (!canPlayMusic() || gameOver || !audioUnlocked) {
        return;
    }

    bgMusic.play().catch(function() {
        // Một số trình duyệt chặn autoplay cho tới lần tương tác tiếp theo.
    });
}

function playSfx(sound) {
    if (!canPlaySfx()) {
        return;
    }

    sound.currentTime = 0;
    sound.play().catch(function() {
        // Không làm game lỗi nếu trình duyệt tạm thời chặn audio.
    });
}

function canPlaySfx() {
    return audioSettings.masterEnabled &&
           audioSettings.sfxEnabled &&
           !audioSettings.quickMuted &&
           audioSettings.masterVolume > 0 &&
           audioSettings.sfxVolume > 0;
}

function canPlayMusic() {
    return audioSettings.masterEnabled &&
           audioSettings.musicEnabled &&
           !audioSettings.quickMuted &&
           audioSettings.masterVolume > 0 &&
           audioSettings.musicVolume > 0;
}

function applyAudioSettings() {
    const masterLevel = audioSettings.masterEnabled && !audioSettings.quickMuted
        ? audioSettings.masterVolume
        : 0;

    const sfxLevel = audioSettings.sfxEnabled
        ? audioSettings.sfxVolume
        : 0;

    const musicLevel = audioSettings.musicEnabled
        ? audioSettings.musicVolume
        : 0;

    // Slider 100% giữ đúng volume gốc mà nhóm đang dùng.
    bgMusic.volume = clampVolume(BASE_AUDIO.background * masterLevel * musicLevel);
    hitSound.volume = clampVolume(BASE_AUDIO.hit * masterLevel * sfxLevel);
    gameOverSound.volume = clampVolume(BASE_AUDIO.gameOver * masterLevel * sfxLevel);
    clickSound.volume = clampVolume(BASE_AUDIO.click * masterLevel * sfxLevel);

    if (!canPlayMusic()) {
        bgMusic.pause();
    }
    else {
        resumeBackgroundMusic();
    }

    updateMuteButton();
}

function clampVolume(value) {
    return Math.max(0, Math.min(1, value));
}
