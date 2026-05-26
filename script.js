const categories = [
  { key: 'rent', label: 'Housing / rent', icon: '🏠', color: '#378ADD', defaultPercent: 30, group: 'Needs' },
  { key: 'food', label: 'Food & groceries', icon: '🥗', color: '#1D9E75', defaultPercent: 12, group: 'Needs' },
  { key: 'transport', label: 'Transport', icon: '🚗', color: '#BA7517', defaultPercent: 10, group: 'Needs' },
  { key: 'utilities', label: 'Utilities & bills', icon: '⚡', color: '#D4537E', defaultPercent: 7, group: 'Needs' },
  { key: 'health', label: 'Health & insurance', icon: '❤️', color: '#7F77DD', defaultPercent: 7, group: 'Needs' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#D85A30', defaultPercent: 5, group: 'Wants' },
  { key: 'personal', label: 'Personal & misc', icon: '👕', color: '#888780', defaultPercent: 5, group: 'Wants' },
  { key: 'savings', label: 'Savings', icon: '🐷', color: '#8BBF3A', defaultPercent: 10, group: 'Savings & investing' },
  { key: 'investing', label: 'Investing', icon: '📈', color: '#185FA5', defaultPercent: 7, group: 'Savings & investing' },
  { key: 'emergency', label: 'Emergency fund', icon: '🛡️', color: '#993556', defaultPercent: 7, group: 'Savings & investing' }
];

const currencies = {
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', rateFromAud: 1 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', rateFromAud: 0.66 },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID', rateFromAud: 12600 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR', rateFromAud: 900 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', rateFromAud: 0.61 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', rateFromAud: 0.52 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', rateFromAud: 100 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', rateFromAud: 0.89 }
};

const WORK_HOURS_PER_DAY = 8;
const WORK_DAYS_PER_WEEK = 5;
const WORK_WEEKS_PER_MONTH = 4.345;
const WORK_DAYS_PER_MONTH = WORK_DAYS_PER_WEEK * WORK_WEEKS_PER_MONTH;
  
const periods = {
  hourly: {
    label: 'Hourly',
    inputLabel: 'hourly income',
    sliderMaxMonthlyAud: 200 * WORK_HOURS_PER_DAY * WORK_DAYS_PER_MONTH,
  
    toMonthly: value =>
      value * WORK_HOURS_PER_DAY * WORK_DAYS_PER_MONTH,
  
    fromMonthly: monthly =>
      monthly / WORK_HOURS_PER_DAY / WORK_DAYS_PER_MONTH
  },

  daily: {
    label: 'Daily',
    inputLabel: 'daily income',
    sliderMaxMonthlyAud: 1500 * WORK_DAYS_PER_MONTH,
  
    toMonthly: value =>
      value * WORK_DAYS_PER_MONTH,
  
    fromMonthly: monthly =>
      monthly / WORK_DAYS_PER_MONTH
  },

  weekly: {
    label: 'Weekly',
    inputLabel: 'weekly income',
    sliderMaxMonthlyAud: 5000 * WORK_WEEKS_PER_MONTH,
  
    toMonthly: value =>
      value * WORK_WEEKS_PER_MONTH,
  
    fromMonthly: monthly =>
      monthly / WORK_WEEKS_PER_MONTH
  },

  monthly: {
    label: 'Monthly',
    inputLabel: 'monthly income',
    sliderMaxMonthlyAud: 30000,
  
    toMonthly: value => value,
  
    fromMonthly: monthly => monthly
  }
};

const presetsAudMonthly = [
  { label: 'Minimum wage', amountAud: 1256 },
  { label: 'Below average', amountAud: 2500 },
  { label: 'Average', amountAud: 3500 },
  { label: 'Above average', amountAud: 6000 },
  { label: 'High earner', amountAud: 10000 }
];

const state = {
  baseCurrency: 'AUD',
  selectedCurrency: 'AUD',
  incomeMonthlyAud: 3500,
  currentPeriod: 'monthly',
  rawIncomeInput: 3500,
  percentages: Object.fromEntries(categories.map(category => [category.key, category.defaultPercent])),
  activePresetAmountAud: null
};

const elements = {
  currencySelect: document.getElementById('currencySelect'),
  currencyNote: document.getElementById('currencyNote'),
  periodTabs: document.getElementById('periodTabs'),
  incomeLabel: document.getElementById('incomeLabel'),
  incomePrefix: document.getElementById('incomePrefix'),
  incomeInput: document.getElementById('incomeInput'),
  incomeSlider: document.getElementById('incomeSlider'),
  conversionChips: document.getElementById('conversionChips'),
  presetGrid: document.getElementById('presetGrid'),
  statusPill: document.getElementById('statusPill'),
  statusText: document.getElementById('statusText'),
  tipsContent: document.getElementById('tipsContent'),
  stackedBar: document.getElementById('stackedBar'),
  legendRow: document.getElementById('legendRow'),
  snapshotGrid: document.getElementById('snapshotGrid'),
  groups: document.getElementById('groups'),
  resetButton: document.getElementById('resetButton')
};

function getCurrency() {
  return currencies[state.selectedCurrency];
}

function audToSelected(amountAud) {
  return amountAud * getCurrency().rateFromAud;
}

function selectedToAud(amountSelected) {
  return amountSelected / getCurrency().rateFromAud;
}

function formatMoney(amountAud, options = {}) {
  const currency = getCurrency();
  const amount = audToSelected(amountAud);
  const hasDecimals = options.decimals ?? Math.abs(amount) < 1000;
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: hasDecimals ? 2 : 0,
    minimumFractionDigits: hasDecimals ? 2 : 0
  }).format(amount);
}

function getTotalPercentage() {
  return categories.reduce((total, category) => total + state.percentages[category.key], 0);
}

function getMonthlyIncomeSelected() {
  return audToSelected(state.incomeMonthlyAud);
}

function getCategoryAmountAud(categoryKey) {
  return state.incomeMonthlyAud * state.percentages[categoryKey] / 100;
}

function getConversions(monthlyIncomeAud) {
  return {
    hourly:
      monthlyIncomeAud /
      WORK_HOURS_PER_DAY /
      WORK_DAYS_PER_MONTH,
  
    daily:
      monthlyIncomeAud /
      WORK_DAYS_PER_MONTH,
  
    weekly:
      monthlyIncomeAud /
      WORK_WEEKS_PER_MONTH,
  
    monthly: monthlyIncomeAud,
  
    annual: monthlyIncomeAud * 12
  };
}

function getRawValueForPeriod(monthlyIncomeAud, periodKey) {
  const rawAud = periods[periodKey].fromMonthly(monthlyIncomeAud);
  return Math.round(audToSelected(rawAud) * 100) / 100;
}

function getTips(monthlyIncomeAud) {
  if (monthlyIncomeAud <= 1500) {
    return [
      'Prioritize rent, food, transport, and a small emergency buffer first.',
      'Look for housing assistance, food support, and utility relief if available.',
      'Start with a small saving habit, even if it is only a small amount per month.',
      'Cooking at home and using public transport can reduce your biggest expenses.'
    ];
  }
  if (monthlyIncomeAud <= 3500) {
    return [
      'Try to keep housing near or below 30% of your monthly income.',
      'Build at least 1 month of expenses before focusing heavily on investing.',
      'Track every expense for 30 days to understand where your money actually goes.',
      'Use automatic transfers so saving happens before spending.'
    ];
  }
  if (monthlyIncomeAud <= 7000) {
    return [
      'A 50/30/20 structure can work well: 50% needs, 30% wants, and 20% saving or investing.',
      'Build a 3–6 month emergency fund before taking bigger investment risks.',
      'Increase investing gradually when your rent and debt payments are under control.',
      'Avoid lifestyle creep by increasing your savings rate when income grows.'
    ];
  }
  return [
    'At this income level, lifestyle creep is usually the biggest risk.',
    'Lock your savings and investing percentage before increasing luxury spending.',
    'Consider tax-efficient retirement or investment accounts where available.',
    'A one-time session with a qualified financial planner may be useful.'
  ];
}

function renderCurrencySelector() {
  elements.currencySelect.innerHTML = Object.values(currencies).map(currency => `
    <option value="${currency.code}" ${state.selectedCurrency === currency.code ? 'selected' : ''}>
      ${currency.code} — ${currency.name}
    </option>
  `).join('');
  elements.currencyNote.textContent = state.selectedCurrency === state.baseCurrency
    ? 'Base currency: AUD'
    : `Converted from AUD using fixed demo rate: 1 AUD ≈ ${currencies[state.selectedCurrency].rateFromAud.toLocaleString()} ${state.selectedCurrency}`;
}

function renderPeriodTabs() {
  elements.periodTabs.innerHTML = Object.entries(periods).map(([key, period]) => `
    <button
      type="button"
      class="period-tab ${state.currentPeriod === key ? 'active' : ''}"
      data-period="${key}"
      role="tab"
      aria-selected="${state.currentPeriod === key}"
    >${period.label}</button>
  `).join('');
}

function renderPresets() {
  elements.presetGrid.innerHTML = presetsAudMonthly.map(preset => `
    <button
      type="button"
      class="preset-btn ${state.activePresetAmountAud === preset.amountAud ? 'active' : ''}"
      data-preset="${preset.amountAud}"
    >
      <span class="p-name">${preset.label}</span>
      <span class="p-val">~${formatMoney(preset.amountAud, { decimals: false })}/mo</span>
    </button>
  `).join('');
}

function renderIncomeControls() {
  const currentPeriod = periods[state.currentPeriod];
  const sliderMaxAudRaw = currentPeriod.fromMonthly(currentPeriod.sliderMaxMonthlyAud);
  const sliderMaxSelectedRaw = audToSelected(sliderMaxAudRaw);
  elements.incomePrefix.textContent = getCurrency().symbol;
  elements.incomeLabel.textContent = 'Enter ' + currentPeriod.inputLabel;
  elements.incomeInput.value = Math.round(state.rawIncomeInput);
  elements.incomeSlider.max = Math.round(sliderMaxSelectedRaw);
  elements.incomeSlider.step = state.selectedCurrency === 'IDR' || state.selectedCurrency === 'KRW' || state.selectedCurrency === 'JPY' ? 1000 : 50;
  elements.incomeSlider.value = state.rawIncomeInput;
}

function renderConversions() {
  const conversionsAud = getConversions(state.incomeMonthlyAud);
  const conversionItems = [
    { key: 'hourly', label: 'Per hour', valueAud: conversionsAud.hourly },
    { key: 'daily', label: 'Per day', valueAud: conversionsAud.daily },
    { key: 'weekly', label: 'Per week', valueAud: conversionsAud.weekly },
    { key: 'monthly', label: 'Per month', valueAud: conversionsAud.monthly },
    { key: 'annual', label: 'Per year', valueAud: conversionsAud.annual }
  ].filter(item => item.key !== state.currentPeriod);
  elements.conversionChips.innerHTML = conversionItems.map(item => `
    <div class="conv-chip">
      <div class="conv-chip-label">${item.label}</div>
      <div class="conv-chip-val">${formatMoney(item.valueAud)}</div>
    </div>
  `).join('');
}

function renderStatus() {
  const totalPercentage = getTotalPercentage();
  const remainingPercentage = 100 - totalPercentage;
  if (remainingPercentage > 0) {
    elements.statusPill.className = 'status-pill status-ok';
    elements.statusText.textContent = `${remainingPercentage}% unallocated — ${formatMoney(state.incomeMonthlyAud * remainingPercentage / 100)}/mo free`;
    return;
  }
  if (remainingPercentage === 0) {
    elements.statusPill.className = 'status-pill status-ok';
    elements.statusText.textContent = '100% allocated — perfectly balanced';
    return;
  }
  elements.statusPill.className = 'status-pill status-over';
  elements.statusText.textContent = `Over budget by ${Math.abs(remainingPercentage)}% — reduce some categories`;
}

function renderAllocationBar() {
  elements.stackedBar.innerHTML = categories.map(category => `
    <div
      class="bar-seg"
      style="width:${state.percentages[category.key]}%; background:${category.color}"
      title="${category.label}: ${state.percentages[category.key]}%"
    ></div>
  `).join('');
  elements.legendRow.innerHTML = categories.map(category => `
    <span class="legend-item">
      <span class="legend-dot" style="background:${category.color}"></span>
      ${category.label} ${state.percentages[category.key]}%
    </span>
  `).join('');
}

function getGroupPercentage(groupName) {
  return categories
    .filter(category => category.group === groupName)
    .reduce((total, category) => total + state.percentages[category.key], 0);
}

function renderSnapshot() {
  const needs = getGroupPercentage('Needs');
  const wants = getGroupPercentage('Wants');
  const savings = getGroupPercentage('Savings & investing');
  const totalPercentage = getTotalPercentage();
  const unallocated = Math.max(0, 100 - totalPercentage);
  const cards = [
    { label: 'Needs', value: formatMoney(state.incomeMonthlyAud * needs / 100), sub: `${needs}% · /mo` },
    { label: 'Wants', value: formatMoney(state.incomeMonthlyAud * wants / 100), sub: `${wants}% · /mo` },
    { label: 'Saved & invested', value: formatMoney(state.incomeMonthlyAud * savings / 100), sub: `${savings}% · /mo`, accent: true },
    { label: 'Total allocated', value: `${totalPercentage}%`, sub: `${formatMoney(state.incomeMonthlyAud * totalPercentage / 100)} /mo`, danger: totalPercentage > 100 },
    { label: 'Unallocated', value: formatMoney(state.incomeMonthlyAud * unallocated / 100), sub: `${unallocated}% buffer` },
    { label: 'Annual savings', value: formatMoney(state.incomeMonthlyAud * savings / 100 * 12), sub: 'projected/year' }
  ];
  elements.snapshotGrid.innerHTML = cards.map(card => `
    <div class="metric ${card.accent ? 'accent-card' : ''}">
      <div class="metric-label">${card.label}</div>
      <div class="metric-val" style="${card.danger ? 'color:var(--danger)' : ''}">${card.value}</div>
      <div class="metric-sub">${card.sub}</div>
    </div>
  `).join('');
}

function renderTips() {
  elements.tipsContent.innerHTML = getTips(state.incomeMonthlyAud)
    .map(tip => `<div class="tip-item">${tip}</div>`)
    .join('');
}

function renderGroups() {
  const groupNames = ['Needs', 'Wants', 'Savings & investing'];
  elements.groups.innerHTML = groupNames.map(groupName => {
    const groupCategories = categories.filter(category => category.group === groupName);
    const groupPercent = getGroupPercentage(groupName);
    const groupAmount = formatMoney(state.incomeMonthlyAud * groupPercent / 100);
    return `
      <div class="group-block">
        <div class="group-header">
          <span class="group-title">${groupName}</span>
          <span class="group-total" id="gtot-${groupName.replace(/[^a-z]/gi, '')}">
            ${groupPercent}% · ${groupAmount}
          </span>
        </div>
        ${groupCategories.map(category => `
          <div class="cat-row" id="row-${category.key}">
            <div class="cat-top">
              <span class="cat-icon">${category.icon}</span>
              <span class="cat-name">${category.label}</span>
              <div class="cat-pct-wrap">
                <input
                  type="number"
                  class="cat-pct-input"
                  id="pct-${category.key}"
                  min="0"
                  max="100"
                  step="1"
                  value="${state.percentages[category.key]}"
                  data-category-input="${category.key}"
                  style="border-color:${category.color}33"
                  aria-label="${category.label} percentage"
                />
                <span class="cat-pct-suffix">%</span>
              </div>
              <div class="cat-money-wrap">
                <span class="cat-money-prefix">${getCurrency().symbol}</span>
                <input
                  type="number"
                  class="cat-money-input"
                  min="0"
                  step="1"
                  value="${Math.round(audToSelected(getCategoryAmountAud(category.key)))}"
                  data-category-money="${category.key}"
                  aria-label="${category.label} monthly amount"
                />
              </div>
            </div>
            <div class="cat-slider-row">
              <input
                type="range"
                class="cat-sl"
                id="sl-${category.key}"
                min="0"
                max="60"
                step="1"
                value="${state.percentages[category.key]}"
                data-category-slider="${category.key}"
                aria-label="${category.label} slider"
              />
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function renderCategoryStyles() {
  const style = document.createElement('style');
  style.textContent = categories.map(category => `
    #sl-${category.key}::-webkit-slider-thumb {
      background: ${category.color};
      width: 13px;
      height: 13px;
    }
    #pct-${category.key}:focus {
      border-color: ${category.color}88 !important;
    }
  `).join('\n');
  document.head.appendChild(style);
}

function render() {
  renderCurrencySelector();
  renderPeriodTabs();
  renderPresets();
  renderIncomeControls();
  renderConversions();
  renderStatus();
  renderAllocationBar();
  renderSnapshot();
  renderTips();

  updateCategoryValues();
}

function updateCategoryValues() {
  categories.forEach(category => {
    const percentInput = document.getElementById(`pct-${category.key}`);
    const slider = document.getElementById(`sl-${category.key}`);
    const moneyInput = document.querySelector(`[data-category-money="${category.key}"]`);

    const percent = state.percentages[category.key];
    const amount = Math.round(audToSelected(getCategoryAmountAud(category.key)));

    if (percentInput && document.activeElement !== percentInput) {
      percentInput.value = percent;
    }

    if (slider && document.activeElement !== slider) {
      slider.value = percent;
    }

    if (moneyInput && document.activeElement !== moneyInput) {
      moneyInput.value = amount;
    }
  });

  ['Needs', 'Wants', 'Savings & investing'].forEach(groupName => {
    const groupId = groupName.replace(/[^a-z]/gi, '');
    const groupTotalElement = document.getElementById(`gtot-${groupId}`);

    if (!groupTotalElement) return;

    const groupPercent = getGroupPercentage(groupName);
    const groupAmount = formatMoney(state.incomeMonthlyAud * groupPercent / 100);

    groupTotalElement.textContent = `${groupPercent}% · ${groupAmount}`;
  });
}

function setIncomeFromRawValue(value) {
  const selectedRawValue = Number.parseFloat(value) || 0;
  const rawAudValue = selectedToAud(selectedRawValue);
  state.rawIncomeInput = selectedRawValue;
  state.incomeMonthlyAud = periods[state.currentPeriod].toMonthly(rawAudValue);
  state.activePresetAmountAud = null;
  render();
}

function setPeriod(periodKey) {
  state.currentPeriod = periodKey;
  state.rawIncomeInput = getRawValueForPeriod(state.incomeMonthlyAud, periodKey);
  render();
}

function setCurrency(currencyCode) {
  state.selectedCurrency = currencyCode;
  state.rawIncomeInput = getRawValueForPeriod(state.incomeMonthlyAud, state.currentPeriod);
  render();
}

function applyPreset(monthlyAmountAud) {
  state.incomeMonthlyAud = monthlyAmountAud;
  state.rawIncomeInput = getRawValueForPeriod(monthlyAmountAud, state.currentPeriod);
  state.activePresetAmountAud = monthlyAmountAud;
  render();
}

function updateCategoryPercentage(categoryKey, value) {
  const safeValue = Math.min(100, Math.max(0, Number.parseInt(value, 10) || 0));
  state.percentages[categoryKey] = safeValue;
  render();
}

function updateCategoryAmount(categoryKey, amountSelected) {
  const amountAud = selectedToAud(Number.parseFloat(amountSelected) || 0);
  const monthlyIncome = state.incomeMonthlyAud;
  if (monthlyIncome <= 0) {
    state.percentages[categoryKey] = 0;
  } else {
    state.percentages[categoryKey] = Math.round((amountAud / monthlyIncome) * 100);
  }
  render();
}

function resetDefaults() {
  state.selectedCurrency = 'AUD';
  state.incomeMonthlyAud = 3500;
  state.currentPeriod = 'monthly';
  state.rawIncomeInput = 3500;
  state.activePresetAmountAud = null;
  state.percentages = Object.fromEntries(categories.map(category => [category.key, category.defaultPercent]));
  render();
}

async function getYahooExchangeRate(fromCurrency, toCurrency) {
  try {
    const symbol = `${fromCurrency}${toCurrency}=X`;
  
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
  
    const data = await response.json();
  
    const result = data?.chart?.result?.[0];
  
    if (!result) {
      throw new Error("Invalid Yahoo Finance response");
    }
  
    return {
      rate: result.meta.regularMarketPrice
    };
  
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return null;
  }
}

async function updateCurrencyRates() {
  const audToUsd = await getYahooExchangeRate("AUD", "USD");
  const audToIdr = await getYahooExchangeRate("AUD", "IDR");
  const audToKrw = await getYahooExchangeRate("AUD", "KRW");
  const audToJpy = await getYahooExchangeRate("AUD", "JPY");
  const audToEur = await getYahooExchangeRate("AUD", "EUR");
  const audToGbp = await getYahooExchangeRate("AUD", "GBP");
  const audToSgd = await getYahooExchangeRate("AUD", "SGD");

  if (audToUsd) currencies.USD.rateFromAud = audToUsd.rate;
  if (audToIdr) currencies.IDR.rateFromAud = audToIdr.rate;
  if (audToKrw) currencies.KRW.rateFromAud = audToKrw.rate;
  if (audToJpy) currencies.JPY.rateFromAud = audToJpy.rate;
  if (audToEur) currencies.EUR.rateFromAud = audToEur.rate;
  if (audToGbp) currencies.GBP.rateFromAud = audToGbp.rate;
  if (audToSgd) currencies.SGD.rateFromAud = audToSgd.rate;

  render();
}

elements.currencySelect.addEventListener('change', event => {
  setCurrency(event.target.value);
});

elements.periodTabs.addEventListener('click', event => {
  const button = event.target.closest('[data-period]');
  if (!button) return;
  setPeriod(button.dataset.period);
});

elements.presetGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  applyPreset(Number(button.dataset.preset));
});

elements.incomeInput.addEventListener('input', event => {
  setIncomeFromRawValue(event.target.value);
});

elements.incomeSlider.addEventListener('input', event => {
  setIncomeFromRawValue(event.target.value);
});

elements.groups.addEventListener('input', event => {
  const categoryFromSlider = event.target.dataset.categorySlider;
  const categoryFromPercentInput = event.target.dataset.categoryInput;
  const categoryFromMoneyInput = event.target.dataset.categoryMoney;
  if (categoryFromSlider || categoryFromPercentInput) {
    updateCategoryPercentage(categoryFromSlider || categoryFromPercentInput, event.target.value);
    return;
  }
  if (categoryFromMoneyInput) {
    updateCategoryAmount(categoryFromMoneyInput, event.target.value);
  }
});

elements.resetButton.addEventListener('click', resetDefaults);
window.addEventListener('load', async () => {
  renderCategoryStyles();
  renderGroups();
  render();
  await updateCurrencyRates();
});