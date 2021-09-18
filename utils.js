/**
 * 加密字符串
 * @salt 盐值
 */
 function cipher(salt) {
  const textToChars = text => text.split('').map(c => c.charCodeAt(0))
  const byteHex = n => ('0' + Number(n).toString(16)).substr(-2)
  const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)
  return text =>
    text
      .split('')
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join('')
}

/**
 * 解密字符串
 * @salt 盐值
 */
function decipher(salt) {
  const textToChars = text => text.split('').map(c => c.charCodeAt(0))
  const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)
  return encoded =>
    encoded
      .match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('')
}

/**
 * 弹出 alert 窗口
 */
function showAlert (params) {
  var ui = SpreadsheetApp.getUi()
  var result = ui.alert(
     params.title,
     params.message,
     ui.ButtonSet.OK)

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    // ui.alert('Confirmation received.');
  } else {
    // User clicked "No" or X in the title bar.
    // ui.alert('Permission denied.');
  }
}

/**
 * 获取当前用户
 */
function doGetMe () {
  // let me = User.email()
  let userProperties = Storage.user()
  let me = {}
  let user = userProperties.getProperty('user')
  let exUser = userProperties.getProperty('exUser')
  me.user = JSON.parse(user)
  me.email = User.email()
  me.exUser = JSON.parse(exUser)
  let state = ParseServer.runCloudCode('fetchUserStatus', {})
  me.state = state.result
  // me.exUser.pro = true
  let token_obj = {
    uid: me.user.objectId,
    email: me.email,
    app: APP_NAME,
    v: VERSION,
  }
  let token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // Object.assign(token_obj, {plan: 'standard'})
  // // console.log(token_obj)
  // let standard_token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // Object.assign(token_obj, {plan: 'professional'})
  // // console.log(token_obj)
  // let professional_token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // Object.assign(token_obj, {plan: 'business'})
  // let business_token = cipher(APP_NAME)(JSON.stringify(token_obj))
  // console.log(token_obj)
  me.subscribeURL = `${ADDON_HOST}/stripe/redirect?token=${token}`
  // me.subscribeURL = `http://localhost:3120/stripe/redirect?token=${token}`
  me.version = VERSION
  // me.subscribeURLs = {
  //   standard: `${ADDON_HOST}/stripe/redirect/${standard_token}`,
  //   professional: `${ADDON_HOST}/stripe/redirect/${professional_token}`,
  //   business: `${ADDON_HOST}/stripe/redirect/${business_token}`,
  // }
  console.log(me)
  return me
}


function chuckArray (arr, chunkSize) {
  if (chunkSize <= 0) {
    throw "Invalid chunk size"
  }
  let R = []
  let len = Math.ceil(arr.length / chunkSize)
  for (let i = 0; i < len; i++) {
    R.push(arr.slice(i * chunkSize, (i + 1) * chunkSize))
  }
  return R
}
