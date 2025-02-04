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
                alert("Добавление новых карточек запрещено!");
                return;
            }
    
            let title = prompt("Введите заголовок:");
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
    
            this.columns[columnIndex].push({ title, items });
        }
    }
});