function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

api.addButtonToToolbar({
    title: 'title',
    icon: 'calendar',
    shortcut: 'alt+i',
    action: async function () {
        console.info(getSelectionText());
        const curnote = await api.getActiveTabNote();

        await api.runOnBackend(async (newTitle, noteId) => {
            const note = api.getNote(noteId);
            note.title = newTitle;
            note.save();
        }, [getSelectionText(), curnote.noteId]);
    }
});