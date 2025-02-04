new Vue({
    el: '#app',
    data: {
        columns: [[], [], []]
    },
    methods: {
        addNote(columnIndex) {
            let title = prompt("Введите заголовок:");
            if (title) {
                this.columns[columnIndex].push({ title });
            }
        }
    }
});