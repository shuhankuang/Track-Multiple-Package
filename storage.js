class Klass_Storage {
  constructor () {

  }

  user () {
    return PropertiesService.getUserProperties()
  }

  document () {
    return PropertiesService.getDocumentProperties()
  }

  script () {
    return PropertiesService.getScriptProperties()
  }
}

let Storage = new Klass_Storage()