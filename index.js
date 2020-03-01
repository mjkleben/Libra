const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;


// Create a persistent database for user information
const Store = require('electron-store');
const store = new Store();

store.set('unicorn', '🦄');
console.log(store.get('unicorn'));
//=> '🦄'

// Use dot-notation to access nested properties
store.set('foo.bar', true);
console.log(store.get('foo'));
//=> {bar: true}

store.delete('unicorn');
console.log(store.get('unicorn'));
//=> undefined

let mainWindow;
let addWindow;


// Creating the app and its browser------------------------
// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true
    },
    width: 350,
    height:480,
    // resizable: false

  });
  // Load html in window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });
}


const fs = require('fs');
const ytdl = require('ytdl-core');
let audio_formats = ["mp3", "wav", "aiff", "aac", "ogg", "wma", "flac", "alac", "mp4", "avi", "wmv", "mov"];
let video_formats = ["mp4", "avi", "wmv", "mov"];

const cheerio=require('cheerio')
const axios = require("axios");



var getYoutubeLink = (data) =>{
  return axios(data)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    var links = $('a');
    var video_id;
    $(links).each(function(i, link){
      let current_link = $(link).attr('href');
      if(current_link.includes("watch")){
          video_id = current_link;
          return false;
      }
    });
    return video_id;
  }
  )
  .catch(console.error);
}

// Catch item:add
ipcMain.on('start-conversion', function(e, format, item){
  console.log("RECEIVED ITEM ", format, item);

  let download_link = item

  if(!item.includes("youtube.com")){
    let url = "https://www.youtube.com/results?search_query=" + item;
    getYoutubeLink(url).then(data => {
      let video_id = data;
      if(audio_formats.includes(format)){
        console.log("DOWNLOAD MUSIC");
        ytdl('https://www.youtube.com' + video_id, {filter: 'audio'}).pipe(fs.createWriteStream(item + '.' + format));
      }
      else if(video_formats.includes(format)){
        console.log("DOWNLOAD VIDEO");
        ytdl('https://www.youtube.com' + video_id).pipe(fs.createWriteStream(item + '.' + format));
      }
    });
  }

  else{
    if(audio_formats.includes(format)){
      console.log("DOWNLOAD MUSIC");
      ytdl('https://www.youtube.com/watch?v=GsF05B8TFWg', {filter: 'audio'}).pipe(fs.createWriteStream('audioVideo.' + format));
    }
    else if(video_formats.includes(format)){
      console.log("DOWNLOAD VIDEO");
      ytdl('https://www.youtube.com/watch?v=GsF05B8TFWg').pipe(fs.createWriteStream('video.' + format));
    }
  }



});


// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'Settings',
    submenu:[
      {
        label:'Download Location',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}