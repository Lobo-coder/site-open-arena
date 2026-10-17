-- =====================================================================
-- Open Arena: dados iniciais.
-- ATENÇÃO: preços e horários são EXEMPLOS para a demonstração.
-- Confirme com a arena e ajuste aqui (ou pelo painel) antes de ir ao ar.
-- =====================================================================

update configuracoes set
  nome_negocio       = 'Open Arena',
  slogan             = 'Bairro dos Estados · João Pessoa',
  hero_titulo        = 'Sua quadra reservada em segundos.',
  hero_subtitulo     = 'Campo society e beach tennis. Veja os horários livres e reserve na hora, sem esperar resposta no WhatsApp.',
  sobre              = 'Bem-estar e saúde no coração da cidade! Campo society e quadra de beach tennis para jogar com os amigos, treinar ou fazer aula.',
  whatsapp           = '5583981902505',
  instagram          = 'openarenaoficial',
  endereco           = 'Bairro dos Estados, João Pessoa – PB',
  aviso_agendamento  = 'Pagamento na arena (PIX ou cartão). Chegue 10 minutos antes. Para cancelar, avise com pelo menos 24 horas de antecedência.',
  passo_minutos      = 60,
  antecedencia_horas = 1,
  janela_dias        = 30,
  rotulo_recurso     = 'Quadra',
  msg_agendamento    = 'Olá! Acabei de reservar [SERVIÇO] para [DATA], às [HORÁRIO], pelo site. Meu nome é [NOME].',
  msg_lembrete       = 'Fala, [NOME]! Passando para lembrar da sua reserva na Open Arena: [SERVIÇO], [DATA] às [HORÁRIO]. Bom jogo!'
where id = 1;

-- Segunda a sexta 06h–23h, sábado 07h–22h, domingo 07h–18h
update horarios_funcionamento set atende = true, abre = '06:00', fecha = '23:00' where dia_semana between 1 and 5;
update horarios_funcionamento set atende = true, abre = '07:00', fecha = '22:00' where dia_semana = 6;
update horarios_funcionamento set atende = true, abre = '07:00', fecha = '18:00' where dia_semana = 0;

insert into recursos (nome, ordem)
select * from (values ('Campo Society', 1), ('Quadra de Beach Tennis', 2)) as v(nome, ordem)
where not exists (select 1 from recursos);

insert into servicos (nome, descricao, preco_centavos, duracao_minutos, ordem)
select * from (values
  ('Campo Society · 1 hora', 'Grama sintética, iluminação e vestiário.',          15000, 60, 1),
  ('Campo Society · 1h30',   'Para o jogo com prorrogação.',                     21000, 90, 2),
  ('Beach Tennis · 1 hora',  'Quadra de areia com iluminação. Até 4 jogadores.',   8000, 60, 3),
  ('Aula de Beach Tennis',   'Aula com professor. Raquetes e bolinhas inclusas.',  6000, 60, 4)
) as v(nome, descricao, preco_centavos, duracao_minutos, ordem)
where not exists (select 1 from servicos);

-- cada modalidade usa a sua quadra
insert into servico_recursos (servico_id, recurso_id)
select s.id, r.id from servicos s join recursos r
  on (s.nome like 'Campo Society%' and r.nome = 'Campo Society')
  or (s.nome like '%Beach Tennis%' and r.nome = 'Quadra de Beach Tennis')
on conflict do nothing;
