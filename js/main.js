new Vue({
    el: '#app',
    data: {
        columns: [[], [], []]
    },
    methods: {
        addNote(columnIndex) {
            let title = prompt("Введите заголовок:");
            if (!title) return;

            let items = [];
            for (let i = 0; i < 3; i++) {
                let task = prompt(`Введите пункт ${i + 1}:`);
                if (task) items.push({ text: task, done: false });
            }

            this.columns[columnIndex].push({ title, items });
        }
    }
});