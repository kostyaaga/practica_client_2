new Vue({
    el: '#app',
    data: {
        columns: [[], [], []]
    },
    methods: {
        updateProgress() {
            this.columns[0] = this.columns[0].filter(note => {
                let completed = note.items.filter(i => i.done).length;
                if (completed / note.items.length > 0.5 && this.columns[1].length < 5) {
                    this.columns[1].push(note);
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
        }
    }
});