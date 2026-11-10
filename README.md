# ⚽ Bar da Várzea - Gestão de Vendas em Campeonatos

Sistema mobile-first completo em React, Tailwind CSS e TypeScript para gestão de vendas, comandas, fiados com vencimento de 7 dias, estorno de pagamentos e controle de caixa em campeonatos de futebol de domingo.

---

## 🚀 Como Publicar na Vercel (Passo a Passo)

### Opção 1: Via GitHub (Recomendado e Gratuito)

1. **Envie este projeto para o seu GitHub:**
   - Crie um repositório no seu GitHub (ex: `bar-da-varzea`).
   - Faça o commit e push dos arquivos:
     ```bash
     git init
     git add .
     git commit -m "feat: app completo bar da varzea"
     git branch -M main
     git remote add origin https://github.com/SEU_USUARIO/bar-da-varzea.git
     git push -u origin main
     ```

2. **Conecte com a Vercel:**
   - Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).
   - Clique no botão **"Add New..."** ➔ **"Project"**.
   - Selecione o repositório `bar-da-varzea` que você acabou de criar.

3. **Deploy Automático:**
   - O arquivo `vercel.json` já está configurado na raiz!
   - A Vercel detectará automaticamente o framework como **Vite**:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - Clique em **"Deploy"**.
   - Em menos de 1 minuto, seu app estará no ar com link HTTPS (ex: `https://bar-da-varzea.vercel.app`).

---

### Opção 2: Via Vercel CLI (Direto pelo Terminal)

Se preferir fazer deploy direto pelo terminal:

```bash
# 1. Instale a CLI da Vercel (se ainda não tiver)
npm i -g vercel

# 2. Faça login
vercel login

# 3. Execute o deploy de produção
vercel --prod
```

Responda `Y` (Yes) para as perguntas padrão e a Vercel gerará o link da sua aplicação imediatamente.

---

## 📱 Recursos Prontos para Produção

- **Totalmente Responsivo (Mobile-first):** Feito sob medida para usar no celular no alambrado ou barraca do campo.
- **Persistência em localStorage:** Funciona offline e guarda os dados no navegador do celular.
- **Backup JSON:** Exporte e importe todos os dados em arquivos `.json` na aba **Config**.
- **Cobrança no WhatsApp:** Integração nativa com link `https://wa.me/` e mensagem pré-formatada.
- **Roteamento SPA:** O arquivo `vercel.json` garante que qualquer atualização de página não gere erro 404.
