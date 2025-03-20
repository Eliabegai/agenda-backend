# PENDÊNCIAS/BUGS


> **[ BUG ]** - Ao editar um funcionário, se editar um mesmo dia da semana o horário, ele está criando outro - OK
  | Corrigido.

> **[ BUG ]** - Validar se tem o Cliente quando cria o agendamento, se vier vazio, retornar erro - OK
  | Validações Feitas.

> **[ PEN ]** - O mesmo cliente pode agendar com protocolos diferentes, no mesmo dia e hora. - OK
  | Pode agendar em horários diferentes.

> **[ PEN ]** - Criar Indisponibilidade para o funcionário, não permitindo cadastrar agendamento nesse dia - OK
  | Pode adicionar ou remover indisponibilidade do usuário.

> **[ PEN ]** - Não poder criar agendamento para a data/hora atual, apenas futura, ou seja, hoje sendo 27/02/2025 as 14:30, não poder marcar para esse horário (se tiver disponível) ou anterior, apenas depois. - OK
  | Com menos de 2 horas não se pode agendar mais.

> **[ PEN ]** - Login Admin ou Funcionario, se não for admin, tentar funcionario... porém precisa acrescentar o campo senha
  | Removido a difernça, deixado tudo como `user`, facilitando essa opção.

> **[ PEN ]** - Função para recuperar senha e alterar senha (funcionario ou admin) - OK
  | Criado lógica, implementar no front.

> **[ BUG ]** - Se alterar a data do agendamento, verificar se o funcionario agendado tem essa data/horario disponível, se não tiver agendar com outro ou retorar que não há funcionario disponível para essa data/horario. - OK
  | Não será alterado se não tiver outro funcionário.

> **[ PEN ]** - Fazer a busca pelo funcionario (user.user) pelo nome, no momento está apenas pelo ID - OK
  | Feito a busca por nome, porém precisa ser preciso ao digitar. questão de acentuação.

> **[ PEN ]** - Ao buscar os funcionarios, trazer apenas com role 'user', admin não. - OK
  | Corrigido.

> **[ PEN ]** - Criar outra rota para ver admins.. mas não será usada no front.



> **[ PEN ]** - 

> **[ BUG ]** - 



