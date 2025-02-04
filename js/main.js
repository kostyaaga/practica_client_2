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
            let secondColumnFull = this.columns[1].length >= 5;

            this.columns[0].forEach(note => {
                let completed = note.items.filter(i => i.done).length;
                let total = note.items.length;

                // Флаг, запрещающий ставить более 50% галочек
                note.canCompleteMoreThan50 = !(secondColumnFull && completed / total >= 0.5);

                // Блокировка чекбоксов, если нельзя отметить больше 50%
                note.items.forEach(item => {
                    item.disabled = !item.done && !note.canCompleteMoreThan50;
                });
            });

            // Перемещаем заметки во второй столбец, если выполнено больше 50%
            this.columns[0] = this.columns[0].filter(note => {
                let completed = note.items.filter(i => i.done).length;
                let total = note.items.length;

                if (total > 0 && completed / total > 0.5 && !secondColumnFull) {
                    this.columns[1].push(note);
                    return false;
                }
                return true;
            });

            this.columns[1] = this.columns[1].filter(note => {
                let completed = note.items.filter(i => i.done).length;
                let total = note.items.length;

                // Если выполнено меньше 50%, перемещаем в первый столбец
                if (completed / total < 0.5) {
                    this.columns[0].unshift(note);  // Добавляем обратно в первый столбец
                    return false;  // Убираем из второго столбца
                }
                return true;
            });

            // Перемещаем завершенные заметки в третий столбец
            this.columns[1] = this.columns[1].filter(note => {
                let completed = note.items.every(i => i.done) && note.items.length > 0;

                if (completed) {
                    // Устанавливаем дату и время завершения
                    note.completedAt = new Date().toLocaleString();
                    // Вставляем заметку в начало столбца "Завершенные"
                    this.columns[2].unshift(note);
                    return false;
                }
                return true;
            });

            // Сортировка по избранному
            this.columns[0] = this.sortByFavorite(this.columns[0]);
            this.columns[1] = this.sortByFavorite(this.columns[1]);

            this.saveData();
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
            note.isFavorite = !note.isFavorite;

            // Найти столбец, в котором находится карточка
            for (let i = 0; i < this.columns.length; i++) {
                let index = this.columns[i].indexOf(note);
                if (index !== -1) {
                    // Удаляем карточку из текущей позиции
                    this.columns[i].splice(index, 1);
                    // Вставляем ее в начало списка
                    this.columns[i].unshift(note);
                    break;
                }
            }

            this.saveData();
            this.$forceUpdate(); // Форсируем обновление Vue
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
