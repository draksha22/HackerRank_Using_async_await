const puppeteer = require("puppeteer");
const fs = require('fs');
const pdf = require('pdfkit');
let link = 'https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq';

let cTab;
(async function(){
    try {
        let browserOpen = puppeteer.launch({
            headless : false,
            args : ["--start-maximized"],
            defaultViewport : null
        })

        let newtab = await browserOpen;
        let allTabs = await newtab.pages();
        cTab = allTabs[0];
        await cTab.goto(link);
        await cTab.waitForSelector('h1#title');
        let name = await cTab.evaluate(function(select){
            return document.querySelector(select).innerText
        }, 'h1#title');
        // console.log(name);
        let allData = await cTab.evaluate(getData, '#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
        console.log(name, allData.noOfVideos, allData.noOfViews);
        let totalVideos = allData.noOfVideos.split(" ")[0];
        console.log(totalVideos);
        let currentVideos = await getCVLength();
        console.log(currentVideos);

        while(totalVideos - currentVideos >= 20){
            await scrollToBottom();
            currentVideos = await getCVLength();
        }

        let finalList = await getStats();
        // console.log(finalList);
        let pdfDoc = new pdf;
        pdfDoc.pipe(fs.createWriteStream('playlist.pdf'));
        pdfDoc.text(JSON.stringify(finalList));
        pdfDoc.end();

    } catch (error) {
        console.log(error);
    }
})();


function getData(selector){
    let allElems = document.querySelectorAll(selector);
    let noOfVideos = allElems[0].innerText;
    let noOfViews = allElems[1].innerText;
    return{
        noOfVideos,
        noOfViews
    }
}

async function getCVLength(){
    let length = await cTab.evaluate(getLength, '#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    return length;
}

async function scrollToBottom(){
    await cTab.evaluate(gotoBottom);
    function gotoBottom(){
        window.scrollBy(0,window.innerHeight)
    }
}

async function getStats(){
    let list = cTab.evaluate(getNameAndDuration, "#video-title", '#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    return list;
}

function getLength(durationSelect){
    let durationEle = document.querySelectorAll(durationSelect);
    return durationEle.length;
}

function getNameAndDuration(videoSelector, durationSelector){
    let videoEle = document.querySelectorAll(videoSelector);
    let durationEle = document.querySelectorAll(durationSelector);
    let currentList = [];
    for(let i = 0; i < durationEle.length;i++){
        let videoTitle = videoEle[i].innerText;
        let duration = durationEle[i].innerText;
        currentList.push({videoTitle,duration});
    }

    return currentList;


}