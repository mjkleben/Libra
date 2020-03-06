
const electron = require('electron');
const path = require('path');
const url = require('url');
const YouTube = require("./youtube.js");

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;


// Create a persistent database for user information
const Store = require('electron-store');
const store = new Store();
var list = [];
store.set(list, list.push("song1"));
// store.set('unicorn', '🦄');
// console.log(store.get('unicorn'));
// //=> '🦄'

// // Use dot-notation to access nested properties
// store.set('foo.bar', true);
// console.log(store.get('foo'));
// //=> {bar: true}

// store.delete('unicorn');
// console.log(store.get('unicorn'));
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


const cheerio=require('cheerio')
const axios = require("axios");


  




// var convertSoundcloud = (video_id, format) =>{
//   if(audio_formats.includes(format)){
//     console.log("STEP 3");
//     ytdl('https://www.youtube.com/watch?v=GsF05B8TFWg', {filter: 'audio'}).pipe(fs.createWriteStream('audioVideo.' + format));

//   }
//   else if(video_formats.includes(format)){
//     console.log("STEP 4");
//     ytdl('https://www.youtube.com/watch?v=GsF05B8TFWg').pipe(fs.createWriteStream('video.' + format));
//   }
// }


// Catch item:add
ipcMain.on('start-conversion', function(e, user_input, format, platform){
  if(platform=="youtube"){
    YouTube.convertYoutube(user_input, format)
  }
});


ipcMain.on('show-songs', function(e){
  console.log(store.get(list));
});


var recent_songs = [];

ipcMain.on('add', function(e, user_input){
  recent_songs.push(user_input);
  console.log(recent_songs);
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