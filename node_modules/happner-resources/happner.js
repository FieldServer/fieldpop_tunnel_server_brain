module.exports = {
  configs: {
    "autoload":[
     {
        "module":{
          name:"happner-resources",
          config:{
            path:__dirname + "/index.js"
          }
        },
        "component":{
          name:"happner-resources",
          moduleName: "happner-resources",
          config: {
            startMethod:"initialize",
            schema:{
              "exclusive":false
            },
            web:{
              routes:{
                "static":__dirname + "/resources"
              }
            }
          }
        }
      }
    ]
  }
}
