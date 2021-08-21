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
        const curnote = await api.getActiveTabNote();
        const notes = curnote.children
        debugger;
        // const notes = await api.runOnBackend(async (noteId) => {
        //     return api.sql.getRows(
        //         `SELECT branches.branchId, notes.noteId, title, isProtected, 
        //                   CASE WHEN COUNT(childBranches.noteId) > 0 THEN 1 ELSE 0 END AS hasChildren 
        //            FROM notes 
        //            JOIN branches ON branches.noteId = notes.noteId
        //            LEFT JOIN branches childBranches ON childBranches.parentNoteId = notes.noteId AND childBranches.isDeleted = 0
        //            WHERE branches.isDeleted = 0 AND branches.parentNoteId = ?
        //            GROUP BY notes.noteId`, [noteId]);
        // }, [curnote.noteId]);
        console.info(notes);
        console.info(notes.length)
        // debugger;
        var isRemoveHyphenFlag = false;

        for (const note1 of notes) {
            const notetmp = await api.getNote(note1);
            const branch = notetmp.getBranches()[0];
            
            if (/^\d+/.test(branch.prefix)) {
                console.info(branch.prefix)
                isRemoveHyphenFlag = true;
            }

            // await api.waitUntilSynced();
            // if (/^\d+-/.test(notetmp.title)) {
            //     console.info(notetmp.title)
            //     isRemoveHyphenFlag = true;
            // }
        }

        if (isRemoveHyphenFlag) {
            //移除编号
            for (const note1 of notes) {

                const notetmp = await api.getNote(note1);
                await api.waitUntilSynced();

                var newTitle = notetmp.title.slice(notetmp.title.indexOf("-") + 1, notetmp.title.length);
                console.info("123  " + newTitle)

                await api.runOnBackend(async (newTitle, noteId) => {
                     const note = api.getNote(noteId);
                    note.title = newTitle;
                    note.save();

                    const branch = note.getBranches()[0];
                    branch.prefix = "";
                    branch.save();
                }, [newTitle, notetmp.noteId]);
            }
        } else {
            //增加编号
            var num = 0;
            for (const note1 of notes) {
                num = num + 1;

                const notetmp = await api.getNote(note1);
                await api.waitUntilSynced();
                var prefixStr = zeroPad(num, 3);
                var newTitle = zeroPad(num, 3) + "-" + notetmp.title;
                console.info("123  " + newTitle)
                await api.runOnBackend(async (newTitle, noteId, prefixStr) => {
                     const note = api.getNote(noteId);
                    // note.title = newTitle;
                    // note.save();
                    
                    const branch = note.getBranches()[0];
                    branch.prefix = prefixStr;
                    branch.save();
                }, [newTitle, notetmp.noteId, prefixStr]);

            }
        }


    }
});