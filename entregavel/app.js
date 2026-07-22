(() => {
  'use strict';

  const recipes = Array.isArray(window.RECIPES) ? window.RECIPES : [];
  const bonuses = Array.isArray(window.BONUSES) ? window.BONUSES : [];
  const meta = window.RECIPE_META || { categories: [], totals: {} };
  const categoryImages = {
    'Sobremesas e Doces': '../images/cat_sobremesas.jpg',
    'Panificação de Verdade': '../images/cat_panificacao.jpg',
    'Arepas e Tortilhas': '../images/2.jpg',
    'Pizzas e Empanadas': '../images/3.jpg',
    'Folhados e Croissants': '../images/7.jpg',
    'Refeições do Dia a Dia': '../images/5.jpg',
    'Bases e Preparações': '../images/6.jpg'
  };

  const elements = {
    categoryGrid: document.getElementById('category-grid'),
    bonusGrid: document.getElementById('bonus-grid'),
    bonusSection: document.getElementById('bonus-section'),
    recipeTotal: document.getElementById('recipe-total'),
    categoryTotal: document.getElementById('category-total'),
    recipeGrid: document.getElementById('recipe-grid'),
    search: document.getElementById('recipe-search'),
    clearSearch: document.querySelector('[data-action="clear-search"]'),
    libraryTitle: document.getElementById('library-title'),
    resultsKicker: document.getElementById('results-kicker'),
    resultCount: document.getElementById('result-count'),
    empty: document.getElementById('empty-state'),
    loadMore: document.getElementById('load-more'),
    favoriteCount: document.getElementById('favorite-count'),
    dialog: document.getElementById('recipe-dialog'),
    bonusDialog: document.getElementById('bonus-dialog'),
    dialogBackdrop: document.getElementById('dialog-backdrop'),
    detail: document.getElementById('recipe-detail'),
    bonusDetail: document.getElementById('bonus-detail'),
    toast: document.getElementById('toast'),
    installButton: document.querySelector('[data-action="install"]')
  };

  const state = {
    category: 'Todas',
    quickFilter: 'Todos',
    favoritesOnly: false,
    query: '',
    visible: 24,
    favorites: readSet('doce-liberdade-favoritos'),
    deferredInstall: null,
    activeRecipe: null
  };

  function readSet(key) {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveFavorites() {
    localStorage.setItem('doce-liberdade-favoritos', JSON.stringify([...state.favorites]));
    updateFavoriteCount();
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function normalize(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function totalMinutes(recipe) {
    return Number(recipe.prepMinutes || 0) + Number(recipe.cookMinutes || 0);
  }

  function categoryShort(category) {
    return category
      .replace('Panificação de Verdade', 'Panificação')
      .replace('Refeições do Dia a Dia', 'Refeições')
      .replace('Bases e Preparações', 'Bases');
  }

  function filteredRecipes() {
    const query = normalize(state.query.trim());
    return recipes.filter((recipe) => {
      if (state.category !== 'Todas' && recipe.category !== state.category) return false;
      if (state.favoritesOnly && !state.favorites.has(recipe.id)) return false;
      if (state.quickFilter !== 'Todos' && !recipe.tags.includes(state.quickFilter)) return false;
      if (!query) return true;
      const haystack = normalize(`${recipe.name} ${recipe.category} ${recipe.ingredients.join(' ')} ${recipe.tags.join(' ')}`);
      return haystack.includes(query);
    });
  }

  function renderCategories() {
    elements.categoryGrid.innerHTML = meta.categories.map((category) => `
      <button class="category-card" type="button" data-category="${escapeHTML(category)}" aria-label="Abrir ${escapeHTML(category)}">
        <img src="${categoryImages[category]}" alt="" loading="lazy" width="1024" height="681">
        <span class="category-card-content">
          <strong>${escapeHTML(category)}</strong>
          <span>${meta.totals[category]} receitas</span>
        </span>
      </button>
    `).join('');
  }

  function renderBonuses() {
    elements.bonusGrid.innerHTML = bonuses.map((bonus) => `
      <article class="bonus-card bonus-card--${escapeHTML(bonus.theme)}">
        <div class="bonus-cover" aria-hidden="true">
          <span class="bonus-number">BÔNUS ${bonus.number}</span>
          <span class="bonus-icon">${escapeHTML(bonus.icon)}</span>
          <strong>${escapeHTML(bonus.title)}</strong>
          <small>${escapeHTML(bonus.subtitle)}</small>
        </div>
        <div class="bonus-card-body">
          <span class="eyebrow">${escapeHTML(bonus.label)}</span>
          <h3>${escapeHTML(bonus.title)}</h3>
          <p>${escapeHTML(bonus.description)}</p>
          <button class="bonus-open-button" type="button" data-bonus="${escapeHTML(bonus.id)}">Abrir bônus <span aria-hidden="true">→</span></button>
        </div>
      </article>
    `).join('');
  }

  function readBonusTracker(id) {
    try {
      return new Set(JSON.parse(localStorage.getItem(`doce-liberdade-bonus-${id}`) || '[]'));
    } catch {
      return new Set();
    }
  }

  function renderBonusSection(section, bonus) {
    const tracker = readBonusTracker(bonus.id);
    return `
      <section class="bonus-content-section">
        <h3>${escapeHTML(section.title)}</h3>
        ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('')}
        ${section.alert ? `<div class="bonus-alert"><strong>Atenção</strong><span>${escapeHTML(section.alert)}</span></div>` : ''}
        ${section.ingredients ? `<h4>Ingredientes</h4><ul class="bonus-list">${section.ingredients.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}
        ${section.steps ? `<h4>Modo de preparo</h4><ol class="bonus-steps">${section.steps.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ol>` : ''}
        ${section.cards ? `<div class="attention-grid">${section.cards.map((card) => `<article><strong>${escapeHTML(card.title)}</strong><p>${escapeHTML(card.text)}</p></article>`).join('')}</div>` : ''}
        ${section.bullets ? `<ul class="bonus-list">${section.bullets.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}
        ${section.checklist ? `<div class="bonus-checklist">${section.checklist.map((item) => `<div><span aria-hidden="true">✓</span><p>${escapeHTML(item)}</p></div>`).join('')}</div>` : ''}
        ${section.tracker ? `<div class="tracker-wrap"><div class="tracker-heading"><strong>Meu acompanhamento</strong><span>Marque cada dia concluído</span></div><div class="tracker-grid">${Array.from({ length: 14 }, (_, index) => { const day = index + 1; const checked = tracker.has(day); return `<label class="tracker-day${checked ? ' is-checked' : ''}"><input type="checkbox" data-bonus-track="${day}" ${checked ? 'checked' : ''}><span>${checked ? '✓' : day}</span><small>Dia ${day}</small></label>`; }).join('')}</div></div>` : ''}
        ${section.note ? `<div class="bonus-note">${escapeHTML(section.note)}</div>` : ''}
      </section>
    `;
  }

  function renderBonusDetail(id) {
    const bonus = bonuses.find((item) => item.id === id);
    if (!bonus) return;
    const recipeContent = (bonus.recipes || []).length ? `
      <section class="bonus-content-section">
        <div class="bonus-recipes-heading"><div><span class="eyebrow">Caderno de receitas</span><h3>${bonus.recipes.length} preparações</h3></div><span>${bonus.recipes.length}</span></div>
        <div class="bonus-recipe-list">${bonus.recipes.map((recipe, index) => `
          <details class="bonus-recipe">
            <summary><span class="bonus-recipe-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${escapeHTML(recipe.name)}</strong><small>${escapeHTML(recipe.time)} · ${escapeHTML(recipe.servings)}</small></span><b aria-hidden="true">+</b></summary>
            <div class="bonus-recipe-body"><h4>Ingredientes</h4><ul>${recipe.ingredients.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul><h4>Modo de preparo</h4><ol>${recipe.steps.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ol></div>
          </details>
        `).join('')}</div>
      </section>
    ` : '';

    elements.bonusDetail.innerHTML = `
      <div class="bonus-detail-hero bonus-detail-hero--${escapeHTML(bonus.theme)}">
        <button class="dialog-close" type="button" data-action="close-bonus" aria-label="Fechar bônus">×</button>
        <span class="bonus-detail-number">Bônus ${bonus.number}</span>
        <span class="bonus-detail-icon" aria-hidden="true">${escapeHTML(bonus.icon)}</span>
        <div><span class="eyebrow">${escapeHTML(bonus.label)}</span><h2 id="bonus-dialog-title">${escapeHTML(bonus.title)}</h2><p>${escapeHTML(bonus.subtitle)}</p></div>
      </div>
      <div class="detail-body bonus-detail-body">
        ${bonus.sections.map((section) => renderBonusSection(section, bonus)).join('')}
        ${recipeContent}
        <section class="bonus-sources"><h3>Referências do material</h3><p>O conteúdo completo está dentro do aplicativo e foi preparado para revisão da nutricionista responsável.</p>${bonus.sources.map((source) => `<div class="bonus-source-row">${escapeHTML(source.label)}</div>`).join('')}</section>
      </div>
    `;
  }

  function openBonus(id, { updateHash = true } = {}) {
    renderBonusDetail(id);
    if (!elements.bonusDialog.open) {
      if (typeof elements.bonusDialog.showModal === 'function') elements.bonusDialog.showModal();
      else {
        elements.bonusDialog.setAttribute('open', '');
        elements.bonusDialog.classList.add('is-fallback');
        elements.dialogBackdrop.hidden = false;
        document.body.classList.add('modal-open');
      }
    }
    if (updateHash) history.replaceState(null, '', `#bonus-${id}`);
  }

  function closeBonus() {
    if (elements.bonusDialog.open) {
      if (typeof elements.bonusDialog.close === 'function') elements.bonusDialog.close();
      else elements.bonusDialog.removeAttribute('open');
    }
    elements.bonusDialog.classList.remove('is-fallback');
    elements.dialogBackdrop.hidden = true;
    document.body.classList.remove('modal-open');
    if (location.hash.startsWith('#bonus-')) history.replaceState(null, '', `${location.pathname}${location.search}`);
  }

  function setActiveNav(action) {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.action === action));
  }

  function showBonuses() {
    setActiveNav('bonuses');
    elements.bonusSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderRecipes({ keepPosition = true } = {}) {
    const currentY = window.scrollY;
    const result = filteredRecipes();
    const shown = result.slice(0, state.visible);

    elements.recipeGrid.innerHTML = shown.map((recipe) => {
      const favorite = state.favorites.has(recipe.id);
      return `
        <article class="recipe-card">
          <div class="recipe-thumb">
            <img src="${categoryImages[recipe.category]}" alt="" loading="lazy" width="1024" height="681">
            <span class="recipe-number">#${recipe.id}</span>
          </div>
          <div class="recipe-card-body">
            <span class="recipe-category">${escapeHTML(categoryShort(recipe.category))}</span>
            <h3>${escapeHTML(recipe.name)}</h3>
            <div class="recipe-meta">
              <span>◷ ${totalMinutes(recipe)} min</span>
              <span>◎ ${recipe.servings} porções</span>
            </div>
            <button class="recipe-open" type="button" data-recipe="${recipe.id}" aria-label="Abrir receita ${escapeHTML(recipe.name)}"></button>
            <button class="favorite-button${favorite ? ' is-favorite' : ''}" type="button" data-favorite="${recipe.id}" aria-label="${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos" aria-pressed="${favorite}">${favorite ? '♥' : '♡'}</button>
          </div>
        </article>
      `;
    }).join('');

    elements.resultCount.textContent = `${result.length} ${result.length === 1 ? 'receita' : 'receitas'}`;
    elements.empty.hidden = result.length > 0;
    elements.loadMore.hidden = shown.length >= result.length || result.length === 0;
    elements.clearSearch.hidden = state.query.length === 0;

    if (state.favoritesOnly) {
      elements.resultsKicker.textContent = 'Sua seleção';
      elements.libraryTitle.textContent = 'Receitas favoritas';
    } else if (state.category !== 'Todas') {
      elements.resultsKicker.textContent = 'Categoria selecionada';
      elements.libraryTitle.textContent = state.category;
    } else if (state.query) {
      elements.resultsKicker.textContent = 'Resultados da busca';
      elements.libraryTitle.textContent = `Busca por “${state.query}”`;
    } else {
      elements.resultsKicker.textContent = 'Biblioteca completa';
      elements.libraryTitle.textContent = 'Todas as receitas';
    }

    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.filter === state.quickFilter);
    });
    setActiveNav(state.favoritesOnly ? 'favorites' : 'home');

    if (keepPosition) window.scrollTo({ top: currentY });
  }

  function updateFavoriteCount() {
    const count = state.favorites.size;
    elements.favoriteCount.textContent = count;
    elements.favoriteCount.hidden = count === 0;
  }

  function setCategory(category) {
    state.category = category;
    state.favoritesOnly = false;
    state.visible = 24;
    renderRecipes();
    document.querySelector('.library-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetFilters() {
    state.category = 'Todas';
    state.quickFilter = 'Todos';
    state.favoritesOnly = false;
    state.query = '';
    state.visible = 24;
    elements.search.value = '';
    renderRecipes({ keepPosition: false });
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast('Removida dos favoritos');
    } else {
      state.favorites.add(id);
      showToast('Receita salva nos favoritos');
    }
    saveFavorites();
    renderRecipes();
    if (state.activeRecipe === id && elements.dialog.open) renderDetail(id);
  }

  function readProgress(id) {
    try {
      return new Set(JSON.parse(localStorage.getItem(`doce-liberdade-passos-${id}`) || '[]'));
    } catch {
      return new Set();
    }
  }

  function renderDetail(id) {
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe) return;
    state.activeRecipe = id;
    const favorite = state.favorites.has(id);
    const progress = readProgress(id);
    const sourceNote = recipe.source.includes('complementar')
      ? 'Esta receita faz parte da coleção complementar e deve ser validada pela nutricionista responsável antes da publicação comercial.'
      : 'Adapte ingredientes, marcas e porções à orientação da sua nutricionista ou equipe de saúde.';

    elements.detail.innerHTML = `
      <div class="detail-hero">
        <img src="${categoryImages[recipe.category]}" alt="" width="1024" height="681">
        <button class="dialog-close" type="button" data-action="close-detail" aria-label="Fechar receita">×</button>
        <button class="detail-favorite${favorite ? ' is-favorite' : ''}" type="button" data-favorite="${recipe.id}" aria-label="${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos">${favorite ? '♥' : '♡'}</button>
        <div class="detail-title">
          <span class="eyebrow">Receita ${recipe.id} · ${escapeHTML(recipe.category)}</span>
          <h2 id="dialog-title">${escapeHTML(recipe.name)}</h2>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-stats">
          <div class="detail-stat"><strong>${recipe.prepMinutes} min</strong><span>preparo</span></div>
          <div class="detail-stat"><strong>${recipe.cookMinutes} min</strong><span>cozimento</span></div>
          <div class="detail-stat"><strong>${recipe.servings}</strong><span>porções</span></div>
        </div>
        ${recipe.tags.length ? `<div class="detail-tags">${recipe.tags.map((tag) => `<span class="detail-tag">${escapeHTML(tag)}</span>`).join('')}</div>` : ''}
        <section class="detail-section">
          <div class="detail-section-header"><h3>Ingredientes</h3><button class="mini-action" type="button" data-action="copy-ingredients">Copiar lista</button></div>
          <ul class="ingredient-list">${recipe.ingredients.map((ingredient) => `<li class="ingredient-item">${escapeHTML(ingredient)}</li>`).join('')}</ul>
        </section>
        <section class="detail-section">
          <div class="detail-section-header"><h3>Modo de preparo</h3><span class="eyebrow">Toque para marcar</span></div>
          <ol class="step-list">${recipe.steps.map((step, index) => `
            <li><label class="step-item${progress.has(index) ? ' is-done' : ''}" data-step="${index}">
              <input type="checkbox" ${progress.has(index) ? 'checked' : ''}>
              <span class="step-number">${progress.has(index) ? '✓' : index + 1}</span>
              <span>${escapeHTML(step)}</span>
            </label></li>
          `).join('')}</ol>
        </section>
        <div class="detail-warning">${escapeHTML(sourceNote)} “Sem açúcar adicionado” não significa ausência de carboidratos.</div>
        <div class="detail-actions">
          <button class="secondary-action" type="button" data-action="share">Compartilhar</button>
          <button class="secondary-action" type="button" data-action="print">Imprimir</button>
        </div>
      </div>
    `;
  }

  function openRecipe(id, { updateHash = true } = {}) {
    renderDetail(id);
    if (!elements.dialog.open) {
      if (typeof elements.dialog.showModal === 'function') {
        elements.dialog.showModal();
      } else {
        elements.dialog.setAttribute('open', '');
        elements.dialog.classList.add('is-fallback');
        elements.dialogBackdrop.hidden = false;
        document.body.classList.add('modal-open');
      }
    }
    if (updateHash) history.replaceState(null, '', `#receita-${id}`);
  }

  function closeDetail() {
    if (elements.dialog.open) {
      if (typeof elements.dialog.close === 'function') elements.dialog.close();
      else elements.dialog.removeAttribute('open');
    }
    elements.dialog.classList.remove('is-fallback');
    elements.dialogBackdrop.hidden = true;
    document.body.classList.remove('modal-open');
    state.activeRecipe = null;
    if (location.hash.startsWith('#receita-')) history.replaceState(null, '', `${location.pathname}${location.search}`);
  }

  function toggleStep(index) {
    if (!state.activeRecipe) return;
    const progress = readProgress(state.activeRecipe);
    if (progress.has(index)) progress.delete(index); else progress.add(index);
    localStorage.setItem(`doce-liberdade-passos-${state.activeRecipe}`, JSON.stringify([...progress]));
    renderDetail(state.activeRecipe);
  }

  async function copyIngredients() {
    const recipe = recipes.find((item) => item.id === state.activeRecipe);
    if (!recipe) return;
    const text = `${recipe.name}\n\n${recipe.ingredients.map((item) => `• ${item}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Lista de ingredientes copiada');
    } catch {
      showToast('Não foi possível copiar automaticamente');
    }
  }

  async function shareRecipe() {
    const recipe = recipes.find((item) => item.id === state.activeRecipe);
    if (!recipe) return;
    const url = `${location.origin}${location.pathname}#receita-${recipe.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: recipe.name, text: `Veja esta receita no Doce Liberdade: ${recipe.name}`, url }); } catch { /* usuário cancelou */ }
    } else {
      try { await navigator.clipboard.writeText(url); showToast('Link da receita copiado'); } catch { showToast('Compartilhamento indisponível'); }
    }
  }

  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    toastTimer = setTimeout(() => elements.toast.classList.remove('is-visible'), 2400);
  }

  function showFavorites() {
    state.favoritesOnly = true;
    state.category = 'Todas';
    state.visible = 24;
    renderRecipes({ keepPosition: false });
    document.querySelector('.library-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goHome() {
    resetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', (event) => {
    const category = event.target.closest('[data-category]');
    if (category) return setCategory(category.dataset.category);

    const recipeButton = event.target.closest('[data-recipe]');
    if (recipeButton) return openRecipe(Number(recipeButton.dataset.recipe));

    const bonusButton = event.target.closest('[data-bonus]');
    if (bonusButton) return openBonus(bonusButton.dataset.bonus);

    const favorite = event.target.closest('[data-favorite]');
    if (favorite) return toggleFavorite(Number(favorite.dataset.favorite));

    const filter = event.target.closest('[data-filter]');
    if (filter) {
      state.quickFilter = filter.dataset.filter;
      state.visible = 24;
      return renderRecipes();
    }

    const step = event.target.closest('[data-step]');
    if (step) {
      event.preventDefault();
      return toggleStep(Number(step.dataset.step));
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'home') goHome();
    if (action === 'show-all') setCategory('Todas');
    if (action === 'focus-search') { elements.search.focus(); elements.search.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (action === 'bonuses') showBonuses();
    if (action === 'favorites') showFavorites();
    if (action === 'clear-search') { state.query = ''; elements.search.value = ''; renderRecipes(); elements.search.focus(); }
    if (action === 'reset-filters') resetFilters();
    if (action === 'load-more') { state.visible += 36; renderRecipes(); }
    if (action === 'close-detail') closeDetail();
    if (action === 'close-bonus') closeBonus();
    if (action === 'copy-ingredients') copyIngredients();
    if (action === 'share') shareRecipe();
    if (action === 'print') window.print();
    if (action === 'install') installApp();
  });

  elements.search.addEventListener('input', (event) => {
    state.query = event.target.value;
    state.category = 'Todas';
    state.favoritesOnly = false;
    state.visible = 24;
    renderRecipes();
  });

  elements.dialog.addEventListener('click', (event) => {
    if (event.target === elements.dialog) closeDetail();
  });

  elements.dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDetail();
  });

  elements.bonusDialog.addEventListener('click', (event) => {
    if (event.target === elements.bonusDialog) closeBonus();
  });

  elements.bonusDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeBonus();
  });

  elements.bonusDialog.addEventListener('change', (event) => {
    const input = event.target.closest('[data-bonus-track]');
    if (!input) return;
    const bonus = bonuses.find((item) => location.hash === `#bonus-${item.id}`);
    if (!bonus) return;
    const progress = readBonusTracker(bonus.id);
    const day = Number(input.dataset.bonusTrack);
    if (input.checked) progress.add(day); else progress.delete(day);
    localStorage.setItem(`doce-liberdade-bonus-${bonus.id}`, JSON.stringify([...progress]));
    input.closest('.tracker-day')?.classList.toggle('is-checked', input.checked);
    const marker = input.nextElementSibling;
    if (marker) marker.textContent = input.checked ? '✓' : day;
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredInstall = event;
    elements.installButton.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    state.deferredInstall = null;
    elements.installButton.hidden = true;
    showToast('Atalho instalado com sucesso');
  });

  async function installApp() {
    if (!state.deferredInstall) return showToast('No celular, use “Adicionar à tela de início” no menu do navegador');
    state.deferredInstall.prompt();
    await state.deferredInstall.userChoice;
    state.deferredInstall = null;
    elements.installButton.hidden = true;
  }

  window.addEventListener('hashchange', () => {
    const match = location.hash.match(/^#receita-(\d+)$/);
    if (match) openRecipe(Number(match[1]), { updateHash: false });
    else closeDetail();
    const bonusMatch = location.hash.match(/^#bonus-(.+)$/);
    if (bonusMatch) openBonus(bonusMatch[1], { updateHash: false });
    else if (elements.bonusDialog.open) closeBonus();
  });

  function init() {
    const uniqueRecipeIds = new Set(recipes.map((recipe) => recipe.id));
    if (recipes.length !== 500 || uniqueRecipeIds.size !== 500 || bonuses.length !== 3) {
      document.body.innerHTML = '<main style="padding:24px;font-family:system-ui"><h1>Não foi possível carregar a biblioteca.</h1><p>Atualize a página para tentar novamente.</p></main>';
      return;
    }
    renderCategories();
    renderBonuses();
    elements.recipeTotal.textContent = recipes.length;
    elements.categoryTotal.textContent = meta.categories.length;
    updateFavoriteCount();
    renderRecipes({ keepPosition: false });
    const match = location.hash.match(/^#receita-(\d+)$/);
    if (match) openRecipe(Number(match[1]), { updateHash: false });
    const bonusMatch = location.hash.match(/^#bonus-(.+)$/);
    if (bonusMatch) openBonus(bonusMatch[1], { updateHash: false });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  init();
})();
