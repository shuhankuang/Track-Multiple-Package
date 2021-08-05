// 用户
class Klass_User {
  constructor () {
    this.currentUserEmail = Session.getActiveUser().getEmail()
    this.currentUserId = Session.getActiveUser().getUserLoginId()
  }

  /**
   * 用户登录，默认是用当前的用户邮箱
   */
  signIn () {
    let user = userProperties.getProperty('user')
    if(user){
      let _me = JSON.parse(user)
      return _me
    }

    let username = this.currentUserEmail
    let password = this.currentUserId
    // console.log(username, password)
    // console.log('try to sign in')
    user = ParseServer.signIn(username, password)
    if(user && user.sessionToken) {
      // console.log('sign in done')
      userProperties.setProperty('user', JSON.stringify(user))
      userProperties.setProperty('token', JSON.stringify(user.sessionToken))
      return user
    }
    // no user
    if(user.code === 101) {
      // console.log('sign up a new user')
      user = ParseServer.signUp(username, password)
      userProperties.setProperty('user', JSON.stringify(user))
    }
    // console.log(user)
    return user
  }

  /**
   * 获取当前的邮箱
   */
  me () {
    let _me = userProperties.getProperty('user')
    return JSON.parse(_me)
  }

  email () {
    return this.currentUserEmail
  }

  /**
   * 用户登出
   */
  logout () {
    userProperties.deleteProperty('user')
    userProperties.deleteProperty('exUser')
  }

  /**
   * 判断是否付费高级用户
   */
  refreshProStatus () {
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
    let result = userProperties.getProperty('exUser')
    let exUser = JSON.parse(result)
    return exUser.pro
  }

  init () {
    this.signIn()
    this.refreshProStatus()
  }
}

const User = new Klass_User()

function user_test_signin () {
  User.signIn()
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