# BOT POUPANCA - Version 1.0.0
Bot do telegram que utiliza o telegraf para realizar acoes na api de poupanca.

# Dependencias
  * Poupanca API
  * Mongo DB
      * Caso possua um banco incluir as seguintes variaveis de ambiente
      * mongo_pwd - senha do usuario admin do mongo
      * mongo_user - usuario admin do mongo
      * mongodb_app - url do mongo no padrao 'mongodb://endereco:27017/poupanca_bot'
  * Arquivos de Enviroment (.env e .envDev) na raiz do projeto no seguinte padrao
    ```javascript
    const token = 'TOKEN FORNECIDO PELO BOTFATHER DO TELEGRAM'
    // Enderecos da API de Poupanca
    const urlAbrePoupanca   = 'https://caminho.da.api/abrirPoupanca'
    const urlConsultaSaldo  = 'https://caminho.da.api/consulta'
    const urlVerificaConta  = 'https://caminho.da.api/verifica'
    const urlAplica         = 'https://caminho.da.api/aplica'
    const urlResgateParcial = 'https://caminho.da.api/resgateparcial'
    const urlResgateTotal   = 'https://caminho.da.api/resgateTotal'

    module.exports = {
        token,
        urlAbrePoupanca,
        urlConsultaSaldo,
        urlVerificaConta,
        urlAplica,
        urlResgateParcial,
        urlResgateTotal,
        apiUrl: `https://api.telegram.org/bot${token}`,
        apiFileUrl: `https://api.telegram.org/file/bot${token}`
    }
    ```

# Execução Local:
  - npm run start

# Debug Local:
  - npm run debug

# Docker Compose:
  - npm run docker

# VS Code com os comandos acima ja configurados
