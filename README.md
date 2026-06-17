# 🌎⚽ Treta das Nações — Bolão da Copa 2026

O bolão da Copa do Mundo de 2026 com cara de meme brasileiro: calendário
completo dos 104 jogos, sistema de apostas (crava o placar!), ranking dos
brabo, divisão da bolada e **atualização automática dos resultados** todo dia.
Tudo roda no **GitHub Pages** (site estático, de graça).

> Login por e-mail · calendário completo (grupos A–L + mata-mata) · pontuação
> inspirada nos melhores bolões · ranking ao vivo · prêmios · cron diário.

---

## 🚀 Subir no ar em 2 minutos (modo treino)

1. Faça o **fork** ou suba estes arquivos num repositório no GitHub.
2. Vá em **Settings → Pages**.
3. Em *Build and deployment*, escolha **Deploy from a branch**, selecione a
   branch (ex.: `main`) e a pasta **/ (root)**. Salve.
4. Em ~1 minuto seu bolão estará em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

Pronto — já funciona! Nesse **modo treino** o login e os palpites ficam salvos
só no seu navegador (`localStorage`), ótimo pra testar. Pra valer entre várias
pessoas, ative o Firebase abaixo. 👇

---

## 🔐 Ativar login de verdade + ranking compartilhado (Firebase)

Pra todo mundo logar com e-mail e disputar o mesmo ranking, use o **Firebase**
(plano gratuito Spark dá e sobra).

1. Crie um projeto em <https://console.firebase.google.com>.
2. **Authentication → Sign-in method →** ative **E-mail/senha**.
3. **Firestore Database → Criar banco** (modo produção).
4. **Project settings → Seus apps → Web (`</>`)** e copie o objeto de
   configuração. Cole em [`assets/js/config.js`](assets/js/config.js) no
   `FIREBASE_CONFIG`.
5. Em **Authentication → Settings → Authorized domains**, adicione o domínio do
   seu GitHub Pages (`seu-usuario.github.io`).
6. Nas **regras do Firestore**, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // cada um lê o ranking de todos e edita o próprio palpite;
    // admins (e-mails abaixo) podem remover qualquer jogador
    match /predictions/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == uid ||
        request.auth.token.email in ['tacianoz@gmail.com']
      );
    }
    // resultados oficiais: todos leem; lança quem estiver logado (admin no app)
    match /results/official {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Commit, espere o Pages publicar, e o app passa a usar o Firebase
automaticamente (o selo "modo treino" some).

> **Admin:** quem lança/corrige placar na mão pelo app são os e-mails listados
> em `APP.admins` no `config.js`.

---

## 🤖 Atualização automática dos resultados (cron — roda dentro do GitHub!)

Você **não precisa** de nenhum serviço externo de cron. O arquivo
[`.github/workflows/atualiza-resultados.yml`](.github/workflows/atualiza-resultados.yml)
usa o **agendador embutido do GitHub Actions**: ele liga sozinho algumas vezes
por dia, busca os placares numa API pública e dá commit do
`assets/data/results.json`. O app lê esse arquivo e atualiza placares, tabelas e
os confrontos do mata-mata.

Para ligar:

1. Crie uma conta grátis em <https://www.football-data.org/client/register> e
   copie seu token.
2. No repositório: **Settings → Secrets and variables → Actions → New
   repository secret**. Nome: `FOOTBALL_DATA_TOKEN`, valor: seu token.
3. Pronto. Pra testar na hora: aba **Actions → Atualiza resultados da Copa →
   Run workflow**.

Detalhes que valem saber sobre o cron do GitHub:

- Roda na infraestrutura do GitHub, **de graça** em repositório público.
- Os horários são em **UTC** (ajuste o `cron:` no arquivo se quiser).
- Workflows agendados rodam a partir da **branch padrão** e podem atrasar
  alguns minutos em horário de pico.
- Se o repositório ficar **60 dias sem nenhuma atividade**, o GitHub pausa os
  agendamentos — basta um commit ou um "Run workflow" pra religar.
- **Sem o token**, o workflow não quebra: ele só não atualiza nada, e você
  continua podendo lançar os placares na mão pelo app (como admin).

> A API gratuita pode não ter a Copa 2026 liberada o tempo todo. Se o mapeamento
> de algum nome de seleção falhar, ajuste o dicionário `NAME2CODE` em
> [`scripts/update-results.mjs`](scripts/update-results.mjs). O lançamento manual
> sempre funciona como plano B.

---

## ⚙️ Personalizando o bolão

Quase tudo fica em [`assets/js/config.js`](assets/js/config.js):

| O quê | Onde |
|---|---|
| Nome e subtítulo | `APP.nome`, `APP.subtitulo` |
| Pontuação (placar exato, saldo, etc.) | `APP.pontuacao` |
| Multiplicador do mata-mata | `APP.multiplicadorMataMata` |
| Valor da cota e divisão dos prêmios | `APP.premiacao` |
| Quem é admin | `APP.admins` |
| Fuso de exibição/travamento | `APP.fusoHorario` |

Times, grupos e datas dos jogos ficam em
[`assets/js/data.js`](assets/js/data.js) — fácil de ajustar se a FIFA mexer em
algo.

### Como funciona a pontuação

| Acerto | Pontos (padrão) |
|---|---|
| 🎯 Placar cravado (exato) | **10** |
| Vencedor **+** saldo de gols | **7** |
| Só o vencedor (ou empate) | **5** |
| Errou o resultado mas acertou os gols de um time | **2** |
| Errou tudo | 0 |

Mata-mata multiplica por **1,5×**. Empate no ranking? Desempata quem tiver mais
placares cravados.

---

## 🗂️ Estrutura

```
index.html                     # carrega o app
assets/
  css/style.css                # tema "meme brasileiro" (verde/ouro)
  js/
    config.js                  # ⚙️ tudo que você edita
    data.js                    # seleções, grupos e calendário (104 jogos)
    scoring.js                 # regras de pontuação
    store.js                   # auth + dados (Firebase ou localStorage)
    app.js                     # interface (jogos, ranking, bolada, etc.)
  data/results.json            # gerado pelo cron (placares + chaveamento)
scripts/update-results.mjs     # script do cron
.github/workflows/...yml       # agendador do GitHub Actions
```

---

Feito na zoeira, com muito cafezinho e treta. 🇧🇷
