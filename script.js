(() => {
  "use strict";

  const form = document.getElementById("formulario");
  const result = document.getElementById("resultado");

  const byId = (id) => document.getElementById(id);
  const number = (id) => Number(byId(id).value);
  const selectedText = (id) => {
    const el = byId(id);
    return el.options[el.selectedIndex]?.text || "Não informado";
  };
  const liters = (value) => `${Math.round(value).toLocaleString("pt-BR")} L`;
  const decimal = (value, digits = 1) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function validateCustom() {
    const qty = number("quantidadeMaquinas");
    const type = byId("tipoMaquina").value;
    const capacity = number("capacidadeMaquina");

    if (qty < 0 || qty > 10 || !Number.isInteger(qty)) {
      alert("Informe uma quantidade de máquinas entre 0 e 10.");
      byId("quantidadeMaquinas").focus();
      return false;
    }
    if (type === "none" && qty !== 0) {
      alert("Se não utiliza máquina de lavar, informe quantidade 0.");
      byId("quantidadeMaquinas").focus();
      return false;
    }
    if (type !== "none" && qty === 0) {
      alert("Se utiliza equipamento de lavagem, informe pelo menos 1 unidade.");
      byId("quantidadeMaquinas").focus();
      return false;
    }
    if (qty === 0 && capacity !== 0) {
      alert("Selecione 'Não se aplica' na capacidade quando a quantidade for 0.");
      byId("capacidadeMaquina").focus();
      return false;
    }
    if (qty > 0 && capacity === 0) {
      alert("Selecione a capacidade da máquina.");
      byId("capacidadeMaquina").focus();
      return false;
    }
    return true;
  }

  function buildRecommendations(data) {
    const tips = [];

    if (data.banhoMin > 5) {
      tips.push("Experimente reduzir gradualmente o tempo de banho. Banhos mais curtos podem representar uma economia importante.");
    } else {
      tips.push("Você informou banhos de até 5 minutos: mantenha esse hábito e feche o chuveiro ao se ensaboar.");
    }

    if (data.torneira === "aberta") {
      tips.push("Feche a torneira enquanto escova os dentes e abra apenas para enxaguar.");
    } else {
      tips.push("Continue mantendo a torneira fechada durante a escovação.");
    }

    if (data.limpeza === "mangueira") {
      tips.push("Para limpar o quintal, prefira vassoura e balde quando possível. Se usar mangueira, reduza o tempo e utilize esguicho com fechamento.");
    } else if (data.limpeza === "balde") {
      tips.push("Continue priorizando o balde: use somente o volume necessário para a limpeza.");
    } else {
      tips.push("Ótimo: você informou que não utiliza água nessa limpeza externa.");
    }

    if (data.lavagens >= 5) {
      tips.push("Como você realiza várias lavagens por semana, planeje os ciclos e respeite a carga recomendada pelo fabricante, sem sobrecarregar a máquina.");
    } else {
      tips.push(data.cargaMaquina === "pequena"
        ? "Quando possível, reúna peças compatíveis para evitar ciclos com poucas roupas, sempre respeitando a carga recomendada pelo fabricante."
        : "Continue respeitando a carga recomendada pelo fabricante, sem sobrecarregar a máquina.");
    }

    if (data.loucas === "manual") {
      tips.push(data.ensaboaLoucas === "fechada"
        ? "Continue fechando a torneira enquanto ensaboa e esfrega a louça."
        : "Na lavagem manual, feche a torneira enquanto ensaboa e esfrega; abra apenas para enxaguar.");
    } else {
      tips.push("Quando utilizar a máquina de lavar louças, prefira acioná-la com carga completa, conforme orientação da Sabesp.");
    }

    return tips;
  }


  function buildClassifier(data) {
    const items = [];
    const add = (title, status, label, explanation, source, sourceLabel) => {
      items.push({ title, status, label, explanation, source, sourceLabel });
    };

    if (data.banhoMin <= 5) {
      add("Banho", "good", "Bom",
        "Você informou banho de até 5 minutos, alinhado à orientação da Sabesp. A fonte também recomenda fechar o registro ao se ensaboar.",
        "https://www.sabesp.com.br/a-sabesp/educacao/dicas-economia-agua", "Sabesp — Dicas de economia");
    } else {
      add("Banho", "attention", "Atenção",
        "A duração informada ultrapassa os 5 minutos indicados pela Sabesp como referência de banho curto. Reduzir gradualmente o tempo pode ajudar.",
        "https://www.sabesp.com.br/a-sabesp/educacao/dicas-economia-agua", "Sabesp — Dicas de economia");
    }

    if (data.torneira === "fechada" || data.torneira === "enxague") {
      add("Escovação dos dentes", "good", "Bom",
        "Você mantém a torneira fechada durante a maior parte da escovação. A Sabesp informa economia ao manter a torneira fechada e abrir apenas quando necessário.",
        "https://www.sabesp.com.br/servicos/variacoes-de-consumo", "Sabesp — Variações de consumo");
    } else {
      add("Escovação dos dentes", "opportunity", "Oportunidade de economia",
        "Deixar a torneira aberta durante toda a escovação contraria a orientação da Sabesp. Feche-a e abra somente para enxaguar.",
        "https://www.sabesp.com.br/servicos/variacoes-de-consumo", "Sabesp — Variações de consumo");
    }

    if (data.loucas === "maquina") {
      add("Lavagem de louças", "neutral", "Sem avaliação suficiente",
        "O questionário não informa a capacidade nem o modelo da máquina. A Sabesp recomenda utilizá-la quando estiver com carga completa; por isso, não atribuímos uma nota sem essa informação.",
        "https://www.sabesp.com.br/a-sabesp/educacao/dicas-economia-agua", "Sabesp — Dicas para cozinha");
    } else if (data.ensaboaLoucas === "fechada") {
      add("Lavagem de louças", "good", "Bom",
        "Você fecha a torneira enquanto ensaboa e esfrega a louça, conforme orientação da Sabesp.",
        "https://www.sabesp.com.br/servicos/variacoes-de-consumo", "Sabesp — Variações de consumo");
    } else if (data.ensaboaLoucas === "aberta") {
      add("Lavagem de louças", "opportunity", "Oportunidade de economia",
        "Manter a torneira aberta durante o ensaboamento pode desperdiçar água. A Sabesp recomenda fechá-la nessa etapa e abrir apenas para enxaguar.",
        "https://www.sabesp.com.br/servicos/variacoes-de-consumo", "Sabesp — Variações de consumo");
    } else {
      add("Lavagem de louças", "neutral", "Sem avaliação suficiente",
        "Não foi possível identificar como a torneira é utilizada durante o ensaboamento. Não atribuímos uma classificação sem essa informação.",
        "https://www.sabesp.com.br/servicos/variacoes-de-consumo", "Sabesp — Variações de consumo");
    }

    if (data.limpeza === "mangueira") {
      add("Limpeza externa", "opportunity", "Oportunidade de economia",
        "Você informou uso de mangueira. A Sabesp alerta para o consumo elevado ao usar mangueira para varrer calçadas e recomenda a vassoura. O exemplo publicado é específico para calçadas; o consumo do seu quintal não foi medido.",
        "https://www.sabesp.com.br/assets/images/folhetos/sabesp-dicas-economia-agua.pdf", "Sabesp — Folheto de economia");
    } else if (data.limpeza === "0") {
      add("Limpeza externa", "good", "Bom",
        "Você informou que não utiliza água nessa limpeza externa.",
        "https://www.sabesp.com.br/assets/images/folhetos/sabesp-dicas-economia-agua.pdf", "Sabesp — Folheto de economia");
    } else if (data.limpeza === "balde") {
      add("Limpeza externa", "neutral", "Sem avaliação suficiente",
        "Você informou uso de balde. Como a fonte consultada não apresenta um critério de consumo específico para o seu método de limpeza, não atribuímos uma nota.",
        "https://www.sabesp.com.br/assets/images/folhetos/sabesp-dicas-economia-agua.pdf", "Sabesp — Folheto de economia");
    }

    const inmetroBands = "Referência técnica do Inmetro para lavadoras automáticas de abertura superior (Top Load), edição 2023: até 15,1 L/kg/ciclo = 5 pontos; acima de 15,1 até 18,4 = 4; acima de 18,4 até 21,7 = 3; acima de 21,7 até 24,9 = 2; acima de 24,9 até 28,2 = 1 ponto. As faixas são referências de eficiência, não permitem posicionar uma máquina específica sem conhecer seu consumo declarado.";
    if (data.quantidadeMaquinas === 0) {
      add("Lavagem de roupas", "neutral", "Não se aplica",
        "Você informou que não utiliza máquina de lavar. Este tópico não recebe classificação.",
        "https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/lavadoras-de-roupa/lavadoras-de-roupas-automaticas-abertura-superior-top-load", "Inmetro — Tabela de lavadoras");
    } else if (data.tipo !== "top") {
      add("Lavagem de roupas — hábito", "neutral", "Referência específica não aplicável",
        "O hábito informado foi registrado, mas as faixas técnicas citadas nesta versão são específicas para lavadoras automáticas de abertura superior (Top Load). Não aplicamos esses intervalos a máquinas frontais ou tanquinhos. Em qualquer equipamento, siga a carga recomendada pelo fabricante. A eficiência hídrica individual depende dos dados técnicos do modelo.",
        "https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/lavadoras-de-roupa", "Inmetro — Tabelas de lavadoras");
    } else if (data.cargaMaquina === "adequada") {
      add("Lavagem de roupas — hábito", "good", "Bom",
        "Você informou que respeita a carga recomendada pelo fabricante. Isso permite avaliar positivamente o hábito de uso, mas não comprova a eficiência hídrica do equipamento. " + inmetroBands,
        "https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/lavadoras-de-roupa/lavadoras-de-roupas-automaticas-abertura-superior-top-load", "Inmetro — Tabela Top Load (2023)");
    } else if (data.cargaMaquina === "pequena") {
      add("Lavagem de roupas — hábito", "opportunity", "Oportunidade de economia",
        "Você informou que frequentemente lava poucas peças por vez. Quando possível, organize as lavagens para respeitar a carga recomendada pelo fabricante, sem sobrecarregar a máquina. A eficiência hídrica individual continua sem avaliação. " + inmetroBands,
        "https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/lavadoras-de-roupa/lavadoras-de-roupas-automaticas-abertura-superior-top-load", "Inmetro — Tabela Top Load (2023)");
    } else if (data.cargaMaquina === "varia") {
      add("Lavagem de roupas — hábito", "attention", "Atenção",
        "Você informou que a quantidade de roupas por lavagem varia. Procure seguir a carga recomendada pelo fabricante em cada ciclo. A eficiência hídrica individual não pode ser determinada sem o consumo declarado do modelo. " + inmetroBands,
        "https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/lavadoras-de-roupa/lavadoras-de-roupas-automaticas-abertura-superior-top-load", "Inmetro — Tabela Top Load (2023)");
    } else {
      add("Lavagem de roupas", "neutral", "Sem avaliação suficiente",
        "Não foi possível avaliar o hábito de carga. A eficiência hídrica individual também depende do consumo declarado do modelo. " + inmetroBands,
        "https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/lavadoras-de-roupa/lavadoras-de-roupas-automaticas-abertura-superior-top-load", "Inmetro — Tabela Top Load (2023)");
    }

    if (data.volumeDescarga === "6") {
      add("Descargas", "good", "Bom",
        "Você informou 6 L por acionamento. A Sabesp apresenta 6 L como referência de bacia com volume de descarga reduzido (VDR). O valor depende da identificação correta do mecanismo.",
        "https://www.sabesp.com.br/o-que-fazemos/obras-programas/uso-racional-agua", "Sabesp — Uso Racional da Água");
    } else if (data.volumeDescarga === "12") {
      add("Descargas", "attention", "Atenção",
        "Você informou 12 L por acionamento. A Sabesp apresenta esse volume como referência de bacia convencional com caixa acoplada e compara com 6 L da bacia VDR. É uma oportunidade para verificar se existe alternativa economizadora compatível.",
        "https://www.sabesp.com.br/o-que-fazemos/obras-programas/uso-racional-agua", "Sabesp — Uso Racional da Água");
    } else {
      add("Descargas", "neutral", "Sem avaliação suficiente",
        "A Sabesp apresenta como referências 12 L por descarga para bacia convencional com caixa acoplada e 6 L para bacia VDR. Como o volume real não foi identificado, não presumimos que sua caixa consuma 12 L.",
        "https://www.sabesp.com.br/o-que-fazemos/obras-programas/uso-racional-agua", "Sabesp — Uso Racional da Água");
    }

    return items;
  }

  function renderClassifier(data) {
    const cards = buildClassifier(data);
    return `
      <section class="classifier-section">
        <h3>Classificação dos seus hábitos</h3>
        <p class="classifier-intro">As avaliações seguem referências técnicas oficiais. Na lavanderia, a classificação apresentada é do hábito de utilização; as faixas do Inmetro são exibidas como referência, mas a eficiência da máquina não é presumida sem o consumo declarado do modelo. Para descargas, usamos as referências de 6 L (VDR) e 12 L (convencional) da Sabesp.</p>
        <div class="classifier-grid">
          ${cards.map(card => `
            <article class="classifier-card ${card.status}">
              <div class="classifier-top"><strong>${card.title}</strong><span class="classifier-badge">${card.label}</span></div>
              <p>${card.explanation}</p>
              <a href="${card.source}" target="_blank" rel="noopener noreferrer">${card.sourceLabel} ↗</a>
            </article>`).join("")}
        </div>
        <div class="classifier-legend"><span>🟢 Bom: alinhado à orientação consultada</span><span>🟡 Atenção: há oportunidade de melhoria</span><span>🔴 Oportunidade: hábito que pode ser alterado</span><span>⚪ Sem avaliação: faltam dados para classificar</span></div>
      </section>`;
  }

  function renderResults(data) {
    const totalLiters = data.consumoM3 * 1000;
    const dailyLiters = totalLiters / data.periodo;
    const perPersonDaily = dailyLiters / data.moradores;
    const perPersonMonth = perPersonDaily * 30;

    // Estimativas indicativas, exibidas separadamente do total medido na conta.
    const showerLitersDay = data.moradores * data.banhos * data.banhoMin * 11.4;
    const showerLitersPeriod = showerLitersDay * data.periodo;
    const hoseLitersMonth = data.limpeza === "mangueira"
      ? (279 / 15) * data.tempoMangueira * (30 / 7)
      : 0;

    const machineSummary = data.quantidadeMaquinas === 0
      ? "Não utiliza máquina de lavar."
      : `${data.quantidadeMaquinas} máquina(s) de ${data.capacidade} kg, ${data.tipoTexto.toLowerCase()}.`;

    const showerLabel = `${data.banhos} banho(s) por pessoa/dia, com duração média informada de ${data.banhoMin} min.`;
    const hoseLabel = data.limpeza === "mangueira"
      ? `Mangueira por aproximadamente ${data.tempoMangueira} min por limpeza, uma vez por semana.`
      : selectedText("limpeza") + ".";

    const tips = buildRecommendations(data);
    result.hidden = false;
    result.innerHTML = `
      <div class="result-head">
        <span class="eyebrow">SEU DIAGNÓSTICO</span>
        <h2>Veja o retrato do consumo da sua casa</h2>
        <p>O consumo da conta é o total informado por você. As estimativas por hábito são referências separadas e não são somadas ao total.</p>
      </div>
      <div class="metrics">
        <div class="metric"><span>Consumo na conta</span><strong>${decimal(data.consumoM3, 1)} m³</strong></div>
        <div class="metric"><span>Média diária da residência</span><strong>${liters(dailyLiters)}</strong></div>
        <div class="metric"><span>Média por pessoa/dia</span><strong>${liters(perPersonDaily)}</strong></div>
      </div>
      <div class="result-body">
        ${renderClassifier(data)}
        <div class="result-columns">
          <div>
            <h3>Resumo dos seus hábitos</h3>
            <ul class="result-list">
              <li><strong>Moradores:</strong> ${data.moradores}</li>
              <li><strong>Banheiros:</strong> ${selectedText("banheiros")}</li>
              <li><strong>Banho:</strong> ${showerLabel}</li>
              <li><strong>Lavanderia:</strong> ${machineSummary}</li>
              <li><strong>Frequência de lavagem:</strong> ${selectedText("lavagens")}</li>
              <li><strong>Uso da capacidade:</strong> ${selectedText("cargaMaquina")}</li>
              <li><strong>Louças:</strong> ${selectedText("loucas")} · ${selectedText("frequenciaLoucas").toLowerCase()} por dia</li>
              <li><strong>Escovação:</strong> ${selectedText("torneira")}</li>
              <li><strong>Descargas:</strong> ${selectedText("descargas")} por pessoa/dia · ${selectedText("volumeDescarga")}</li>
              <li><strong>Limpeza externa:</strong> ${hoseLabel}</li>
            </ul>
          </div>
          <div>
            <h3>Estimativas indicativas</h3>
            <p><strong>Banhos:</strong> cerca de ${liters(showerLitersDay)} por dia para a residência, considerando uma vazão ilustrativa de 11,4 L/min.</p>
            ${data.limpeza === "mangueira"
              ? `<p><strong>Mangueira:</strong> aproximadamente ${liters(hoseLitersMonth)} em 30 dias, usando como referência 279 L em 15 minutos divulgados pela Sabesp para uma situação de limpeza externa. O resultado real varia conforme a vazão e a forma de uso.</p>`
              : `<p><strong>Mangueira:</strong> não foi calculada, pois você não informou uso de mangueira.</p>`}
            <p><strong>Lavanderia:</strong> ${data.quantidadeMaquinas} equipamento(s), capacidade total instalada de ${data.quantidadeMaquinas * data.capacidade} kg por carga simultânea. Não estimamos litros por lavagem sem especificações técnicas do modelo.</p>
            <p><strong>Consumo por pessoa em 30 dias:</strong> ${liters(perPersonMonth)}.</p>
          </div>
        </div>
        <div class="notice">A estimativa de banho usa uma vazão de referência e a de mangueira usa um exemplo publicado para limpeza externa. Elas não substituem medição. A conta de água representa o consumo total medido no período e inclui atividades que este questionário não consegue separar.</div>
        <h3 style="margin-top:24px">Oportunidades para economizar</h3>
        <ul class="result-list">${tips.map(t => `<li>${t}</li>`).join("")}</ul>
        <p><strong>Uma ideia para acompanhar:</strong> compare o consumo em m³ das próximas contas, considerando períodos semelhantes. Assim você poderá verificar se as mudanças de hábito fizeram diferença.</p>
      </div>
    `;

    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity() || !validateCustom()) return;

    const data = {
      moradores: number("moradores"),
      banhos: number("banhos"),
      banhoMin: number("duracao"),
      consumoM3: number("contaAgua"),
      periodo: number("periodoConta"),
      quantidadeMaquinas: number("quantidadeMaquinas"),
      capacidade: number("capacidadeMaquina"),
      tipo: byId("tipoMaquina").value,
      tipoTexto: selectedText("tipoMaquina"),
      lavagens: number("lavagens"),
      cargaMaquina: byId("cargaMaquina").value,
      loucas: byId("loucas").value,
      ensaboaLoucas: byId("ensaboaLoucas").value,
      torneira: byId("torneira").value,
      limpeza: byId("limpeza").value,
      tempoMangueira: number("tempoMangueira"),
      volumeDescarga: byId("volumeDescarga").value
    };

    if (data.moradores < 1 || data.consumoM3 <= 0 || data.periodo < 1) {
      alert("Confira o número de moradores, o consumo da conta e o período informado.");
      return;
    }

    renderResults(data);
  });

  // Deixa o campo de duração visualmente desabilitado quando não há uso de mangueira.
  const limpeza = byId("limpeza");
  const tempo = byId("tempoMangueira");
  function updateHoseField() {
    const usesHose = limpeza.value === "mangueira";
    tempo.disabled = !usesHose;
    if (!usesHose) tempo.value = "";
    else if (!tempo.value) tempo.value = "5";
  }
  limpeza.addEventListener("change", updateHoseField);
  updateHoseField();
})();
