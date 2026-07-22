window.BONUSES = [
  {
    id: 'cha-dourado',
    number: 1,
    label: 'Guia prático de 14 dias',
    title: 'Chá Dourado',
    subtitle: 'Receita, cuidados e diário de acompanhamento',
    description: 'Aprenda a preparar a bebida e acompanhe sua rotina com segurança, sem substituir medicação ou orientação profissional.',
    icon: '☀',
    theme: 'gold',
    sections: [
      {
        title: 'Antes de preparar',
        paragraphs: [
          'O chá dourado é uma bebida culinária à base de cúrcuma e especiarias. Ele pode fazer parte de uma rotina alimentar, mas não existe garantia de que reduza a glicose em uma quantidade específica ou dentro de 14 dias.',
          'Se você usa medicamentos para diabetes, anticoagulantes ou outros remédios contínuos, converse com sua equipe de saúde antes de consumir cúrcuma regularmente.'
        ],
        alert: 'Não altere doses de insulina ou medicamentos com base na leitura deste material.'
      },
      {
        title: 'Receita do Chá Dourado',
        ingredients: [
          '200 ml de água',
          '1/4 de colher (chá) de cúrcuma em pó',
          '1 pedaço pequeno de canela em pau',
          '1 fatia fina de gengibre fresco — opcional',
          '1 colher (chá) de suco de limão — opcional',
          'Adoçante culinário aprovado pela sua nutricionista — opcional'
        ],
        steps: [
          'Aqueça a água até começar a ferver.',
          'Adicione a cúrcuma, a canela e, se desejar, o gengibre.',
          'Mantenha em fogo baixo por 3 minutos.',
          'Desligue, tampe e deixe descansar por mais 5 minutos.',
          'Coe, acrescente o limão se desejar e consuma morno, sem açúcar.'
        ],
        note: 'Comece com uma porção pequena para observar tolerância digestiva. Evite fórmulas concentradas ou suplementos de curcumina sem orientação.'
      },
      {
        title: 'Acompanhamento de 14 dias',
        paragraphs: ['Use este roteiro como diário de observação. A medição da glicemia deve seguir o horário e a frequência definidos pela sua equipe de saúde.'],
        checklist: [
          'Anote o horário e o que comeu junto com a bebida.',
          'Registre a glicemia somente se esse acompanhamento já fizer parte da sua orientação.',
          'Observe desconforto no estômago, refluxo, náusea ou alteração intestinal.',
          'Mantenha alimentação, sono, atividade e medicamentos habituais para não confundir os resultados.',
          'Ao final, leve as anotações para sua nutricionista ou médico.'
        ],
        tracker: true
      },
      {
        title: 'Quando não insistir',
        bullets: [
          'Suspenda a bebida e procure orientação se houver reação alérgica, dor persistente, vômitos ou piora importante do refluxo.',
          'Gestantes, lactantes e pessoas com doença hepática, cálculos biliares ou uso de anticoagulantes precisam de avaliação individual.',
          'Sinais de hipoglicemia ou glicemia muito elevada exigem o plano de ação indicado pelo seu profissional de saúde.'
        ]
      }
    ],
    sources: [
      { label: 'NCCIH — cúrcuma: utilidade e segurança', url: 'https://www.nccih.nih.gov/health/turmeric' },
      { label: 'NCCIH — diabetes e suplementos', url: 'https://www.nccih.nih.gov/health/diabetes-and-dietary-supplements-what-you-need-to-know' }
    ]
  },
  {
    id: 'lista-negra',
    number: 2,
    label: 'Guia de consulta',
    title: 'Lista Negra',
    subtitle: 'Medicamentos e suplementos que merecem atenção',
    description: 'Um guia para identificar itens que podem interferir na glicemia e preparar perguntas melhores para o médico ou farmacêutico.',
    icon: '!',
    theme: 'dark',
    sections: [
      {
        title: 'A regra mais importante',
        paragraphs: ['Alguns medicamentos podem elevar a glicose em determinadas pessoas. Isso não significa que sejam ruins ou que devam ser interrompidos. Muitas vezes, o benefício do tratamento é maior e a equipe de saúde apenas ajusta o acompanhamento ou a medicação do diabetes.'],
        alert: 'Nunca pare, reduza ou troque um medicamento por conta própria.'
      },
      {
        title: 'Classes que merecem conversa com o profissional',
        cards: [
          { title: 'Corticosteroides', text: 'Ex.: prednisona, dexametasona e alguns tratamentos injetáveis. Podem elevar a glicose, sobretudo em doses maiores ou uso prolongado.' },
          { title: 'Alguns antipsicóticos', text: 'Certos medicamentos dessa classe podem favorecer aumento de peso, resistência à insulina ou alteração da glicemia.' },
          { title: 'Alguns diuréticos', text: 'Diuréticos tiazídicos podem alterar a glicemia em algumas pessoas; o efeito depende da dose e do contexto clínico.' },
          { title: 'Alguns imunossupressores', text: 'Medicamentos usados após transplantes ou em doenças autoimunes podem afetar a produção ou a ação da insulina.' },
          { title: 'Alguns tratamentos para HIV', text: 'Determinados antirretrovirais podem contribuir para resistência à insulina ou mudanças metabólicas.' },
          { title: 'Niacina em altas doses', text: 'Doses terapêuticas de vitamina B3 podem interferir no controle glicêmico e devem ter acompanhamento.' },
          { title: 'Hormônio do crescimento', text: 'Pode aumentar a resistência à insulina e exige monitoramento quando clinicamente indicado.' },
          { title: 'Medicamentos líquidos e xaropes', text: 'Algumas formulações contêm açúcar. Verifique a composição e pergunte se existe versão sem açúcar quando isso for relevante.' }
        ]
      },
      {
        title: 'Suplementos: atenção ao rótulo e às promessas',
        bullets: [
          'Misturas em pó, gomas e xaropes podem conter açúcar ou carboidratos mesmo quando parecem “naturais”.',
          'Produtos estimulantes ou “pré-treinos” podem alterar apetite, sono, frequência cardíaca e a rotina de controle.',
          'Ervas e suplementos podem interagir com medicamentos e provocar tanto aumento quanto queda da glicose.',
          'Desconfie de promessas de cura, substituição de remédios ou resultados garantidos.'
        ],
        note: 'Leve uma foto do rótulo, a lista de ingredientes e a dose usada para o médico, nutricionista ou farmacêutico.'
      },
      {
        title: 'Roteiro para revisar seu tratamento',
        checklist: [
          'Faça uma lista de todos os medicamentos, vitaminas, chás e suplementos que utiliza.',
          'Anote dose, horário e há quanto tempo usa cada item.',
          'Registre quando percebeu mudanças na glicemia.',
          'Pergunte se o item pode interferir na glicose ou interagir com outro medicamento.',
          'Pergunte quais sinais exigem contato imediato com a equipe de saúde.',
          'Confirme se existe alternativa de formulação, horário ou dose — somente o profissional deve decidir a mudança.'
        ]
      }
    ],
    sources: [
      { label: 'NIDDK — causas e tipos secundários de diabetes', url: 'https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes' },
      { label: 'NCCIH — diabetes e suplementos', url: 'https://www.nccih.nih.gov/health/diabetes-and-dietary-supplements-what-you-need-to-know' },
      { label: 'CDC — controle da glicemia', url: 'https://www.cdc.gov/diabetes/treatment/index.html' }
    ]
  },
  {
    id: 'receitas-metabolicas',
    number: 3,
    label: 'Caderno complementar',
    title: 'Receitas Metabólicas',
    subtitle: '18 preparações para uma rotina mais leve',
    description: 'Receitas com vegetais, fibras, proteínas e gorduras insaturadas para apoiar saciedade e uma alimentação equilibrada.',
    icon: '↗',
    theme: 'green',
    sections: [
      {
        title: 'Como usar este caderno',
        paragraphs: ['As receitas priorizam alimentos in natura, proteínas, fibras e menor presença de açúcar adicionado. Elas podem apoiar uma rotina alimentar saudável, mas não tratam inflamação nem garantem perda de peso isoladamente.'],
        checklist: [
          'Monte metade do prato com vegetais quando isso estiver de acordo com seu plano alimentar.',
          'Inclua uma fonte de proteína para ajudar na saciedade.',
          'Ajuste a porção de carboidratos com sua nutricionista.',
          'Observe sua resposta individual e mantenha um registro simples.'
        ]
      }
    ],
    recipes: [
      { name: 'Omelete de Espinafre e Tomate', time: '15 min', servings: '1 porção', ingredients: ['2 ovos', '1 xícara de espinafre', '1/2 tomate picado', '1 colher (chá) de azeite', 'ervas e sal com moderação'], steps: ['Refogue o tomate e o espinafre no azeite.', 'Bata os ovos com as ervas, despeje na frigideira e cozinhe em fogo baixo.', 'Dobre quando estiver firme e sirva.'] },
      { name: 'Iogurte com Chia, Canela e Nozes', time: '5 min', servings: '1 porção', ingredients: ['1 pote de iogurte natural sem açúcar', '1 colher (sopa) de chia', '1 colher (sopa) de nozes picadas', 'canela a gosto'], steps: ['Misture todos os ingredientes.', 'Aguarde 5 minutos para a chia hidratar ou deixe na geladeira durante a noite.'] },
      { name: 'Creme de Abacate com Cacau', time: '8 min', servings: '2 porções', ingredients: ['1/2 abacate pequeno', '1 colher (sopa) de cacau 100%', '2 colheres (sopa) de iogurte natural', 'adoçante culinário opcional'], steps: ['Bata tudo até formar um creme.', 'Divida em duas porções e leve à geladeira por 20 minutos.'] },
      { name: 'Salada Crocante de Grão-de-Bico', time: '15 min', servings: '2 porções', ingredients: ['1 xícara de grão-de-bico cozido', 'pepino e tomate em cubos', 'folhas verdes', '1 colher (sopa) de azeite', 'limão e ervas'], steps: ['Misture o grão-de-bico, os vegetais e as folhas.', 'Tempere com azeite, limão e ervas apenas ao servir.'] },
      { name: 'Frango com Brócolis e Gengibre', time: '25 min', servings: '2 porções', ingredients: ['250 g de peito de frango em cubos', '2 xícaras de brócolis', '1 colher (chá) de gengibre ralado', '1 colher (sopa) de azeite', 'alho e sal com moderação'], steps: ['Doure o frango no azeite.', 'Junte alho, gengibre e brócolis.', 'Pingue água, tampe e cozinhe até o brócolis ficar macio e firme.'] },
      { name: 'Peixe Assado com Limão e Ervas', time: '30 min', servings: '2 porções', ingredients: ['2 filés de peixe', 'suco de 1/2 limão', '1 colher (sopa) de azeite', 'ervas frescas', 'abobrinha em rodelas'], steps: ['Disponha peixe e abobrinha em uma assadeira.', 'Tempere com limão, azeite e ervas.', 'Asse a 200°C por cerca de 20 minutos.'] },
      { name: 'Sopa de Lentilha com Legumes', time: '35 min', servings: '4 porções', ingredients: ['1 xícara de lentilha', 'cenoura, chuchu e tomate picados', '1/2 cebola', 'alho e louro', '1 colher (sopa) de azeite'], steps: ['Refogue cebola e alho.', 'Acrescente lentilha, legumes, louro e água.', 'Cozinhe até ficar macio e finalize com azeite.'] },
      { name: 'Abobrinha Recheada com Carne Magra', time: '40 min', servings: '2 porções', ingredients: ['2 abobrinhas pequenas', '200 g de carne moída magra', 'tomate e cebola picados', 'ervas', '1 colher (chá) de azeite'], steps: ['Corte as abobrinhas, retire parte do miolo e pré-asse por 10 minutos.', 'Refogue a carne com o miolo e os temperos.', 'Recheie e asse por mais 15 minutos.'] },
      { name: 'Couve-Flor Dourada com Cúrcuma', time: '25 min', servings: '3 porções', ingredients: ['1 couve-flor pequena em floretes', '1/2 colher (chá) de cúrcuma', '1 colher (sopa) de azeite', 'páprica e sal com moderação'], steps: ['Misture todos os ingredientes.', 'Espalhe em assadeira e asse a 210°C por 20 minutos, virando na metade.'] },
      { name: 'Quibe de Abóbora e Quinoa', time: '45 min', servings: '6 porções', ingredients: ['2 xícaras de abóbora assada', '1 xícara de quinoa cozida', 'hortelã e cebola', '1 colher (sopa) de azeite', 'cominho e sal'], steps: ['Amasse a abóbora e misture com os demais ingredientes.', 'Distribua em refratário untado.', 'Asse a 200°C por 25 minutos.'] },
      { name: 'Hambúrguer de Atum e Aveia', time: '20 min', servings: '2 porções', ingredients: ['1 lata de atum em água escorrido', '1 ovo', '2 colheres (sopa) de aveia', 'cebolinha e limão'], steps: ['Misture tudo e modele dois hambúrgueres.', 'Doure em frigideira antiaderente por 4 minutos de cada lado.'] },
      { name: 'Tofu com Legumes e Gergelim', time: '22 min', servings: '2 porções', ingredients: ['250 g de tofu firme', 'pimentão, abobrinha e cogumelos', '1 colher (chá) de gergelim', '1 colher (sopa) de azeite'], steps: ['Doure o tofu em cubos.', 'Junte os legumes e salteie até ficarem macios e firmes.', 'Finalize com gergelim.'] },
      { name: 'Berinjela Assada com Tahine', time: '35 min', servings: '2 porções', ingredients: ['1 berinjela grande', '1 colher (sopa) de tahine', 'limão', 'alho', 'salsinha'], steps: ['Asse a berinjela em cubos a 210°C por 25 minutos.', 'Misture tahine, limão, alho e um pouco de água.', 'Sirva o molho sobre a berinjela.'] },
      { name: 'Arroz de Couve-Flor com Ovos', time: '18 min', servings: '2 porções', ingredients: ['2 xícaras de couve-flor triturada', '2 ovos', 'cenoura ralada', 'cebolinha', '1 colher (sopa) de azeite'], steps: ['Refogue a cenoura e a couve-flor.', 'Abra espaço na frigideira e mexa os ovos até firmarem.', 'Misture tudo e finalize com cebolinha.'] },
      { name: 'Wrap de Alface com Frango e Abacate', time: '15 min', servings: '2 porções', ingredients: ['6 folhas grandes de alface', '1 xícara de frango desfiado', '1/4 de abacate', 'tomate picado', 'limão e ervas'], steps: ['Misture frango, abacate, tomate e temperos.', 'Distribua nas folhas de alface e enrole na hora de servir.'] },
      { name: 'Bowl de Feijão, Vegetais e Ovo', time: '20 min', servings: '1 porção', ingredients: ['1/2 xícara de feijão cozido', '1 ovo cozido', 'folhas verdes', 'tomate e cenoura', '1 colher (chá) de azeite'], steps: ['Disponha os vegetais no bowl.', 'Junte o feijão e o ovo cortado.', 'Finalize com azeite e ervas.'] },
      { name: 'Pudim de Chia com Coco', time: '5 min + geladeira', servings: '2 porções', ingredients: ['200 ml de leite de coco sem açúcar', '3 colheres (sopa) de chia', 'canela ou baunilha', 'adoçante culinário opcional'], steps: ['Misture todos os ingredientes.', 'Leve à geladeira por pelo menos 3 horas, mexendo novamente após 15 minutos.'] },
      { name: 'Maçã Assada com Canela e Castanhas', time: '25 min', servings: '2 porções', ingredients: ['1 maçã grande', 'canela', '1 colher (sopa) de castanhas picadas', '2 colheres (sopa) de água'], steps: ['Corte a maçã ao meio e retire as sementes.', 'Polvilhe canela, adicione água à assadeira e asse a 190°C por 20 minutos.', 'Finalize com as castanhas e divida em duas porções.'] }
    ],
    sources: [
      { label: 'CDC — alimentação para um peso saudável', url: 'https://www.cdc.gov/healthy-weight-growth/healthy-eating/index.html' },
      { label: 'CDC — peso saudável e diabetes', url: 'https://www.cdc.gov/diabetes/living-with/healthy-weight.html' },
      { label: 'CDC — controle da glicemia', url: 'https://www.cdc.gov/diabetes/treatment/index.html' }
    ]
  }
];
