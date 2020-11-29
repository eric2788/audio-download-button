import browser from 'webextension-polyfill'

const audioMap = {
    lock: false,
    map: {},
    get: async (key) => {
        return new Promise((res, ) => {
            if(audioMap.lock) {
                console.log('locking, wait.')
                setTimeout(() => res(audioMap.get(key)), 300)
            }
            else res(audioMap.map[key])
        })
    },
    set: (key, value) => {
        audioMap.map[key] = value
    }
}

async function getAudioLink(e) {
    const url = e.url
    const originUrl = e.requestHeaders.find(h => h.name === 'Referer')?.value
    if (originUrl == undefined) {
        console.warn('originUrl is undefined, skipped.')
        return
    }
    //console.debug("scanning link " + url + " from " + originUrl);
    const key = btoa(originUrl)
    if (await audioMap.get(key) !== undefined) return
    audioMap.lock = true
    if (await isAudio(url)){
        console.log(`saving audio link ${url} from ${originUrl}`)
        audioMap.set(key, url)
        await browser.storage.local.set(audioMap.map)
        await sendNotify({
            title: '音頻已準備就緒。',
            message: '等待按鈕出現即可下載。'
        })
    }else{
        console.warn('is video link ,skipped')
        // or if you want to save ?
    }
    audioMap.lock = false
}

async function isAudio(url){
    return new Promise((res, ) => {
        try{
            const id = Date.now();
            const v = document.createElement("video");
            v.id = id;
            v.src = url;
            v.type = "video/mp4";
            v.addEventListener('loadeddata', ({target}) => res(target.mozHasAudio))
        }catch(err){
            console.warn(`error while checking audio: ${err}`)
            setTimeout(isAudio, 3000)
        }
    })
}

function sendNotify(req){
    console.log('sending notification')
    return browser.notifications.create({
        type: 'basic',
        ...req
    })
}

function createTab(data){
    console.log('opening tab')
    return browser.tabs.create(data)
}

browser.runtime.onMessage.addListener((req, ) => {
    console.log('receive message: '+JSON.stringify(req))
    switch(req.command){
        case "notify":
            sendNotify(req.data)
            break;
        case "tab":
            createTab(req.data)
            break;
        default:
            console.debug(`unknown command ${req.command}`)
            break;    
    }
})

browser.webRequest.onSendHeaders.addListener(
    getAudioLink,
    {urls: ["*://upos-hz-mirrorakam.akamaized.net/upgcxcode/*"]},
    ["requestHeaders"]
);