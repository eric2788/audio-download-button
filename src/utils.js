async function download({audio_url, title, format}){
    const res = await fetch(audio_url)
    const blob = await res.blob()
    const a = document.createElement('a');
    const f = blob.slice(0, blob.size, `audio/${format}`)
    const url = window.URL.createObjectURL(f);
    const filename = `${title}.${format}`;
    a.href = url;
    a.download = filename;
    a.click()
    window.URL.revokeObjectURL(url);
}

export default download