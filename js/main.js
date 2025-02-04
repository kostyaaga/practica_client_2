new Vue({
    el: '#app',
    data: {
        columns: [[], [], []],  // Столбцы: 0 - Новые, 1 - В процессе, 2 - Завершенные
        isLocked: false, // Флаг для блокировки чекбоксов
    },
    computed: {
        isBlocked() {
            return this.columns[1].length >= 5 && this.columns[0].some(note => {
                let completed = note.items.filter(i => i.done).length;
                return completed / note.items.length > 0.5;
            });
        }
    },
    methods: {
        addNote(columnIndex) {
            if (columnIndex === 0 && this.isBlocked) {
                alert("Добавление новых карточек запрещено, пока не освободится место во втором столбце!");
                return;
            }

            let title = prompt("Введите заголовок заметки:");
            if (!title) return;

            let itemCount;
            do {
                itemCount = parseInt(prompt("Введите количество пунктов (от 3 до 5):"), 10);
            } while (isNaN(itemCount) || itemCount < 3 || itemCount > 5);

            let items = [];
            for (let i = 0; i < itemCount; i++) {
                let text = prompt(`Введите пункт ${i + 1}:`);
                if (text) items.push({ text, done: false });
            }

            this.columns[columnIndex].push({ id: Date.now(), title, items, completedAt: null, isFavorite: false });

            this.saveData();
        },

        updateProgress() {
            let movedToSecond = false;

            // Блокировка возможности отмечать более 50% в первом столбце
            if (this.isBlocked) {
                if (!this.isLocked) {
                    this.isLocked = true; // Блокируем чекбоксы
                    this.columns[0].forEach(note => {
                        note.items.forEach(item => {
                            if (item.done) {
                                item.done = false; // Снимаем отметки
                            }
                        });
                    });
                    alert("Нельзя отметить более 50% пунктов в первом столбце, пока не освободится место во втором!");
                }
                return; // Прерываем выполнение, если заблокировано
            }

            // Снимаем блокировку и восстанавливаем возможность отмечать
            if (this.isLocked && !this.isBlocked) {
                this.isLocked = false;
            }

            // Обновляем первый столбец, перемещая завершенные заметки во второй
            this.columns[0] = this.columns[0].filter(note => {
                let completed = note.items.filter(i => i.done).length;
                let total = note.items.length;
                
                if (completed / total > 0.5 && this.columns[1].length < 5) {
                    this.columns[1].push(note);
                    movedToSecond = true;
                    return false;
                }
                return true;
            });

            // Обновляем второй столбец, перемещая завершенные заметки в третий
            this.columns[1] = this.columns[1].filter(note => {
                let completed = note.items.every(i => i.done);
                
                if (completed) {
                    note.completedAt = new Date().toLocaleString();
                    this.columns[2].push(note);
                    return false;
                }
                return true;
            });

            // Сортируем столбцы: избранные карточки должны быть первыми
            this.columns[0] = this.sortByFavorite(this.columns[0]);
            this.columns[1] = this.sortByFavorite(this.columns[1]);

            // Сортировка третьего столбца по дате завершения
            this.columns[2] = this.columns[2].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

            if (movedToSecond) {
                this.saveData();
            }
        },

        sortByFavorite(column) {
            return column.sort((a, b) => {
                if (a.isFavorite && !b.isFavorite) {
                    return -1;
                } else if (!a.isFavorite && b.isFavorite) {
                    return 1;
                }
                return 0;
            });
        },

        toggleFavorite(note) {
            note.isFavorite = !note.isFavorite;  // Переключаем состояние избранного
            this.saveData();
        },

        saveData() {
            localStorage.setItem('notes', JSON.stringify(this.columns));
        },

        loadData() {
            let data = localStorage.getItem('notes');
            if (data) {
                this.columns = JSON.parse(data);
            }
        },

        clearStorage() {
            localStorage.removeItem('notes');
            this.columns = [[], [], []];
        }
    },
    mounted() {
        this.loadData();
    }
});
