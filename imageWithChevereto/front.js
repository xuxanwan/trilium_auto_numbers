//Test whether path scheme is registed.
$.ajax({
    url: "path://test",
    success: function () {
        function insertImages(src, textEditor) {
            textEditor.model.change(writer => {
                for (let i = src.length - 1; i >= 0; i--) {
                    const imageElement = writer.createElement( 'image', { 'src': src[i]});
                    debugger;
                   // textEditor.model.insertContent(imageElement, textEditor.model.document.selection);
                    const imageUtils = textEditor.plugins.get( 'ImageUtils' );
                    imageUtils.insertImage( { src: src[i] }, textEditor.model.document.selection );
                };
            });
        }
        //Add a button into toolbar.
        $(".ck-body-wrapper").on("mouseover", ".ck.ck-button.ck-off.ck-block-toolbar-button", function () {
            if (api.getActiveTabNote().type == "text") {
                $(".ck-body-wrapper").off("mouseover", ".ck.ck-button.ck-off.ck-block-toolbar-button");
                $(".ck-file-dialog-button:first").before(`<span class="ck-file-dialog-button insertImageEx"><button class="ck ck-button ck-off" type="button" tabindex="-1"><span class="bx bxs-image" style="font-size:21px"></span><span class="ck ck-tooltip ck-tooltip_s"><span class="ck ck-tooltip__text">Insert Image EX</span></span><span class="ck ck-button__label">Insert Image EX</span></button></span>`);
                $(".insertImageEx").on("mousedown", () => {

                    //Insert image by mousedown on the button(I don't know why click event doesn't work).
                    api.getActiveTabTextEditor(function (textEditor) {
                        let data = "";
                        try {
                            data = textEditor.model.document.roots._items[1]._children._nodes[textEditor.model.document.selection.getFirstPosition().path[0]]._children._nodes[0]._data;
                        } catch { }
                        //http:// or https://
                        if (data.search(/(https?|path):\/\//i) == 0) {
                            insertImages([data], textEditor);
                        }
                        //file://
                        else if (data.startsWith("file://")) {
                            insertImages([data.replace("file://", "path://")], textEditor);
                        }
                        //C:\, D:\,E:\……Z:\
                        else if (data.search(/[C-Z]:\\/i) == 0) {
                            insertImages(["path://" + data], textEditor);
                        }
                        //Select images by window.
                        else {
                            $('<input type="file" multiple="true" accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff"/>')
                                .click()
                                .on('change', event => {
                                    let src = [];
                                    for (let i = 0; i < event.target.files.length; i++) {
                                        const file = event.target.files[i];
                                        src[i] = "path://" + decodeURI(file.path);
                                    };
                                    insertImages(src, textEditor);
                                });
                        }
                    })
                });
                //Double click the inserted image with path scheme will open it by your default image viewer.
                $(".note-detail-editable-text-editor").on("dblclick", "img[src^=path]", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    const imgSrc = e.target.src.replace("path://", "file://");
                    window.open(imgSrc, '_blank');
                });
            }
        });
    },
    error: function () {
        //Toast this plugin is loading.
        $("#toast-container").append(`<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="opacity: 1;"><div class="toast-header"><strong class="mr-auto"><span class="bx bx-info-circle"></span> Warn</strong></div><div class="toast-body">Insert Image EX is loading, please wait frontend reloaded.</div></div>`);
    }
});