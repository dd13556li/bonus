document.addEventListener('DOMContentLoaded', () => {
    const photoUpload = document.getElementById('photoUpload');
    const iconUpload = document.getElementById('iconUpload');
    const studentsContainer = document.getElementById('studentsContainer');
    let students = [];
    let bonusIcon = null;
    
    // 預設音效
    const bonusSound = new Audio('bonus.mp3');
    const deductionSound = new Audio('deduction.mp3');

    iconUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                bonusIcon = e.target.result;
                updateAllStudents();
            };
            reader.readAsDataURL(file);
        } else {
            alert('請只上傳圖片文件！');
        }
    });

    photoUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const student = {
                        id: Date.now() + Math.random(),
                        photo: e.target.result,
                        score: 0,
                        icons: 0
                    };
                    students.push(student);
                    displayStudent(student);
                };
                reader.readAsDataURL(file);
            } else {
                alert('請只上傳圖片文件！');
            }
        });
    });

    function updateAllStudents() {
        studentsContainer.innerHTML = '';
        students.forEach(student => displayStudent(student));
    }

    function updateRankings() {
        // 根據分數排序學生
        students.sort((a, b) => b.score - a.score);
        
        // 清空容器
        studentsContainer.innerHTML = '';
        
        // 按照排序後的順序重新添加學生
        let currentRank = 1;
        let currentScore = students[0]?.score;
        
        students.forEach((student, index) => {
            // 如果分數與前一個不同，更新排名
            if (student.score !== currentScore) {
                currentRank = index + 1;
                currentScore = student.score;
            }
            
            displayStudent(student, currentRank);
        });
    }

    function displayStudent(student, rank = 1) {
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';
        studentRow.innerHTML = `
            <div class="rank-number">${rank}</div>
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
                        <input type="file" class="change-photo-input" accept="image/*" style="display: none;">
                        <button class="change-photo-btn" data-id="${student.id}">更改照片</button>
                        <button class="delete-btn" data-id="${student.id}">刪除</button>
                    </div>
                </div>
                <div class="icon-display">
                    ${bonusIcon && student.score > 0 ? Array(student.score).fill(`<img src="${bonusIcon}" alt="加分圖示">`).join('') : ''}
                </div>
            </div>
        `;

        const addPointBtn = studentRow.querySelector('.add-point-btn');
        const subtractPointBtn = studentRow.querySelector('.subtract-point-btn');
        const changePhotoBtn = studentRow.querySelector('.change-photo-btn');
        const changePhotoInput = studentRow.querySelector('.change-photo-input');
        const deleteBtn = studentRow.querySelector('.delete-btn');

        addPointBtn.addEventListener('click', () => {
            updateScore(student, 1);
        });

        subtractPointBtn.addEventListener('click', () => {
            updateScore(student, -1);
        });

        changePhotoBtn.addEventListener('click', () => {
            changePhotoInput.click();
        });

        changePhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    student.photo = e.target.result;
                    updateRankings();
                };
                reader.readAsDataURL(file);
            } else {
                alert('請只上傳圖片文件！');
            }
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm('確定要刪除這位學生的資料嗎？')) {
                students = students.filter(s => s.id !== student.id);
                updateRankings();
            }
        });

        studentsContainer.appendChild(studentRow);
    }

    function playSound(isBonus) {
        const sound = isBonus ? bonusSound : deductionSound;
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log('播放音效失敗:', error);
        });
    }

    function updateScore(student, increment) {
        student.score += increment;
        
        // 播放音效
        playSound(increment > 0);
        
        // 更新排名
        updateRankings();
    }
}); 