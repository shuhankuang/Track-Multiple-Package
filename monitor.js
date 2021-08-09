// 监听器，定时更新文件内容
class Klass_Monitor {
  constructor () {
    this.monitors = []
  }

  init () {
    let monitors = userProperties.getProperty('monitors')
    if(monitors) {
      this.monitors = JSON.parse(monitors)
    }else{
      this.monitors = []
      userProperties.setProperty('monitors', this.monitors)
    }
  }

  getAllMonitors () {
    let monitors = userProperties.getProperty('monitors')
    console.log(monitors)
    if(!monitors){
      this.monitors = []
      return this.monitors
    }
    monitors = JSON.parse(monitors)
    return monitors
  }

  createSheetMonitor (funcName) {
    // let functionName = 'updateSheetTrackings'
    let sheetId = SpreadsheetApp.getActive().getId()
    let monitors = this.getAllMonitors()
    // monitors = JSON.parse(monitors)
    // 如果当前文档已经有了监听器了，那么就不要监听了
    for( var i = 0; i < monitors.length; i++ ){
      let monitor = monitors[i]
      if(monitor.sheetId === sheetId){
        return
      }
    }
    // 创建监听器
    let tId = Trigger.createMinutesTrigger(1, funcName)
    console.log(tId)
    monitors.push({
      triggerId: tId,
      sheetId,
    })
    userProperties.setProperty('monitors', JSON.stringify(monitors))
    console.log(monitors)
    this.monitors = monitors
    return monitors
  }

  clear () {
    this.monitors = []
    userProperties.deleteProperty('monitors')
  }
}

let Monitor = new Klass_Monitor()

function monitor_clear () {
  Monitor.clear()
}

function monitor_create () {
  let fn = 'updateSheetTrackings'
  Monitor.createSheetMonitor(fn)
}







// end