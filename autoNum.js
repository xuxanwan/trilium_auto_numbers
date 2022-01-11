function zeroPad(num, count) {
    var numZeropad = num + '';
    while (numZeropad.length < count) {
        numZeropad = "0" + numZeropad;
    }
    return numZeropad;
}

api.addButtonToToolbar({
    title: 'Sort',
    icon: 'sort-up',
    shortcut: 'alt+z',
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

            const branchs = notetmp.getBranches();
            var branch;
            for(const tmp of branchs){
                if(tmp.parentNoteId === curnote.noteId){
                    branch = tmp;
                }
            }

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

                await api.runOnBackend(async (newTitle, noteId, parentNoteId) => {
                    const note = api.getNote(noteId);
                    note.title = newTitle;
                    note.save();

                    const branchs = note.getBranches();
                    for(const branch of branchs){
                        log.info("parentNoteId------"+parentNoteId+"---branch.parentNoteId----"+branch.parentNoteId);
                        if(branch.parentNoteId === parentNoteId){
                            log.info("---modify---");
                            branch.prefix = "";
                            branch.save();
                        }
                    }
                }, [newTitle, notetmp.noteId, curnote.noteId]);
            }
        } else {
            //增加编号
            var num = 0;
            for (const note1 of notes) {
                const notetmp = await api.getNote(note1);
                if(notetmp.title.endsWith(".png")||notetmp.title.endsWith(".jpeg")||notetmp.title.endsWith(".gif")){
                  continue;
                }
                num = num + 1;
                
                await api.waitUntilSynced();
                var prefixStr = zeroPad(num, 3);
                var newTitle = zeroPad(num, 3) + "-" + notetmp.title;
                console.info("123  " + newTitle)
                await api.runOnBackend(async (newTitle, noteId, prefixStr, parentNoteId) => {
                    const note = api.getNote(noteId);
                    // note.title = newTitle;
                    // note.save();

                    const branchs = note.getBranches();
                    for(const branch of branchs){
                        if(branch.parentNoteId === parentNoteId){
                            branch.prefix = prefixStr;
                            branch.save();
                        }
                    }
                }, [newTitle, notetmp.noteId, prefixStr, curnote.noteId]);

            }
        }


    }
});