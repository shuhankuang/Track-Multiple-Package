// const ADDON_HOST = `https://trackr.workaddons.com`
const ADDON_HOST = `https://2a691cf7f4b8.ngrok.io`
// parse server
// 参考：http://docs.parseplatform.org/rest/guide/#getting-started
class Klass_ParseServer {
  constructor () {
    this.host = ADDON_HOST
    this.headers = {
      'X-Parse-Application-Id': 'huawvdrdlruobltrewugrnsejiftchrwlaznmzrsqmlvkjduxb',
      // 'Content-Type': 'application/json',
    }
  }

  // 创建一个数据指针
  pointer (klass, id) {
    let p = {
      __type: 'Pointer',
      className: klass,
      objectId: id
    }
    return p
  }

  create (klass, data) {
    let url = `${this.host}/parse/classes/${klass}`
    let result = this.ajax(url, data, 'post', this.headers, 'create')
    return result
  }

  update (klass, id, data) {
    let url = `${this.host}/parse/classes/${klass}/${id}`
    let result = this.ajax(url, data, 'put', this.headers, 'update')
    return result
  }

  get (klass, id) {
    let url = `${this.host}/parse/classes/${klass}/${id}`
    let result = this.ajax(url, {}, 'get', this.headers, 'get')
    return result
  }

  remove (klass, id) {
    let url = `${this.host}/parse/classes/${klass}/${id}`
    let result = this.ajax(url, {}, 'delete', this.headers, 'remove')
    return result
  }

  // 参考：http://docs.parseplatform.org/rest/guide/#queries
  query (klass, q) {
    let queryString = Object.keys(q).map(key => key + '=' + q[key]).join('&')
    console.log(queryString)
    let url = `${this.host}/parse/classes/${klass}?${queryString}`
    let result = this.ajax(url, q, 'get', this.headers, 'query')
    return result
  }

  // 参考： http://docs.parseplatform.org/rest/guide/#batch-operations
  // 批量实现
  batch (objects) {
    let url = `${ADDON_HOST}/parse/batch`
    let data = {
      requests: objects
    }
    let result = this.ajax(url, data, 'post', this.headers, 'batch')
    return result
  }
  
  count (klass, q) {
    // q: {where: {}, count: 1, limit: 1}
    let queryString = Object.keys(q).map(key => key + '=' + q[key]).join('&')
    let url = `${this.host}/parse/classes/${klass}?${queryString}`
    let result = this.ajax(url, q, 'get', this.headers ,'count')
    return result
  }

  signUp (username, password) {
    let url = `${this.host}/parse/users`
    let user = this.ajax(url, {username, password}, 'post', this.headers, 'signUp')
    return user
  }

  signIn (username, password) {
    let url = `${this.host}/parse/login`
    let user = this.ajax(url, {username, password}, 'get', this.headers, 'signIn')
    return user
  }

  ajax (url, data, method, headers, command) {
    headers = headers ? headers : this.headers
    method = method ? method : 'post'
    let user = userProperties.getProperty('user')
    if(user) {
      let userObj = JSON.parse(user)
      let obj = {'X-Parse-Session-Token': userObj.sessionToken}
      // 数据权限
      let ACL = `{"${userObj.objectId}": {"read": true, "write": true}, "role: Administrator": {"read": true, "write": true} , "*": {}}`
      // console.log(JSON.parse(ACL))
      data.ACL = JSON.parse(ACL)
      if(command != 'signIn' && command != 'signUp') {
        Object.assign(obj, headers)
      }else{
        obj = undefined
      }
      if(method === 'get' || method === 'put' || command === 'runCloudCode' || command === 'query') {
        data.ACL = undefined
        delete data.ACL
      }
      headers = obj
    }
    let opts = {
      contentType: 'application/json',
      method: method,
      payload: JSON.stringify(data),
      headers: headers,
      muteHttpExceptions: true,
    }
    // 处理多余的数据
    if(command === 'get' || command === 'count'|| command === 'query') {
      opts.payload = undefined
      opts.contentType = undefined
      delete opts.payload
      delete opts.contentType
    }
    console.log(opts)
    console.log(url)
    try{
      let result = UrlFetchApp.fetch(url, opts)
      result = JSON.parse(result.getContentText())
      // console.log(result)
      return result
    }catch(err){
      console.log(err)
      return err
    }
  }

  // 运行云代码
  runCloudCode (func_name, data) {
    let url = `${this.host}/parse/functions/${func_name}`
    let result = this.ajax(url, data, 'post', this.headers, 'runCloudCode')
    return result
  }
}

const ParseServer = new Klass_ParseServer()
// test functions
function parseserver_test_query () {
  let me = User.me()
  let user = ParseServer.pointer('User', 'oSRyMFTlFu')
  let where = {
    tracking_num: '9361289738009091755413'
  }
  let result = ParseServer.query('Tracking', {
    where: JSON.stringify(where),
    include: `'user'`,
    limit: 2
  })
  console.log(result)
}

function parseserver_test_count () {
  let result = ParseServer.count('GameScore', {
    count: 10,
    limit: 0,
  })
  console.log(result)
}

function parseserver_test_create () {
  let result = ParseServer.create('GameScore', {value: 1000})
  console.log(result)
}

function parseserver_test_get () {
  let result = ParseServer.get('GameScore', 'CsB49kf20q')
  console.log(result)
}

function parseserver_test_update () {
  let result = ParseServer.update('GameScore', 'CsB49kf20q', {value: 2111})
  console.log(result)
}

function parseserver_test_remove () {
  let result = ParseServer.remove('GameScore', 'CsB49kf20q')
  console.log(result)
}

function parseserver_test_runCouldCode () {
  let user = userProperties.getProperty('user')
  let uid = JSON.parse(user).objectId
  console.log(uid)
  let result = ParseServer.runCloudCode('isPro', {
    uid,
  })
  console.log(result)
}

// end 


