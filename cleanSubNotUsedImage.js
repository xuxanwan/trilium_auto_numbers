api.addButtonToToolbar({
    title: 'deleteSub',
    icon: 'dislike',
    shortcut: 'alt+x',
    action: async function () {
        const curnote = await api.getActiveTabNote();
        var notes = [];
        const filterChildBranches = curnote.getFilteredChildBranches();
        for(const branch of filterChildBranches){
            const notetmp = await api.getNote(branch.noteId);
            if(notetmp.type === "image"){
                notes.push(branch.noteId);
            }
        }
        debugger;
        console.info(notes);
        console.info(notes.length)

        await api.runOnBackend(async (notes) => {
            const utils = require('../services/utils');
            const TaskContext = require('../services/task_context');
            const noteService = require('../services/notes');

            const taskId = utils.randomString(10);
            const taskContext = TaskContext.getInstance(taskId, 'delete-notes');

            for (const noteId of notes) {
                const deleteId = utils.randomString(10);
                const note = api.getNote(noteId);
                for (const branch of note.getBranches()) {
                    log.info("---branch---" + JSON.stringify(branch));
                    noteService.deleteBranch(branch, deleteId, taskContext);
                }
            }
            taskContext.taskSucceeded();
        }, [notes]);
    }
});