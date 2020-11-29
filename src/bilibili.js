import $ from 'jquery'
import down from './utils'

const key = () => btoa(location.href)

async function download(o){
    const audio_url = o[key()]
    if (!audio_url){
        alert('無法下載此視頻的音頻。')
        throw new Error('audio url is emtpy. skipped.')
    }
    const title = $('span.tit')[0].innerText || location.pathname
    await down({
        audio_url,
        title,
        format: 'm4a'
    })
}

const ops = $('div.rigth-btn')

let blLoading = false

function assignButton(){
    ops.prepend(`
        <div class="appeal-text" id="download-m4a">
            下載音頻
        </div>
    `)
    $('#download-m4a').on('click', e => {
        e.currentTarget.innerText = '下載中...'
        if(blLoading){
            return
        }
        blLoading = true
        browser.storage.local.get(key()).then(download).catch(console.warn).finally(() => {
            blLoading = false
            e.currentTarget.innerText = '下載音頻'
        })
    })
    browser.runtime.sendMessage({
        command: 'notify',
        data: {
            title: '音頻按鈕已出現在視頻下方。',
            message: '按下按鈕即可進行音頻下載。'
        }
    })
}



function initialize(){
    console.debug('initalizing button in bilibili...')

    document.body.onload = function() {
        console.log('page content has loaded.')
        setTimeout(assignButton, 3000)
    }

        setInterval(() => {
            console.debug('checking button is alive...')
            if(ops.find('#download-m4a').length == 0){
                console.debug('button is gone, creating one.')
                assignButton()
            }else{
                console.debug('button is alive.')
            }
        }, 15000)
}

export default initialize;