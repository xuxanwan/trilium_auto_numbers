const {protocol} = require('electron')
const {BrowserWindow} = require('electron')
const path = require('path')

//File scheme is not permited in Electron with default options, register another name to use.
if (!protocol.isProtocolRegistered('path')) {
    protocol.registerFileProtocol('path', (request, callback) => {
        const url = request.url.substr(7)
        if(url=="test"){
            callback({path:__filename})
        }else{
        callback({ path: path.normalize(decodeURI(url)) })
        }
    });
    //After registration, reload frontend.
    if (protocol.isProtocolRegistered('path')) {
        BrowserWindow.getAllWindows().forEach(function(w){
            w.reload();
        });
    }
}