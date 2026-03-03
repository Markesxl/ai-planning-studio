

## Plano de Atualizações

### 1. Remover Google OAuth
Remover o botão "Continuar com Google", o divisor "ou", e a importação do `lovable` no `AuthModal.tsx`. O modal ficará limpo, apenas com email/senha.

### 2. Novas Funcionalidades (Sugestões)

Com base no estado atual do app, proponho estas melhorias funcionais:

**a) Senha Esqueceu? (Password Reset)**
Adicionar link "Esqueceu a senha?" no modal de login que dispara `supabase.auth.resetPasswordForEmail()`. Fluxo completo com feedback visual.

**b) Saudação Personalizada no Header**
No desktop (coluna direita, card do usuário) e no mobile header, exibir "Bom dia/Boa tarde/Boa noite, [Nome]" com base na hora do dia e no `display_name` do perfil.

**c) Filtro por Matéria nas Tarefas**
Adicionar chips/badges clicáveis acima da lista de tarefas para filtrar por categoria. Exemplo: [Todas] [Matemática] [Python]. Animação suave ao trocar filtro.

**d) Confirmação Visual de Exclusão**
Substituir exclusão direta por um AlertDialog com confirmação antes de deletar tarefas/categorias. Previne exclusões acidentais, especialmente no mobile.

**e) Contador de Tarefas no Header**
Badge animado no card de planejamento mostrando "3/8 concluídas" com mini barra de progresso inline.

### Arquivos Modificados
- `src/components/auth/AuthModal.tsx` -- remover Google, adicionar "Esqueceu a senha?"
- `src/pages/Index.tsx` -- saudação, filtro por matéria, contador de tarefas, confirmação de exclusão
- `src/components/vde/TaskCard.tsx` -- integrar AlertDialog na exclusão

### Detalhes Técnicos
- Password reset usa `supabase.auth.resetPasswordForEmail()` nativo
- Filtro de categorias via estado local `selectedCategory` com `useMemo` para performance
- AlertDialog do Radix UI (já instalado) para confirmações
- Saudação calculada com `new Date().getHours()` sem dependência externa

