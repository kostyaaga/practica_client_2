new Vue({
    el: '#app',
    data: {
        columns: [[], [], []] 
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

            this.columns[columnIndex].push({ id: Date.now(), title, items, completedAt: null });

            this.saveData();
        },

        updateProgress() {
            let movedToSecond = false;

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

            this.columns[1] = this.columns[1].filter(note => {
                let completed = note.items.every(i => i.done);
                
                if (completed) {
                    note.completedAt = new Date().toLocaleString();
                    this.columns[2].push(note);
                    return false;
                }
                return true;
            });

            if (movedToSecond) {
                this.saveData();
            }
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
