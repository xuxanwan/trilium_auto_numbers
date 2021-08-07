function zeroPad(num, count) {
    var numZeropad = num + '';
    while (numZeropad.length < count) {
        numZeropad = "0" + numZeropad;
    }
    return numZeropad;
}
api.addButtonToToolbar({
    title: 'Sort',
    icon: 'calendar',
    shortcut: 'alt+y',
    action: async function () {
        debugger;
        const curnote = await api.getActiveTabNote();
        debugger;
        const notes = await api.runOnBackend(async (noteId) => {
            return api.sql.getRows(
                `SELECT branches.branchId, notes.noteId, title, isProtected, 
                          CASE WHEN COUNT(childBranches.noteId) > 0 THEN 1 ELSE 0 END AS hasChildren 
                   FROM notes 
                   JOIN branches ON branches.noteId = notes.noteId
                   LEFT JOIN branches childBranches ON childBranches.parentNoteId = notes.noteId AND childBranches.isDeleted = 0
                   WHERE branches.isDeleted = 0 AND branches.parentNoteId = ?
                   GROUP BY notes.noteId`, [noteId]);
        },[curnote.noteId]);
        console.info(notes);
        console.info(notes.length)
        // debugger;
        var noteIdArray = new Array();
        var tmpLength = 0;
        var noSplshCount = 0;
        var count = 0;
        for (const note of notes) {

            if (note.title.indexOf("-") >= 0) {
                console.info(note.title)
                tmpLength = tmpLength + 1;
            } else {
                noSplshCount = noSplshCount + 1;
            }
            noteIdArray[count] = note.noteId;
            count = count + 1;
        }

        if (tmpLength - notes.length == 0) {
            //移除编号
            for (const notetmp of notes) {

                var newTitle = notetmp.title.slice(notetmp.title.indexOf("-") + 1, notetmp.title.length);
                console.info("123  " + newTitle)

                await api.runOnBackend(async (newTitle, noteId) => {
                    const note = api.getNote(noteId);
                    note.title = newTitle;
                    note.save();
                }, [newTitle, notetmp.noteId]);
            }
        }

        if (noSplshCount - notes.length == 0) {
            //增加编号
            var num = 0;
            for (const notetmp of notes) {
                num = num + 1;

                var newTitle = zeroPad(num, 3) + "-" + notetmp.title;
                console.info("123  " + newTitle)
                await api.runOnBackend(async (newTitle, noteId) => {
                    const note = api.getNote(noteId);
                    note.title = newTitle;
                    note.save();
                }, [newTitle, notetmp.noteId]);

            }
        }

    }
});