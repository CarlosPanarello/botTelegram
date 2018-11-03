
var dao = require('./dao');
var CPF = require('./cpf');

var env = ''
if (process.env.NODE_ENV === 'production') {
    console.log('Bot Ativo')
    env = process.env
} else {
    env = require('../.envDev')
}

var key = function (obj) {
  return obj.totallyUniqueEmployeeIdKey; // just an example
};

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')
const axios = require('axios')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { enter, leave } = Stage

const bot = new Telegraf(env.token)

const organization = 100

const tecladoOpcoes = Markup.keyboard([
    ['Abrir Poupança', 'Meu Saldo'],
    ['Aplicar', 'Resgate Parcial'],
    ['Resgate Total', 'Consultar Conta']
]).resize().extra()

const botoes = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Abrir Poupança', 'postSavingsAccount'),
    Markup.callbackButton('Meu Saldo', 'getBalance'),
    Markup.callbackButton('Aplicar', 'postDeposit'),
    Markup.callbackButton('Resgate Parcial', 'postPartialWithddraw'),
    Markup.callbackButton('Resgate Total', 'postFullWithddraw'),
    Markup.callbackButton('Verifica', 'verifica'),
], { columns: 2 }))

const botoesValores = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('R$ 1,00', '1'),
    Markup.callbackButton('R$ 5,00', '5'),
    Markup.callbackButton('R$ 10,00', '10'),
    Markup.callbackButton('R$ 50,00', '50'),
    Markup.callbackButton('R$ 100,00', '100'),
    Markup.callbackButton('R$ 500,00', '500')
], { columns: 2 }))

const botoesResgate25 = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('R$ 5,00', '5'),
    Markup.callbackButton('R$ 10,00', '10'),
    Markup.callbackButton('R$ 15,00', '15'),
    Markup.callbackButton('R$ 25,00', '25')
], { columns: 2 }))

const botoesResgate50 = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('R$ 5,00', '5'),
    Markup.callbackButton('R$ 10,00', '10'),
    Markup.callbackButton('R$ 25,00', '25'),
    Markup.callbackButton('R$ 50,00', '50')
], { columns: 2 }))

const botoesResgate100 = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('R$ 10,00', '10'),
    Markup.callbackButton('R$ 50,00', '50'),
    Markup.callbackButton('R$ 75,00', '75'),
    Markup.callbackButton('R$ 100,00', '100')
], { columns: 2 }))

const botoesResgate250 = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('R$ 50,00', '50'),
    Markup.callbackButton('R$ 100,00', '100'),
    Markup.callbackButton('R$ 150,00', '150'),
    Markup.callbackButton('R$ 250,00', '250')
], { columns: 2 }))

const botoesResgate500 = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('R$ 50,00', '50'),
    Markup.callbackButton('R$ 150,00', '150'),
    Markup.callbackButton('R$ 300,00', '300'),
    Markup.callbackButton('R$ 450,00', '450')
], { columns: 2 }))

const confirmacao = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Sim', 's'),
    Markup.callbackButton('Não', 'n')
], { columns: 2 }))

const confirmacaoResgateParcial = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Sim', 's1'),
    Markup.callbackButton('Não', 'n1')
], { columns: 2 }))

/*=============================================================*/
/*===========================FUNCOES===========================*/
/*=============================================================*/

function criarPathConsultaSaldo(idConta) {
  return env.urlConsultaSaldo + idConta + "?idOrganization=" + organization;
}

function criarPathConsultaConta(idCliente) {
  return env.urlVerificaConta + idCliente + "?idOrganization=" + organization;
}

function mensagemErro(ctx, error) {
  ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
  console.log("Mensagem de Erro --> " + error.message);
}

buscarContaPorClienteId = (idCliente) => {
  return new Promise((sucess, reject) => {
    axios.get(criarPathConsultaConta(idCliente))
      .then((resp) => {
        sucess(resp.data["0"].idSavingsAccount);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404){
          sucess("");
        } else {
          reject(error);
        }
      })
  });
}

retornaSaldo = (idCliente) => {
  return new Promise((sucess, reject) => {
    buscarContaPorClienteId(idCliente)
      .then((conta) => axios.get(criarPathConsultaSaldo(conta)))
      .then((resp) => sucess(resp.data.value))
      .catch((error) => reject(error));
  });
}

retornaSaldoPorConta = (conta) => {
  return new Promise((sucess, reject) => {
      axios.get(criarPathConsultaSaldo(conta))
      .then((resp) => sucess(resp.data.value))
      .catch((error) => reject(error));
  });
}

realizaDeposito = (conta, value, code, msg) => {
  return new Promise((sucess, reject) => {
    try {
      const dados = {
        idSavingsAccount: conta,
        idOrganization: parseInt(organization),
        value: parseInt(value),
        event: {
          externalCode: code,
          description: msg
        }
      }
      axios.post(env.urlAplica, dados)
        .then((resp) => sucess(resp.data.idTransaction))
        .catch(e => reject(e));
    } catch (e) {
      reject(e);
    }
  });
}

realizarResgateParcial = (conta, value, code, msg) => {
  return new Promise((sucess, reject) => {
    try {
      const dados = {
        idSavingsAccount: conta,
        idOrganization: parseInt(organization),
        value: parseInt(value),
        event: {
          externalCode: code,
          description: msg
        }
      }
      axios.post(env.urlResgateParcial, dados)
        .then((resp) => sucess(resp.data.idTransaction))
        .catch(e => reject(e));
    } catch (e) {
      reject(e);
    }
  });
};

realizarRegateTotal = (conta, code, msg)=>{
  return new Promise((sucess, reject) => {
    try {
      const dados = {
        idSavingsAccount: conta,
        idOrganization: parseInt(organization),
        event: {
          externalCode: code,
          description: msg
        }
      }
      axios.post(env.urlResgateTotal, dados)
        .then((resp) => sucess(resp.data.idTransaction))
        .catch(e => reject(e));
    } catch (e) {
      reject(e);
    }
  });
}

criarConta = (idCliente) => {
  return new Promise((sucess, reject) => {
    try {
      const dados = {
        idPerson: idCliente,
        idOrganization: parseInt(organization)
      };
      console.log("Criar Conta", dados);
      console.log("Criar Conta", env.urlAbrePoupanca);
      axios.post(env.urlAbrePoupanca, dados)
        .then((resp) => {
          console.log("Criado-->", JSON.stringify(resp.data));
          sucess(resp.data.idSavingsAccount)
        })
        .catch((error) => reject(error));
    } catch (error) {
      reject(error)
    }
  });
}

inicializarSessao = (ctx) => {
  if (!ctx.session.usuario) { 
    ctx.session.usuario = {
      cpf: "",
      conta: "",
      organizationId: organization,
      telegramId: ctx.message.chat.id,
      name: ctx.update.message.from.first_name,
    };
  }
}

/*=============================================================*/
/*========================CPF=SCENES===========================*/
/*=============================================================*/

const cpfScene = new Scene('cpfScene')
cpfScene.enter((ctx) => ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, informe seu CPF.`))
cpfScene.leave();
cpfScene.on('text', (ctx) => {
  console.log("Sessao , -->", JSON.stringify(ctx.session.usuario));
  var cpfCliente = ctx.message.text;

  // se a pessoa digitar sair o cancelar ele desiste de perguntar sobre o cpf
  if(cpfCliente.toLowerCase().includes("sair") || cpfCliente.toLowerCase().includes("cancel")) {
    ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, sem o cpf não é possível acessar sua conta.\nTente algumas opções abaixo.`, tecladoOpcoes)
    ctx.scene.leave('cpfScene');
    return;
  }

  if (CPF.validate(cpfCliente)) {
    console.log("CPF Valido");
    
    // Primeiro busca a conta por ClienteID
    // Depois verifica se a conta existe nao existir cria, senao retornar a conta para o proximo passo
    // Associa o ID do telegram com o clienteId da conta (cpf)
    // atribui o user na sessao com os dados do cpf e da conta
    // Qualqueer erro gerado retorna a mensagem de associacao
    buscarContaPorClienteId(cpfCliente)
    .then(conta => {
      console.log("DADOS DA CONTA-->", conta);
      if (conta === "") 
        return criarConta(cpfCliente);
      else
        return conta;
    })
    .then(account => dao.criarSeNaoEcontrar(ctx.session.usuario.telegramId, cpfCliente, ctx.session.usuario.organizationId, ctx.session.usuario.name, account))
    .then(user => { 
      console.log(`Conta Poupança aberta: ${user.conta} e associada ao cpf ${user.cpf}`);
      ctx.session.usuario.cpf = user.cpf;
      ctx.session.usuario.conta = user.conta;
      ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, a sua conta foi aberta com o número *${ctx.session.usuario.conta}* \nSelecione uma das opções abaixo.`, tecladoOpcoes);
      ctx.scene.leave('cpfScene');
    })
    .catch((e) => {
      console.log("Erro ao Abrir Poupanca -->", JSON.stringify(e.message));
      ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, erro ao associar seu cpf a sua conta.`)
      ctx.scene.leave('cpfScene');
    });
  } else {
    ctx.replyWithMarkdown('CPF Invalido, tente novamente ou digite sair para cancelar.');
  }
});
cpfScene.on('message', (ctx) => ctx.reply('Informe apenas os numeros do seu cpf'));

/*=============================================================*/
/*======================APLICACAO=SCENES=======================*/
/*=============================================================*/

const aplicacaoScene = new Scene('aplicacaoScene')
aplicacaoScene.enter((ctx) => ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, selecione um dos valores abaixo.`, botoesValores))
aplicacaoScene.leave();
aplicacaoScene.action('1', ctx => {
  ctx.session.valorDeposito = 1;
  ctx.reply(`Você confirma a aplicação no valor de R$ ${ctx.session.valorDeposito}?`, confirmacao);
});
aplicacaoScene.action('5', ctx => {
  ctx.session.valorDeposito = 5;
  ctx.reply(`Você confirma a aplicação no valor de R$ ${ctx.session.valorDeposito}?`, confirmacao);
});
aplicacaoScene.action('10', ctx => {
  ctx.session.valorDeposito = 10;
  ctx.reply(`Você confirma a aplicação no valor de R$ ${ctx.session.valorDeposito}?`, confirmacao);
})
aplicacaoScene.action('50', ctx => {
  ctx.session.valorDeposito = 50;
  ctx.reply(`Você confirma a aplicação no valor de R$ ${ctx.session.valorDeposito}?`, confirmacao);
})
aplicacaoScene.action('100', ctx => {
  ctx.session.valorDeposito = 100;
  ctx.reply(`Você confirma a aplicação no valor de R$ ${ctx.session.valorDeposito}?`, confirmacao);
})
aplicacaoScene.action('500', ctx => {
  ctx.session.valorDeposito = 500;
  ctx.reply(`Você confirma a aplicação no valor de R$ ${ctx.session.valorDeposito}?`, confirmacao);
})

aplicacaoScene.action('n', ctx => {
  ctx.reply(`Selecione um valor para depositar ou digite sair para cancelar`, botoesValores);
});

aplicacaoScene.action('s', ctx => {
  if(!ctx.session.valorDeposito){
    ctx.reply(`Selecione um valor para depositar ou digite sair para cancelar`, botoesValores);
  } else {
    realizaDeposito(ctx.session.usuario.conta, ctx.session.valorDeposito, 250, "Deposito BotTelegram")
    .then((transacao) => {
      console.log(`Transação da Aplicação: ${transacao}`)
      ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, a sua aplicação de *R$ ${ctx.session.valorDeposito},00* foi efetivada. \n*Transação:* ${transacao}`, tecladoOpcoes)
      console.log('===>>> Saindo da Aplicação - Com sucesso <<<===')
      ctx.scene.leave('aplicacaoScene');
    })
    .catch(error => {
      mensagemErro(ctx, error);
      ctx.scene.leave('aplicacaoScene');
    });
  }
});

aplicacaoScene.on('text', (ctx) => {
  var cmd = ctx.message.text;
  if(cmd.toLowerCase().includes("sair") || cmd.toLowerCase().includes("cancel")) {
    ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, Que pena que voce desistiu de investir, deseja fazer outra ação`, tecladoOpcoes)
    ctx.scene.leave('aplicacaoScene');
    return;
  }
});
/*=============================================================*/
/*============================STAGES===========================*/
/*=============================================================*/
const stage = new Stage()
stage.register(cpfScene)
stage.register(aplicacaoScene)
bot.use(session());
bot.use(stage.middleware())
/*=============================================================*/
/*=====================INICIANDO-BOT===========================*/
/*=============================================================*/
// Register logger middleware
bot.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('Inicializou me apenas --> %sms', ms)
  })
})

bot.start(ctx => {
  console.log('=======>>>> Entrei no Start <<<<=======')
  inicializarSessao(ctx);
  ctx.replyWithMarkdown(`*Olá, ${ctx.session.usuario.name}* \n Selecione uma das opções abaixo.`, tecladoOpcoes)
})
/*=============================================================*/
/*======================HEARS-ABRIR============================*/
/*=============================================================*/
bot.hears("Abrir Poupança", ctx => {
  inicializarSessao(ctx);
  // Verifica se ja possui conta aqui no Bot
  // se possuir ele ja mostra os dados
  // se nao ele vai para a scene de perguntar sobre o cpf
  dao.buscaPorTelegramId(ctx.session.usuario.telegramId)
  .then((item) => {
    console.log("ITEM--> ", item);
    if (item && item != null){
      ctx.session.usuario = item;
    } else {
      ctx.scene.enter('cpfScene');
    }
  })
  .catch(e => mensagemErro(ctx, e));
});
/*=============================================================*/
/*======================HEARS-SALDO============================*/
/*=============================================================*/
bot.hears('Meu Saldo', ctx => {
  inicializarSessao(ctx);
  // Verifica se ja possui conta aqui no Bot
  // se possuir ele ja mostra o saldo
  // senao vai pedir para abrir uma conta
  dao.buscaPorTelegramId(ctx.session.usuario.telegramId)
  .then((user) => {
    if (user && user != null){
      ctx.session.usuario = user;
      retornaSaldo(user.cpf)
      .then(saldo => {
        console.log(`Saldo recebido: ${saldo}`);
        ctx.replyWithMarkdown(`*${user.name}*, o saldo da sua conta é de *R$ ${saldo}* \nSelecione uma das opções abaixo.`, tecladoOpcoes);
      })
      .catch(error => {
        mensagemErro(ctx, nome, error);
      });
    } else {
      ctx.replyWithMarkdown(`*${ctx.session.usuario.name}* \n, você não possui uma conta ainda.\nSelecione uma das opções abaixo.`, tecladoOpcoes)
    }
  })
  .catch(e => mensagemErro(ctx, e));
});
/*=============================================================*/
/*======================HEARS-CONSULTA=========================*/
/*=============================================================*/
bot.hears('Consultar Conta', ctx => {
  ctx.replyWithMarkdown(`Funcao Meu Saldo implementada`, tecladoOpcoes)
});
/*=============================================================*/
/*======================HEARS-APLICAR==========================*/
/*=============================================================*/
bot.hears('Aplicar', ctx => {
  console.log('======>>>> Entrei no Aplicar <<<<======')
  inicializarSessao(ctx);

  console.log("Cliente Sessao:", JSON.stringify(ctx.session.usuario));
  dao.buscaPorTelegramId(ctx.session.usuario.telegramId)
  .then((contaNoBot) => {
    if(contaNoBot){
      ctx.scene.enter('aplicacaoScene');
    } else {
      ctx.replyWithMarkdown(`*${ctx.session.usuario.name}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
    }
  })
  .catch(e => mensagemErro(ctx, e));
});
/*=============================================================*/
/*==================HEARS-RESGATE-PARCIAL======================*/
/*=============================================================*/
bot.hears('Resgate Parcial', ctx => {
  ctx.replyWithMarkdown(`Funcao Resgate Parcial implementada`, tecladoOpcoes)
});
/*=============================================================*/
/*==================HEARS-RESGATE-TOTAL========================*/
/*=============================================================*/
bot.hears('Resgate Total', ctx => {
  ctx.replyWithMarkdown(`Funcao Resgate Total implementada`, tecladoOpcoes)
});

/*

bot.hears('Consultar Conta', ctx => {
    console.log('=======>>>> Entrei na Consulta Conta <<<<=======')
    var idCliente = ctx.message.chat.id
    var nome = ctx.update.message.from.first_name

    buscarContaPorClienteId(idCliente)
    .then((conta)=>{
      if(conta){
        ctx.replyWithMarkdown(`*${nome}*,\n*Id Cliente:* ${idCliente}\n*Token Poupança:* ${conta}\nSelecione uma das opções abaixo.`, tecladoOpcoes)
        console.log('===>>> Saindo da Consulta Conta - Com sucesso <<<===')
      } else {
        ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
        console.log('===>>> Saindo da Consulta Conta - Cliente sem Conta Poupança <<<===')
      }
    })
    .catch(error => {
      mensagemErro(ctx, nome, error);
    });
})
bot.hears('Resgate Parcial', ctx => {
  console.log('===>>> Entrei no Resgate Parcial <<<===')
  var nome = ctx.update.message.from.first_name
  var idCliente = ctx.message.chat.id
  var valorResgate = 0
  var saldoPoupanca = 0
  console.log(`Cliente: ${idCliente}`)

  buscarContaPorClienteId(idCliente)
  .then((conta) => {
    if (conta) {
      console.log('antes de chamar consulta saldo')
      retornaSaldoPorConta(conta)
      .then((saldo) => {
        const valorSaldo = saldo ? parseInt(saldo) : 0;
        console.log("Valor do Saldo Tranformado-->", valorSaldo)

        switch (true) {
          case valorSaldo > 500:
            ctx.reply(`Qual valor deseja resgatar?`, botoesResgate500)
            break;
          case valorSaldo > 250:
            ctx.reply(`Qual valor deseja resgatar?`, botoesResgate250)
            break;
          case valorSaldo > 100:
            ctx.reply(`Qual valor deseja resgatar?`, botoesResgate100)
            break;
          case valorSaldo > 50:
            ctx.reply(`Qual valor deseja resgatar?`, botoesResgate50)
            break;
          case valorSaldo > 25:
            ctx.reply(`Qual valor deseja resgatar?`, botoesResgate25)
            break;
          default:
            ctx.replyWithMarkdown(`*${nome}*, o seu saldo atual é de *R$ ${saldo}* e não permite resgate parcial.\n`, tecladoOpcoes)
        }

        bot.action('5', ctx => {
            // console.log('dentro do 5')
            valorResgate = 5
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('10', ctx => {
            // console.log('dentro do 10')
            valorResgate = 10
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('15', ctx => {
            // console.log('dentro do 1')
            valorResgate = 15
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('25', ctx => {
            // console.log('dentro do 10')
            valorResgate = 25
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('50', ctx => {
            // console.log('dentro do 50')
            valorResgate = 50
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('75', ctx => {
            // console.log('dentro do 10')
            valorResgate = 75
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('100', ctx => {
            valorResgate = 100
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('150', ctx => {
            valorResgate = 150
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('250', ctx => {
            valorResgate = 250
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('300', ctx => {
            valorResgate = 300
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('450', ctx => {
            valorResgate = 450
            ctx.reply(`Você confirma o resgate no valor de R$ ${valorResgate}?`, confirmacaoResgateParcial)
        })

        bot.action('s1', ctx => {
          if (saldo > 0) {
            realizarResgateParcial(conta, valorResgate, 250, "Saque BotTelegram")
              .then(transacao => {
                console.log(`Transação do Resgate Parcial: ${transacao}`)
                ctx.replyWithMarkdown(`*${nome}*, o seu resgate de *R$ ${valorResgate},00* foi efetivado. \n*Transação:* ${transacao}`, tecladoOpcoes)
                console.log('===>>> Saindo do Resgate Parcial - Com sucesso <<<===')
              })
              .catch(error => {
                mensagemErro(ctx, nome, error);
              });
          }
        })

        bot.action('n1', ctx => {
          ctx.reply(`Resgate cancelado. Selecione uma das opções abaixo.`, tecladoOpcoes)
          console.log('===>>> Saindo do Resgate Parcial - Cliente cancelou <<<===')
        })

      })
      .catch(error => {
        mensagemErro(ctx, nome, error);
      });
    } else {
      ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
      console.log('===>>> Saindo do Resgate Parcial - Cliente sem Conta Poupança <<<===')
    }
  })
  .catch(error => {
    mensagemErro(ctx, nome, error);
  });
})

bot.hears('Resgate Total', ctx => {
  console.log('====>>> Entrei no Resgate Total <<<====')
  var nome = ctx.update.message.from.first_name
  var idCliente = ctx.message.chat.id
  console.log(`Cliente: ${idCliente}`)

  buscarContaPorClienteId(idCliente)
    .then((conta) => {
      if (conta) {
        retornaSaldoPorConta(conta)
          .then((saldo) => {
            ctx.replyWithMarkdown(`*${nome}*, o saldo da sua conta é de *R$ ${saldo}*.`)
            realizarRegateTotal(conta, 250, "Saque TAA")
              .then((transacao) => {
                console.log(`Transação do Resgate Total: ${transacao}`)
                ctx.replyWithMarkdown(`*${nome}*, o resgate total no valor de *R$ ${saldo}* foi efetivado. \n*Transação:* ${transacao}`, tecladoOpcoes)
                console.log('===>>> Saindo do Resgate Total - Com sucesso <<<===')
              })
              .catch(error => {
                mensagemErro(ctx, nome, error);
              });
          })
          .catch(error => {
            mensagemErro(ctx, nome, error);
          });
      } else {
        ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
        console.log('===>>> Saindo do Resgate Total - Cliente sem Conta Poupança <<<===')
      }
    })
    .catch(error => {
      mensagemErro(ctx, nome, error);
    });
})
*/
bot.startPolling()
