document.addEventListener('DOMContentLoaded', () => {
    // --- References ---
    const photoUpload = document.getElementById('photoUpload');
    const iconUploadInput = document.getElementById('iconUploadInput');
    const soundUploadInput = document.getElementById('soundUploadInput'); // New: Sound upload input
    const studentsContainer = document.getElementById('studentsContainer');
    const rankButton = document.getElementById('rankButton');
    const bonusSoundSelect = document.getElementById('bonusSoundSelect');
    const bonusIconSelect = document.getElementById('bonusIconSelect');
    const resetButton = document.getElementById('resetButton');
    const customSoundOption = document.getElementById('customSoundOption'); // New: Custom sound option
    const customIconOption = document.getElementById('customIconOption');   // New: Custom icon option
    const previewImage = document.getElementById('bonusIconPreview');       // Preview image element
    const previewContainer = document.querySelector('.bonus-icon-preview-container'); // Preview container

    let students = []; // Array to hold student objects { id, photo, score }
    const deductionSound = new Audio('sound/deduction.mp3'); // Sound for deduction
    let bonusIconDataUrl = null; // To store the uploaded custom bonus icon Data URL
    let bonusSoundDataUrl = null; // New: To store the uploaded custom bonus sound Data URL

    // --- Helper Function to Update Preview ---
    function updateBonusIconPreview(src) {
        console.log("updateBonusIconPreview called with src:", src);
        if (previewContainer && previewImage) {
            if (src && src.trim() !== '') {
                previewImage.src = src;
                previewContainer.classList.add('has-content'); // Use class for visibility
                console.log("Preview showing. Added 'has-content' class.");
            } else {
                previewImage.src = '';
                previewContainer.classList.remove('has-content'); // Use class for visibility
                console.log("Preview hidden. Removed 'has-content' class.");
            }
        } else {
            console.error("Preview container or image element not found!");
        }
    }

    // --- Helper Function to Reset Custom Options ---
    function resetCustomOption(optionElement, selectElement) {
        optionElement.value = "";
        optionElement.textContent = "自訂"; // Reset text
        optionElement.disabled = true;
        optionElement.hidden = true;
        // If the custom option was selected, revert to the first default option
        if (selectElement.value === optionElement.value) {
             selectElement.selectedIndex = 0; // Select the first default option
             selectElement.dispatchEvent(new Event('change')); // Trigger change event to update state
        }
    }

    // --- Event Listeners ---

    // Student Photo Upload
    photoUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e_reader) => {
                    const student = {
                        id: Date.now() + Math.random(),
                        photo: e_reader.target.result,
                        score: 0,
                    };
                    students.push(student);
                    refreshDisplay(!!document.querySelector('.rank-number'));
                };
                reader.readAsDataURL(file);
            } else {
                alert('請只上傳圖片文件！');
            }
        });
        e.target.value = null;
    });

    // Bonus Icon Upload
    iconUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e_reader) => {
                bonusIconDataUrl = e_reader.target.result; // Store custom icon Data URL
                console.log("自訂圖示已上傳。");

                // Update custom icon option in dropdown
                customIconOption.value = bonusIconDataUrl; // Set value to Data URL
                customIconOption.textContent = "自訂圖示"; // Set display text
                customIconOption.disabled = false;
                customIconOption.hidden = false;
                bonusIconSelect.value = bonusIconDataUrl; // Select the custom option

                updateBonusIconPreview(bonusIconDataUrl); // Update the preview box
                refreshDisplay(!!document.querySelector('.rank-number')); // Refresh student list
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('請只上傳圖片文件！');
            bonusIconDataUrl = null; // Clear custom icon if invalid file selected
            resetCustomOption(customIconOption, bonusIconSelect); // Reset custom option
            // Update preview to show the dropdown's selected icon instead
            updateBonusIconPreview(bonusIconSelect.value);
            refreshDisplay(!!document.querySelector('.rank-number'));
        }
        // else: User cancelled file selection, do nothing to current state
        e.target.value = null; // Clear the file input
    });

    // New: Bonus Sound Upload
    soundUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            const reader = new FileReader();
            reader.onload = (e_reader) => {
                bonusSoundDataUrl = e_reader.target.result; // Store custom sound Data URL
                console.log("自訂音效已上傳。");

                // Update custom sound option in dropdown
                customSoundOption.value = bonusSoundDataUrl; // Set value to Data URL
                customSoundOption.textContent = "自訂音效";  // Set display text
                customSoundOption.disabled = false;
                customSoundOption.hidden = false;
                bonusSoundSelect.value = bonusSoundDataUrl; // Select the custom option

                // Optionally play the sound once as confirmation
                playSound(true, bonusSoundDataUrl);

            };
            reader.onerror = (err) => {
                 console.error("讀取音效檔案失敗:", err);
                 alert('讀取音效檔案失敗！');
                 bonusSoundDataUrl = null;
                 resetCustomOption(customSoundOption, bonusSoundSelect);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('請只上傳音效文件 (如 MP3, WAV, OGG)！');
            bonusSoundDataUrl = null; // Clear custom sound if invalid file selected
            resetCustomOption(customSoundOption, bonusSoundSelect); // Reset custom option
        }
        // else: User cancelled file selection, do nothing to current state
        e.target.value = null; // Clear the file input
    });


    // Bonus Icon Dropdown Selection
    bonusIconSelect.addEventListener('change', () => {
        const selectedValue = bonusIconSelect.value;
        if (selectedValue !== bonusIconDataUrl) { // If a default icon is selected
            bonusIconDataUrl = null; // Clear any uploaded custom icon
             resetCustomOption(customIconOption, bonusIconSelect); // Reset custom option state
            console.log("已從下拉選單選擇預設圖示，取消自訂圖示。");
            updateBonusIconPreview(selectedValue); // Update the preview box with default icon
        } else {
            // Custom icon is selected (or re-selected), ensure preview matches
            updateBonusIconPreview(bonusIconDataUrl);
        }
        // Refresh student list to show the newly selected icon
        refreshDisplay(!!document.querySelector('.rank-number'));
    });

    // New: Bonus Sound Dropdown Selection
    bonusSoundSelect.addEventListener('change', () => {
        const selectedValue = bonusSoundSelect.value;
        if (selectedValue !== bonusSoundDataUrl) { // If a default sound is selected
            bonusSoundDataUrl = null; // Clear custom sound data
            resetCustomOption(customSoundOption, bonusSoundSelect); // Reset custom option state
            console.log("已從下拉選單選擇預設音效，取消自訂音效。");
        }
        // No immediate visual update needed for sound selection, unlike icon preview
    });


    // Rank Button
    if (rankButton) {
        rankButton.addEventListener('click', () => updateRankings());
    } else { console.error("找不到 ID 為 'rankButton' 的按鈕。"); }

    // Reset Button
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('確定要清除所有學生的分數紀錄嗎？此操作無法復原。')) {
                students.forEach(student => { student.score = 0; });
                refreshDisplay(false);
                alert('所有分數已清除！');
            }
        });
    } else { console.error("找不到 ID 為 'resetButton' 的按鈕。"); }


    // --- Core Functions ---

    // Refresh the entire student display area
    function refreshDisplay(showRanks = false) {
        studentsContainer.innerHTML = '';
        let currentRank = 1;
        let scoreForRank = -Infinity;
        let rankDisplayCount = 0;

        if (showRanks && students.length > 0) {
             students.sort((a, b) => b.score - a.score);
             scoreForRank = students[0].score;
        } else if (showRanks && students.length === 0) {
            showRanks = false;
        }

        students.forEach((student, index) => {
             let rankToShow = null;
             if (showRanks) {
                 if (index === 0) {
                     rankToShow = 1;
                     scoreForRank = student.score;
                     rankDisplayCount = 1;
                } else {
                    if (student.score < scoreForRank) {
                        rankToShow = index + 1;
                        scoreForRank = student.score;
                        rankDisplayCount = rankToShow;
                    } else {
                        rankToShow = rankDisplayCount;
                    }
                }
            }
            displayStudent(student, rankToShow);
        });
    }

    // Create and display a single student's row
    function displayStudent(student, rank) {
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';

        const rankDisplay = rank !== null ? `<div class="rank-number">${rank}</div>` : '';

        // Use the currently selected value from the icon dropdown
        // This works for both default paths and the custom Data URL (if selected)
        const currentIconSrc = bonusIconSelect.value;

        let iconsHtml = '';
        if (currentIconSrc && student.score > 0) {
            // Ensure we don't try to create icons if the source is empty (e.g., initial state)
            if (currentIconSrc.trim() !== '') {
                 iconsHtml = Array(student.score).fill(0).map(() => `<img src="${currentIconSrc}" alt="加分圖示">`).join('');
            }
        }

        studentRow.innerHTML = `
            ${rankDisplay}
            <div class="photo-section">
                <img src="${student.photo}" alt="學生照片" class="student-photo">
                <div class="button-group">
                    <button class="add-point-btn" data-id="${student.id}">加分</button>
                    <button class="subtract-point-btn" data-id="${student.id}">扣分</button>
                </div>
            </div>
            <div class="student-info">
                <div class="score-section">
                    <div class="student-score" data-student-id="${student.id}">分數：${student.score}</div>
                    <div class="action-buttons">
                        <input type="file" class="change-photo-input" data-id="${student.id}" accept="image/*" style="display: none;">
                        <button class="change-photo-btn" data-id="${student.id}">更改照片</button>
                        <button class="delete-btn" data-id="${student.id}">刪除</button>
                    </div>
                </div>
                <div class="icon-display">
                    ${iconsHtml}
                </div>
            </div>
        `;

        // Add event listeners for buttons within the row
        const addPointBtn = studentRow.querySelector('.add-point-btn');
        const subtractPointBtn = studentRow.querySelector('.subtract-point-btn');
        const changePhotoBtn = studentRow.querySelector('.change-photo-btn');
        const changePhotoInput = studentRow.querySelector('.change-photo-input');
        const deleteBtn = studentRow.querySelector('.delete-btn');

        addPointBtn.addEventListener('click', () => updateScore(student, 1));
        subtractPointBtn.addEventListener('click', () => {
             if (student.score > 0) updateScore(student, -1);
        });
        changePhotoBtn.addEventListener('click', () => changePhotoInput.click());
        changePhotoInput.addEventListener('change', (e) => handleChangePhoto(e, student));
        deleteBtn.addEventListener('click', () => handleDeleteStudent(student));

        studentsContainer.appendChild(studentRow);
    }

     // Handle Change Photo Input
     function handleChangePhoto(e, student) {
         const file = e.target.files[0];
         if (file && file.type.startsWith('image/')) {
             const reader = new FileReader();
             reader.onload = (e_reader) => {
                 student.photo = e_reader.target.result;
                 refreshDisplay(!!document.querySelector('.rank-number'));
             };
             reader.readAsDataURL(file);
         } else if (file) {
             alert('請只上傳圖片文件！');
         }
         e.target.value = null;
     }

     // Handle Delete Student Button
     function handleDeleteStudent(student) {
         if (confirm('確定要刪除這位學生的資料嗎？')) {
             students = students.filter(s => s.id !== student.id);
             if (document.querySelector('.rank-number')) {
                 updateRankings();
             } else {
                 refreshDisplay(false);
             }
         }
     }

    // Play Bonus or Deduction Sound
    // Added 'source' parameter to allow playing a specific sound (like upon upload)
    function playSound(isBonus, source = null) {
        let sound;
        let soundPath = source; // Use provided source if available

        if (isBonus) {
             // If no specific source provided, use the dropdown selection
             if (!soundPath) {
                 soundPath = bonusSoundSelect.value;
             }

             if (soundPath && soundPath.trim() !== '') {
                  sound = new Audio(soundPath);
             } else {
                 console.log("未選擇加分音效或音效來源無效");
                 return; // Exit if no valid sound selected or provided
             }
        } else { // Deduction sound
             sound = deductionSound.cloneNode(); // Clone to allow overlapping plays
        }

        sound.play().catch(error => {
            console.error('播放音效失敗:', error, '路徑:', sound ? sound.src : 'N/A');
             // Optionally inform the user if it's a custom sound that failed
             if (isBonus && soundPath === bonusSoundDataUrl) {
                  // alert("播放自訂音效失敗，請檢查檔案格式或瀏覽器支援。");
             }
        });
    }

    // Update a student's score and refresh display
    function updateScore(student, increment) {
        const newScore = student.score + increment;
        if (newScore >= 0) {
             student.score = newScore;
             playSound(increment > 0); // Play sound (bonus or deduction based on selection)
             refreshDisplay(!!document.querySelector('.rank-number'));
        } else {
            console.log("分數不能低於0");
        }
    }

    // Trigger a display refresh with ranks enabled
     function updateRankings() {
        refreshDisplay(true);
    }

     // --- Initial Load ---
     console.log("DOM Loaded. Initializing.");
     // Ensure custom options are initially hidden/disabled
     resetCustomOption(customIconOption, bonusIconSelect);
     resetCustomOption(customSoundOption, bonusSoundSelect);
     // Set initial preview icon based on dropdown default value
     updateBonusIconPreview(bonusIconSelect.value);
     // Initial display of students (without ranks)
     refreshDisplay(false);

}); // End of DOMContentLoaded