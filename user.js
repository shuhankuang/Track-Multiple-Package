// 用户
class Klass_User {
  constructor () {
    // 
  }

  /**
   * 用户登录，默认是用当前的用户邮箱
   */
  signIn () {
    // if(!userProperties) {
    //   userProperties = PropertiesService.getUserProperties()
    //   // 个人设置
    //   if(!userProperties.getProperty('setting')){
    //     userProperties.setProperty('setting', JSON.stringify(default_setting))
    //   }
    //   // 物流单号更新监听器
    //   if(!userProperties.getProperty('monitors')) {
    //     userProperties.setProperty('monitor', JSON.stringify(default_monitors))
    //   }
    // }
    let userProperties = Storage.user()
    let user = userProperties.getProperty('user')
    console.log('sign in')
    console.log(user)
    if(user){
      let _me = JSON.parse(user)
      return _me
    }

    let username = this.currentUserEmail
    let password = this.currentUserId
    // console.log(username, password)
    console.log('try to sign in')
    user = ParseServer.signIn(username, password)
    
    if(user && user.sessionToken) {
      console.log('sign in done')
      userProperties.setProperty('user', JSON.stringify(user))
      userProperties.setProperty('token', JSON.stringify(user.sessionToken))
      return user
    }
    console.log(user)
    // no user
    if(user.code === 101) {
      // console.log('sign up a new user')
      user = ParseServer.signUp(username, password)
      userProperties.setProperty('user', JSON.stringify(user))
    }
    console.log(user)
    return user
  }

  /**
   * 获取当前的邮箱
   */
  me () {
    let userProperties = Storage.user()
    let _me = userProperties.getProperty('user')
    return JSON.parse(_me)
  }

  email () {
    return Session.getActiveUser().getEmail()
  }

  /**
   * 用户登出
   */
  logout () {
    let userProperties = Storage.user()
    userProperties.deleteProperty('user')
    userProperties.deleteProperty('exUser')
  }

  /**
   * 判断是否付费高级用户
   */
  refreshProStatus () {
    let userProperties = Storage.user()
    let user = userProperties.getProperty('user')
    let uid = JSON.parse(user).objectId
    let result = ParseServer.runCloudCode('isPro', {
      uid,
    })
    /**
     * exUser:::::
     * { result: 
   { pro: false,
     plan_opts: 
      { text: '35% Off, <i class="fas fa-bolt" style=\'color: white\'></i>&nbsp;&nbsp;Limited time offer. Sale ends in',
        only_show_text: false,
        time: 86400,
        current: 1627287767,
        start: 1627279088,
        end: 1627365488,
        active: true,
        subs: [Object] } } }
     */
    result = result.result
    console.log(result)
    // result = {pro: result.pro}
    // result.pro = true // just for test, set the current user to Pro
    userProperties.setProperty('exUser', JSON.stringify(result))
    return result
  }

  isPro () {
    let userProperties = Storage.user()
    let result = userProperties.getProperty('exUser')
    let exUser = JSON.parse(result)
    return exUser.pro
  }

  init () {
    this.currentUserEmail = Session.getActiveUser().getEmail()
    this.currentUserId = Session.getActiveUser().getUserLoginId()
    this.signIn()
    this.refreshProStatus()
  }
}

const User = new Klass_User()

function user_test_signin () {
  // User.signIn()
  User.init()
}

function user_test_logout () {
  User.logout()
}

function user_test_isPro () {
  let result = User.refreshProStatus()
  console.log(result)
  return result
}

function user_get_me () {
  let me = User.me()
  console.log(me)
}

function user_get_email () {
  let e = User.email()
  console.log(e)
}