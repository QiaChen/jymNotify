const electron = require('electron')
const {net} = require('electron')
const {Menu, Tray,Notification} = require('electron')
const child_process = require('child_process')
const sleep = require('sleep');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let mainWindow
let gid=0
let netuse = false

function createWindow () {
  tray = new Tray(path.join(__dirname,'asset/logo.png'))
    const contextMenu = Menu.buildFromTemplate([
      {label: '退出',click:function(){app.quit()}, type: 'normal'},
     
    ])
    tray.setToolTip('账号查询')
    tray.setContextMenu(contextMenu)
    setInterval(function(){
      getInfo()
    },2000)
}

function getInfo(){
    if(netuse ==true){
      return
    }
    netuse = true;
    let request = net.request('https://m.jiaoyimao.com/fe/ajax/goods/?gameId=498&r=1&extConditions=%7B%22lowerPrice%22%3A%22100%22%7D&page=1')
    
    request.on('error', (error) => {
          let myNotification = new Notification({
              icon: path.join(__dirname,'asset/no.jpg'),
              title:'请求错误',
              body: 'request错误'+error
          })
          myNotification.show()
          netuse =false
      })

    request.on('response', (response) => {
      res = ""
      response.on('data', (chunk) => {
        res = res+chunk
      })
      
      response.on('error', (error) => {
          let myNotification = new Notification({
              icon: path.join(__dirname,'asset/no.jpg'),
              title:'请求错误',
              body: 'response错误：'+error
          })
          netuse =false
          myNotification.show()
      })
      response.on('end', () => {
        netuse =false
        let data = JSON.parse(res)
        console.log('test')
        if(data.data.goodsList[0].goodsId != gid){
          gid = data.data.goodsList[0].goodsId
          let myNotification = new Notification({
              icon: path.join(__dirname,'asset/no.jpg'),
              title:'新账号',
              body: data.data.goodsList[0].realTitle+"。价格："+data.data.goodsList[0].price.toString()
          })
          myNotification.on('click',function(){
              goWeb(data.data.goodsList[0].goodsDetailUrl)
          })
          myNotification.show()
          //setTimeout(function(){myNotification.close()},3000)
        }

      })
    })
    request.end()
}

function goWeb(url){
  if (process.platform == 'wind32') {
    cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
  } else if (process.platform == 'linux') {
    cmd = 'xdg-open';
  } else if (process.platform == 'darwin') {
    cmd = 'open';
  }
  child_process.exec(`${cmd} "${url}"`);
}
app.on('ready', createWindow)
