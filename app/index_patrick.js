var env = ''
if (process.env.NODE_ENV == 'production') {
    console.log('Bot Ativo Prod')
    env = process.env
} else {
    console.log('Bot Ativo Dev')
    env = require('../.envDev')
}

const organization = 100
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const axios = require('axios')
const session = require('telegraf/session')
const bot = new Telegraf(env.token)
// bot.use(Telegraf.log())

// var idCliente = ""
// var conta = ""
// var nome
// var possuiConta = false
// var erroInterno = false
// var valorAplicacao = 0
var dataAbertura

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
    Markup.callbackButton('Verifica', 'verifica')
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

const botoesResgate300 = Extra.markup(Markup.inlineKeyboard([
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


bot.start(async ctx => {
    console.log('=======>>>> Entrei no Start <<<<=======')
    // console.log(`Possui conta? ${possuiConta}`)
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'Cliente Já Possui Conta'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var idCliente = ctx.message.chat.id
    var nome = await ctx.update.message.from.first_name
    var conta = 0
    var erroInterno = false

    //Verifica se cliente já possui conta.
    //================================================//
    const res = await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(async function (response) {
            conta = response.data["0"].idSavingsAccount
            await ctx.replyWithMarkdown(`*Olá, ${nome}* \n Selecione uma das opções abaixo.`, tecladoOpcoes)

        })
        .catch(async function (error) {
            if (error.response.status == 404) {
                await ctx.replyWithMarkdown(`*Olá, ${nome}* \n Você ainda não possui uma Poupança.\nSelecione a opção Abrir Poupança`, tecladoOpcoes)
                resultado = 'Cliente sem Poupança'
            } else {
                console.log(error);
                resultado = 'error.response.status'
            }
            funcionalidade = 'verificaConta'
        });
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)
})

// ==================== HEARS =============================

bot.hears('Abrir Poupança', async ctx => {
    console.log('===>>> Entrei no Abrir Conta <<<===')
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    var conta = ''
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = await ctx.message.chat.id
    var erroInterno = false
    var possuiConta = false

    //Se ainda não foi verificado se possui conta, deve fazer.
    await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(function (response) {
            conta = response.data["0"].idSavingsAccount
            possuiConta = true
            resultado = 'Cliente já possui conta'
        })
        .catch(async function (error) {
            if (error.response.status == 404) {
                console.log(`Cliente sem Poupança`)
            } else {
                console.log(error);
                await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                erroInterno = true
            }
            funcionalidade = 'verificaConta'
            resultado = error.response.status
        });

    //Verifica se não ocorreu erro interno anteriormente
    if (!erroInterno) {
        //Se já possui conta, exibe o número 
        if (possuiConta) {
            await ctx.replyWithMarkdown(`*${nome}*, você já possui a conta nr. *${conta}* \n Selecione uma das opções abaixo.`, tecladoOpcoes)
        } else {
            console.log('iniciando abertura de conta')
            //Se não possui conta, realiza a abertura da conta
            const res = await axios.post(env.urlAbrePoupanca, {
                idPerson: `${idCliente}`,
                idOrganization: parseInt(`${organization}`)
            })
                .then(function (response) {
                    conta = response.data.idSavingsAccount
                    ctx.replyWithMarkdown(`*${nome}*, a sua conta foi aberta com o número *${conta}* \nSelecione uma das opções abaixo.`, tecladoOpcoes)
                    resultado = 'Conta aberta com sucesso'
                })
                .catch(async function (error) {
                    console.log(error);
                    await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                    erroInterno = true
                    resultado = error.response.status
                });
        }
    }

    // console.log('=====>>> Saindo do Abrir Conta <<<=====')
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)

})


bot.hears('Meu Saldo', async ctx => {
    console.log('=======>>>> Entrei no Saldo <<<<=======')
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = ctx.message.chat.id
    var possuiConta = false
    var erroInterno = false

    //Busca a Conta do cliente
    await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(function (response) {
            conta = response.data["0"].idSavingsAccount
            possuiConta = true
        })
        .catch(async function (error) {
            possuiConta = false
            if (error.response.status == 404) {
                console.log(`Cliente sem Poupança`)
                await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
                console.log('====>>> Saindo do Meu Saldo - Com Sucesso <<<===')
                erroInterno = true
            } else {
                console.log(error);
                await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                erroInterno = true
                console.log('====>>> Saindo do Meu Saldo - Com Erro <<<===')
            }
            funcionalidade = 'verificaConta'
            resultado = error.response.status
        });

    //Consulta o Saldo
    if (!erroInterno) {
        if (possuiConta) {
            await axios.get(`${env.urlConsultaSaldo}${conta}?idOrganization=${organization}`)
                .then(async function (response) {
                    await ctx.replyWithMarkdown(`*${nome}*, o saldo da sua conta é de *R$ ${response.data.value}* \nSelecione uma das opções abaixo.`, tecladoOpcoes)
                    // console.log(`Saldo: ${response.data.value}`)
                    resultado = `Saldo: ${response.data.value}`
                })
                .catch(async function (error) {
                    console.log(error);
                    await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                    erroInterno = true
                    resultado = error.response.status
                    funcionalidade = 'consultaSaldo'
                });
        } else {
            await ctx.replyWithMarkdown(`*${nome}*,\n Você ainda não possui uma Poupança\n Selecione a opção Abrir Poupança`, tecladoOpcoes)
        }
    }
    // console.log('=======>>>> Saindo do Saldo <<<<=======')
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)
})

bot.hears('Consultar Conta', async ctx => {
    //Variáveis exclusivas para o Log
    console.log('====>>> Entrei no verifica Conta <<<===')
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = ctx.message.chat.id
    var erroInterno = false
    var conta = ''
    // console.log('Busca conta =========================')

    await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(async function (response) {
            conta = response.data["0"].idSavingsAccount
            possuiConta = true
            await ctx.replyWithMarkdown(`*${nome}*,\n*Id Cliente:* ${idCliente}\n*Token Poupança:* ${conta}\nSelecione uma das opções abaixo.`, tecladoOpcoes)
        })
        .catch(async function (error) {
            if (error.response.status == 404) {
                // await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
                erroInterno = true
                resultado = 'Cliente sem Poupança'
                possuiConta = false
                await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
            } else {
                console.log(error);
                await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                erroInterno = true
                resultado = `SC-${error.response.status}`
            }
            funcionalidade = 'verificaConta'
        });
    // console.log('====>>> Saindo do verifica Conta <<<===')
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)
})

bot.hears('Aplicar', async ctx => {
    console.log('======>>>> Entrei no Aplicar <<<<======')
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = ctx.message.chat.id
    var possuiConta = false
    var valor = 100
    var conta = ''
    var erroInterno = false

    //Se ainda não foi verificado se possui conta, deve fazer.
    await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(function (response) {
            conta = response.data["0"].idSavingsAccount
            possuiConta = true
        })
        .catch(async function (error) {
            if (error.response.status == 404) {
                await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
                erroInterno = true
                resultado = `Cliente não possui Poupança - ${error.response.status}`
            } else {
                console.log(error);
                await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                erroInterno = true
                resultado = error.response.status
            }
            funcionalidade = 'verificaConta'
        });

    //Realiza a aplicação
    //valida erro interno anterior
    if (!erroInterno) {
        //realiza a aplicação
        if (possuiConta) {
            // try {
            await axios.post(`${env.urlAplica}`,
                {

                    // {
                    savingsAccount: {
                        idOrganization: parseInt(`${organization}`),
                        idSavingsAccount: `${conta}`
                    },
                    value: valor,
                    event: {
                        code: 250,
                        description: "Deposito TAA"
                    }
                    // }

                    // {
                    //     idSavingsAccount: `${conta}`,
                    //     idOrganization: parseInt(`${organization}`),
                    //     value: valor,
                    //     event: {
                    //         externalCode: 250,
                    //         description: "Deposito TAA"
                    //     }
                })
                .then(function (response) {
                    transaction = response.data.idTransaction
                    ctx.replyWithMarkdown(`*${nome}*, a sua aplicação de *R$ ${valor}* foi efetivada. \n*Transação:* ${transaction}`, tecladoOpcoes)
                    resultado = `${resultado} - Aplicado R$ ${valor}`
                })
                .catch(async function (error) {
                    console.log(error);
                    await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                    erroInterno = true
                    resultado = `Erro-${error.response.data.code} - ${error.response.data.technicalMessage}`
                });
        }
    }
    // console.log('======>>>> Saindo do Aplicar <<<<======')
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)
})

bot.hears('Transferir', async ctx => {
    console.log('======>>>> Entrei no Transferir <<<<======')
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = ctx.message.chat.id
    var possuiConta = false
    var conta = ''
    var erroInterno = false

})

// bot.hears('Aplicar New', async ctx => {
//     console.log('======>>>> Entrei no Aplicar <<<<======')
//     //Variáveis exclusivas para o Log
//     var funcionalidade = ctx.message.text
//     var transaction = '-'
//     var resultado = 'OK'
//     var sobrenome = await ctx.update.message.from.last_name
//     //Variáveis exclusivas para o Log
//     var possuiConta = false
//     var erroInterno = false
//     var nome = ctx.update.message.from.first_name
//     var idCliente =  ctx.message.chat.id
//     // console.log(`Cliente: ${idCliente}`)



//     await ctx.reply(`Qual valor deseja aplicar?`, botoesValores)

//     bot.action('1', async ctx => {
//         console.log('dentro do 1')
//         valorAplicacao = 1
//         var saldo = 0
//         var conta = ''
//         console.log(`Cliente: ${idCliente}`)

//         console.log('verifica')
//         await axios.get(`${env.urlVerificaCont}${idCliente}?idOrganization=${organization}`)
//             .then(function (response) {
//                 conta = response.data["0"].idSavingsAccount
//                 console.log(`Poupança: ${conta}`)
//                 possuiConta = true
//             })
//             .catch(async function (error) {
//                 // console.log(error.response.status)
//                 // console.log(error.message)
//                 possuiConta = false
//                 if (error.response.status == 404) {
//                     console.log(`Cliente sem Poupança`)
//                     await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
//                     erroInterno = true
//                 } else {
//                     console.log(error);
//                     await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                     erroInterno = true
//                 }
//            funcionalidade = 'verificaConta'
//             });


//         //valida erro interno anterior
//         if (!erroInterno) {
//             //realiza a aplicação
//             if (possuiConta) {
//                 // try {
//                 await axios.post(`${env.urlAplica}`, {
//                     idSavingsAccount: `${conta}`,
//                     idOrganization: parseInt(`${organization}`),
//                     value: parseInt(valorAplicacao),
//                     event: {
//                         externalCode: 250,
//                         description: "Deposito TAA"
//                     }
//                 })
//                     .then(function (response) {
//                         // console.log(response);
//                         // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                         // console.log(response.data.idTransaction)
//                         var transacao = response.data.idTransaction
//                         console.log(`Transação da Aplicação: ${transacao}`)
//                         // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                         ctx.replyWithMarkdown(`*${nome}*, a sua aplicação de *R$ ${valorAplicacao},00* foi efetivada. \n*Transação:* ${transacao}`, tecladoOpcoes)
//                         // ctx.replyWithMarkdown(`*${nome}*, a sua conta foi aberta com o número ${conta} \n Selecione uma das opções abaixo.`, tecladoOpcoes)
//                         console.log('======>>>> Saindo do Aplicar - Aplicação realizada com sucesso <<<<======')
//                     })
//                     .catch(async function (error) {
//                         console.log(error);
//                         await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                         erroInterno = true
//                     });
//                 // } catch (error) {
//                 //     console.log(error)
//                 // }
//                 possuiConta = false
//             } else {
//                 possuiConta = false
//                 ctx.replyWithMarkdown(`*${nome}*,\n Você ainda não possui uma Poupança\n Selecione a opção Abrir Poupança`, tecladoOpcoes)
//             }
//         }
//         ctx.reply(`Você confirma a aplicação no valor de R$ ${valorAplicacao}?`, confirmacao)
//     })

//     bot.action('5', ctx => {
//         // console.log('dentro do 5')
//         valorAplicacao = 5
//         var nome = ctx.update.message.from.first_name
//         var idCliente = ctx.update.message.id
//         var saldo = 0
//         console.log(`Cliente: ${idCliente}`)

//         console.log('verifica')
//         axios.get(`${env.urlVerificaCont}${idCliente}?idOrganization=${organization}`)
//             .then(function (response) {
//                 conta = response.data["0"].idSavingsAccount
//                 console.log(`Poupança: ${conta}`)
//                 possuiConta = true
//             })
//             .catch(async function (error) {
//                 // console.log(error.response.status)
//                 // console.log(error.message)
//                 possuiConta = false
//                 if (error.response.status == 404) {
//                     console.log(`Cliente sem Poupança`)
//                     await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
//                     erroInterno = true
//                 } else {
//                     console.log(error);
//                     await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                     erroInterno = true
//                 }
//            funcionalidade = 'verificaConta'
//             });


//         //valida erro interno anterior
//         if (!erroInterno) {
//             //realiza a aplicação
//             if (possuiConta) {
//                 // try {
//                 axios.post(`${env.urlAplica}`, {
//                     idSavingsAccount: `${conta}`,
//                     idOrganization: parseInt(`${organization}`),
//                     value: parseInt(valorAplicacao),
//                     event: {
//                         externalCode: 250,
//                         description: "Deposito TAA"
//                     }
//                 })
//                     .then(function (response) {
//                         // console.log(response);
//                         // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                         // console.log(response.data.idTransaction)
//                         var transacao = response.data.idTransaction
//                         console.log(`Transação da Aplicação: ${transacao}`)
//                         // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                         ctx.replyWithMarkdown(`*${nome}*, a sua aplicação de *R$ ${valorAplicacao},00* foi efetivada. \n*Transação:* ${transacao}`, tecladoOpcoes)
//                         // ctx.replyWithMarkdown(`*${nome}*, a sua conta foi aberta com o número ${conta} \n Selecione uma das opções abaixo.`, tecladoOpcoes)
//                         console.log('======>>>> Saindo do Aplicar - Aplicação realizada com sucesso <<<<======')
//                     })
//                     .catch(async function (error) {
//                         console.log(error);
//                         await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                         erroInterno = true
//                     });
//                 // } catch (error) {
//                 //     console.log(error)
//                 // }
//                 possuiConta = false
//             } else {
//                 possuiConta = false
//                 ctx.replyWithMarkdown(`*${nome}*,\n Você ainda não possui uma Poupança\n Selecione a opção Abrir Poupança`, tecladoOpcoes)
//             }
//         }
//         ctx.reply(`Você confirma a aplicação no valor de R$ ${valorAplicacao}?`, confirmacao)
//     })

//     bot.action('10', ctx => {
//         // console.log('dentro do 10')
//         valorAplicacao = 10
//         ctx.reply(`Você confirma a aplicação no valor de R$ ${valorAplicacao}?`, confirmacao)
//     })

//     bot.action('50', ctx => {
//         // console.log('dentro do 50')
//         valorAplicacao = 50
//         ctx.reply(`Você confirma a aplicação no valor de R$ ${valorAplicacao}?`, confirmacao)
//     })

//     bot.action('100', ctx => {
//         // console.log('dentro do 100')
//         valorAplicacao = 100
//         ctx.reply(`Você confirma a aplicação no valor de R$ ${valorAplicacao}?`, confirmacao)
//     })

//     bot.action('500', ctx => {
//         // console.log('dentro do 500')
//         valorAplicacao = 500
//         ctx.reply(`Você confirma a aplicação no valor de R$ ${valorAplicacao}?`, confirmacao)
//     })

//     bot.action('s', async ctx => {
//         var idCliente = ctx.update.message.id
//         // var idCliente =  ctx.message.chat.id
//         var nome = await ctx.update.message.from.first_name
//         var conta = ''
//         console.log(`Cliente: ${idCliente}`)

//         // console.log('dentro do confirmação s')
//         console.log(`Valor selecionado para aplicação: ${valorAplicacao}`)
//         //Busca a conta poupança do cliente
//         // console.log('verifica')
//         // const res = await axios.get(`${env.urlVerificaCont}${idCliente}?idOrganization=${organization}`)
//         //     .then(function (response) {
//         //         conta = response.data["0"].idSavingsAccount
//         //         console.log(`Poupança: ${conta}`)
//         //         possuiConta = true
//         //     })
//         //     .catch(async function (error) {
//         //         // console.log(error.response.status)
//         //         // console.log(error.message)
//         //         possuiConta = false
//         //         if (error.response.status == 404) {
//         //             console.log(`Cliente sem Poupança`)
//         //             await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
//         //             erroInterno = true
//         //         } else {
//         //             console.log(error);
//         //             await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//         //             erroInterno = true
//         //         }
//            funcionalidade = 'verificaConta'
//         //     });


//         // //valida erro interno anterior
//         // if (!erroInterno) {
//         //     //realiza a aplicação
//         //     if (possuiConta) {
//         //         // try {
//         //         const res = await axios.post(`${env.urlAplica}`, {
//         //             idSavingsAccount: `${conta}`,
//         //             idOrganization: parseInt(`${organization}`),
//         //             value: parseInt(valorAplicacao),
//         //             event: {
//         //                 externalCode: 250,
//         //                 description: "Deposito TAA"
//         //             }
//         //         })
//         //             .then(function (response) {
//         //                 // console.log(response);
//         //                 // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//         //                 // console.log(response.data.idTransaction)
//         //                 var transacao = response.data.idTransaction
//         //                 console.log(`Transação da Aplicação: ${transacao}`)
//         //                 // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//         //                 ctx.replyWithMarkdown(`*${nome}*, a sua aplicação de *R$ ${valorAplicacao},00* foi efetivada. \n*Transação:* ${transacao}`, tecladoOpcoes)
//         //                 // ctx.replyWithMarkdown(`*${nome}*, a sua conta foi aberta com o número ${conta} \n Selecione uma das opções abaixo.`, tecladoOpcoes)
//         //                 console.log('======>>>> Saindo do Aplicar - Aplicação realizada com sucesso <<<<======')
//         //             })
//         //             .catch(async function (error) {
//         //                 console.log(error);
//         //                 await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//         //                 erroInterno = true
//         //             });
//         //         // } catch (error) {
//         //         //     console.log(error)
//         //         // }
//         //         possuiConta = false
//         //     } else {
//         //         possuiConta = false
//         //         await ctx.replyWithMarkdown(`*${nome}*,\n Você ainda não possui uma Poupança\n Selecione a opção Abrir Poupança`, tecladoOpcoes)
//         //     }
//         // }
//         possuiConta = false
//         erroInterno = false
//         nome = ""
//     })
//     bot.action('n', ctx => {
//         // console.log('dentro do confirmação n')
//         ctx.reply(`Aplicação cancelada. Selecione uma das opções abaixo.`, tecladoOpcoes)
//         console.log('======>>>> Saindo do Aplicar - Cliente Cancelou aplicação <<<<======')

//     })

//     // console.log('depois da chamada ao wizardAplica')
// })

bot.hears('Resgate Parcial', async ctx => {
    console.log('===>>> Entrei no Resgate Parcial <<<===')
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = ctx.message.chat.id
    var conta = ''
    var possuiConta = false
    var valor = 50
    var erroInterno = false

    //Verifica se possui conta
    await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(function (response) {
            conta = response.data["0"].idSavingsAccount
            possuiConta = true
        })
        .catch(async function (error) {
            if (error.response.status == 404) {
                console.log(`Cliente sem Poupança`)
                await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
                erroInterno = true
                resultado = 'Cliente não possui Poupança'
            } else {
                console.log(error);
                await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                erroInterno = true
                resultado = `Erro-${error.response.data.code} - ${error.response.data.technicalMessage}`
                // resultado = error.response.status
            }
            funcionalidade = 'verificaConta'
        });


    //=============== Busca saldo ======================//
    if (!erroInterno) {
        if (possuiConta) {
            await axios.get(`${env.urlConsultaSaldo}${conta}?idOrganization=${organization}`)
                .then(async function (response) {
                    saldo = response.data.value
                    resultado = `${resultado} - Saldo: R$ ${saldo}`
                })
                .catch(async function (error) {
                    console.log(error);
                    await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                    erroInterno = true
                    resultado = error.response.status
                    funcionalidade = 'consultaSaldo'
                });
        }
    }

    //Realiza o Resgate
    //valida erro interno anterior
    if (!erroInterno) {
        //se saldo recuperado anteriormente for maior que 0
        if (saldo > 49) {
            if (possuiConta) {
                var dataReq = {
                    savingsAccount: {
                        idOrganization: parseInt(`${organization}`),
                        idSavingsAccount: `${conta}`,
                    },
                    value: parseInt(valor),
                    event: {
                        code: 150,
                        description: "Saque BOT",
                    }
                };

                const res = await axios.post(`${env.urlResgateParcial}`, dataReq)
                    .then(function (response) {
                        transaction = response.data.idTransaction
                        ctx.replyWithMarkdown(`*${nome}*, o seu resgate de *R$ 50,00* foi efetivado. \n*Transação:* ${transaction}`, tecladoOpcoes)
                        resultado = `${resultado} - Resgatado: R$ ${valor}`
                    })
                    .catch(async function (error) {
                        console.log(error);
                        await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                        erroInterno = true
                        resultado = `Erro-${error.response.data.code} - ${error.response.data.technicalMessage}`
                        // resultado = error.response.status
                    });
            }
        } else {
            ctx.replyWithMarkdown(`*${nome}*, o seu saldo atual é de *R$ ${saldo}* e não permite resgate parcial.\n`, tecladoOpcoes)
            resultado = `${resultado} - Cliente com saldo inferior ao permitido`
        }
    }
    // console.log('===>>> Saindo do Resgate Parcial <<<===')
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)
})

bot.hears('Resgate Total', async ctx => {
    console.log('====>>> Entrei no Resgate Total <<<====')
    //Variáveis exclusivas para o Log
    var funcionalidade = ctx.message.text
    var transaction = '-'
    var resultado = 'OK'
    var sobrenome = await ctx.update.message.from.last_name
    //Variáveis exclusivas para o Log
    var nome = await ctx.update.message.from.first_name
    var idCliente = ctx.message.chat.id
    var erroInterno = false
    var C = ''
    var possuiConta = false
    var saldo = 0

    //Verifica se possui conta
    await axios.get(`${env.urlVerificaConta}${idCliente}?idOrganization=${organization}`)
        .then(function (response) {
            conta = response.data["0"].idSavingsAccount
            possuiConta = true
        })
        .catch(async function (error) {
            if (error.response.status == 404) {
                console.log(`Cliente sem Poupança`)
                await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
                erroInterno = true
                resultado = 'Cliente não possui Poupança'
            } else {
                console.log(error);
                await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                erroInterno = true
                resultado = error.response.status
            }
            funcionalidade = 'verificaConta'
        });

    //=============== Busca saldo ======================//
    if (!erroInterno) {
        if (possuiConta) {
            await axios.get(`${env.urlConsultaSaldo}${conta}?idOrganization=${organization}`)
                .then(async function (response) {
                    saldo = response.data.value
                    await ctx.replyWithMarkdown(`*${nome}*, o saldo da sua conta é de *R$ ${response.data.value}*.`)
                    resultado = `${resultado} - Saldo: R$ ${saldo}`
                })
                .catch(async function (error) {
                    console.log(error);
                    await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                    erroInterno = true
                    resultado = error.response.status
                    funcionalidade = 'consultaSaldo'
                });
        }
    }
    //Realiza o resgate total
    //valida erro interno anterior
    if (!erroInterno) {
        if (possuiConta) {
            if (saldo > 0) {
                var dataReq = {
                    savingsAccount: {
                        idOrganization: parseInt(`${organization}`),
                        idSavingsAccount: `${conta}`,
                    },
                    event: {
                        code: 150,
                        description: "Saque Total BOT",
                    }
                };

                await axios.post(`${env.urlResgateTotal}`, dataReq)
                    .then(function (response) {
                        transaction = response.data.idTransaction
                        ctx.replyWithMarkdown(`*${nome}*, o resgate total no valor de *R$ ${saldo}* foi efetivado. \n*Transação:* ${transaction}`, tecladoOpcoes)
                        resultado = `${resultado} - Resgatado: R$ ${saldo}`
                    })
                    .catch(async function (error) {
                        console.log(error);
                        await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
                        erroInterno = true
                        resultado = error.response.status
                    });
            } else {
                await ctx.replyWithMarkdown(`*${nome}*, o seu saldo não permite resgate.`, tecladoOpcoes)
                resultado = `${resultado} - Não resgatado. Cliente com saldo R$ ${saldo}`
            }
        }
    }
    // console.log('====>>> Saindo do Resgate Total <<<====')
    console.log(`LOG###MsgId:${ctx.message.message_id};Username:${ctx.message.from.username};IdTelegram:${idCliente};${nome} ${sobrenome};Poupanca:${conta};Funcionalidade:${funcionalidade};Resultado:${resultado};Transaction:${transaction}`)
})

// function funcaoAplica(valor, ctx) {
//     console.log('====>>> Entrei na função Consulta Saldo <<<===')
//     var nome = ctx.update.message.from.first_name
//     var idCliente = ctx.update.message.id
//     var saldo = 0
//     console.log(`Cliente: ${idCliente}`)

//     console.log('verifica')
//     axios.get(`${env.urlVerificaCont}${idCliente}?idOrganization=${organization}`)
//         .then(function (response) {
//             conta = response.data["0"].idSavingsAccount
//             console.log(`Poupança: ${conta}`)
//             possuiConta = true
//         })
//         .catch(async function (error) {
//             // console.log(error.response.status)
//             // console.log(error.message)
//             possuiConta = false
//             if (error.response.status == 404) {
//                 console.log(`Cliente sem Poupança`)
//                 await ctx.replyWithMarkdown(`*${nome}*, você ainda não possui uma Poupança, favor selecionar a opção "Abrir Poupança" nas opções abaixo.`, tecladoOpcoes)
//                 erroInterno = true
//             } else {
//                 console.log(error);
//                 await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                 erroInterno = true
//             }
//             funcionalidade = 'verificaConta'
//         });


//     //valida erro interno anterior
//     if (!erroInterno) {
//         //realiza a aplicação
//         if (possuiConta) {
//             // try {
//             axios.post(`${env.urlAplica}`, {
//                 idSavingsAccount: `${conta}`,
//                 idOrganization: parseInt(`${organization}`),
//                 value: parseInt(valorAplicacao),
//                 event: {
//                     externalCode: 250,
//                     description: "Deposito TAA"
//                 }
//             })
//                 .then(function (response) {
//                     // console.log(response);
//                     // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                     // console.log(response.data.idTransaction)
//                     transaction = response.data.idTransaction
//                     console.log(`Transação da Aplicação: ${transaction}`)
//                     // console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                     ctx.replyWithMarkdown(`*${nome}*, a sua aplicação de *R$ ${valorAplicacao},00* foi efetivada. \n*Transação:* ${transaction}`, tecladoOpcoes)
//                     // ctx.replyWithMarkdown(`*${nome}*, a sua conta foi aberta com o número ${conta} \n Selecione uma das opções abaixo.`, tecladoOpcoes)
//                     console.log('======>>>> Saindo do Aplicar - Aplicação realizada com sucesso <<<<======')
//                 })
//                 .catch(async function (error) {
//                     console.log(error);
//                     await ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                     erroInterno = true
//                 });
//             // } catch (error) {
//             //     console.log(error)
//             // }
//             possuiConta = false
//         } else {
//             possuiConta = false
//             ctx.replyWithMarkdown(`*${nome}*,\n Você ainda não possui uma Poupança\n Selecione a opção Abrir Poupança`, tecladoOpcoes)
//         }
//     }



// return new Promise((s, r) => {
//     funcaoConsultaConta(ctx).then(conta => {
//         // possuiConta = conta
//         await axios.get(`${env.urlConsultaSaldo}${conta}?idOrganization=${organization}`)
//             .then(function (response) {
//                 saldo = response.data.balance
//                 console.log(`Saldo: ${saldo}`)
//                 s(saldo)
//                 console.log('====>>> Saindo da Função de Consulta Saldo com sucesso <<<===')

//             })
//             .catch(function (error) {
//                 console.log(error);
//                 ctx.replyWithMarkdown(`*${nome}*, estamos com problema na execução da funcionalidade solicitada.`, tecladoOpcoes)
//                 r(error)
//                 console.log('====>>> Saindo da Função de Consulta Saldo com erro <<<===')
//funcionalidade = 'consultaSaldo'
//             });
//     })
// })
// }

// function verificaConta(idCliente) {
//     // idCliente =  ctx.message.chat.id
//     const res = axios.get(`${env.urlVerificaCont}${idCliente}?idOrganization=${organization}`)
//         .then(function (response) {
//             conta = response.data.idSavingsAccount
//         })
//         .catch(function (error) {
//             console.log(error);
//funcionalidade = 'verificaConta'
//         });
//     if (conta != "") {
//         possuiConta = conta
//     } else {
//         possuiConta = false
//     }
// }

// function buscaConta(id) {
//     console.log(`Entrei no busca conta com o id: ${id} `)
//     const res = axios.get(`${env.urlVerificaCont}${id}?idOrganization=${organization}`)
//         .then(function (response) {
//             console.log(response);
//             console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//             console.log(response.data.idSavingsAccount)
//             console.log(res.data.idSavingsAccount)
//             console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//             return response.data.idSavingsAccount
//         })
//         .catch(function (error) {
//             console.log(error);
//funcionalidade = 'verificaConta'
//         });
// }

// var BuscaContaMethod = {
//     buscaContaFunction: function (id) {
//         console.log(`Entrei no método busca conta com o id: ${id} `)
//         const res = axios.get(`${env.urlVerificaCont}${id}?idOrganization=${organization}`)
//             .then(function (response) {
//                 console.log(response);
//                 console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                 console.log(response.data.idSavingsAccount)
//                 console.log("<<<<<<<<<<============================>>>>>>>>>>>>>>>>")
//                 return response.data.idSavingsAccount
//             })
//             .catch(function (error) {
//                 console.log(error);
//funcionalidade = 'verificaConta'
//             });
//     }
// }

bot.startPolling()