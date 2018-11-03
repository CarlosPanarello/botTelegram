var format = require('date-fns').format;  
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;  
  
var userDataSchema = new Schema({  
 telegramId: {type: String, required: true},  
 cpf:  {type: String, required: true},  
 conta:  {type: String, required: true},  
 name:  {type: String, required: true},  
 organizationId:  {type: Number, required: true},
 data: {type: String, required: true},  
}, {collection: 'Usuarios'});  

const dbOptions = {
  auth: {
    authdb: "admin",
  },
  pass: process.env.mongo_pwd,
  user: process.env.mongo_user,
  useNewUrlParser: true,
};

mongoose.connect(process.env.mongodb_app, dbOptions)
.then(console.log("Conectou no MONGO"))
.catch((e) => {
  console.log("Não Conectou no MONGO --> ", e)
  process.exit(1);
});

var Usuarios = mongoose.model('UserData', userDataSchema);  

function buscaPorTelegramId(id) {
  return Usuarios.findOne({telegramId: id});
};

function inserirUsuario(telegramId, cpf, organizationId, name, conta){
  var item = {  
    telegramId,  
    cpf,
    conta,  
    organizationId,
    name,
    data: format(new Date())  
  };  
   
  var data = new Usuarios(item);  
  return data.save();  
};

function criarSeNaoEcontrar(telegramId, cpf, organizationId, name, conta){
  return new Promise((resolve, reject) => {
    buscaPorTelegramId(telegramId)
    .then((item) => {
      if (!item) {
        return inserirUsuario(telegramId, cpf, organizationId, name, conta);
      } else {
        return new Promise((resolve) => resolve(item));
      }
    })
    .then((item) => resolve(item))
    .catch(e => reject(e));
  });
}

exports.criarSeNaoEcontrar = criarSeNaoEcontrar;
exports.inserirUsuario = inserirUsuario;
exports.buscaPorTelegramId = buscaPorTelegramId;