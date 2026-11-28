### 🔒 Seus dados

O app pede uma conta (e-mail e senha, com o [Better Auth](https://www.better-auth.com)). A carteira fica no Postgres, ligada à conta, e aparece igual em qualquer aparelho.

Cada tabela do app tem a chave `(user_id, id)`, e cada Server Action confere a sessão e grava só nas linhas da própria pessoa. Dinheiro fica em centavos. Excluir a conta, em **Conta**, apaga tudo em cascata.

O app não busca cotações: os valores são sempre o que você investiu, pelas cotas e pelo preço médio que você informa.
