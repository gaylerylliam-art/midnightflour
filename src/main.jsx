import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownToLine,
  Calculator,
  CircleDollarSign,
  FileSpreadsheet,
  Percent,
  Plus,
  RefreshCcw,
  Trash2,
  WalletCards,
} from "lucide-react";
import "./styles.css";

const sampleIngredients = [
  { id: 1, item: "Butter", qty: 0.75, unit: "kg", unitCost: 42 },
  { id: 2, item: "Flour", qty: 1.2, unit: "kg", unitCost: 8 },
  { id: 3, item: "Sugar", qty: 0.5, unit: "kg", unitCost: 6 },
  { id: 4, item: "Eggs", qty: 18, unit: "pcs", unitCost: 0.85 },
  { id: 5, item: "Chocolate", qty: 0.4, unit: "kg", unitCost: 54 },
];

const sampleVariables = [
  { id: 1, item: "Packaging", amount: 1.9 },
  { id: 2, item: "Labor per unit", amount: 5.5 },
  { id: 3, item: "Delivery subsidy", amount: 1.25 },
];

const productPresets = {
  crinkles: {
    name: "Crinkles Cookies",
    yield: 36,
    ingredients: [
      { id: 1, item: "Cocoa powder", qty: 0.18, unit: "kg", unitCost: 38 },
      { id: 2, item: "Flour", qty: 0.45, unit: "kg", unitCost: 8 },
      { id: 3, item: "Sugar", qty: 0.38, unit: "kg", unitCost: 6 },
      { id: 4, item: "Eggs", qty: 4, unit: "pcs", unitCost: 0.85 },
      { id: 5, item: "Butter", qty: 0.18, unit: "kg", unitCost: 42 },
      { id: 6, item: "Powdered sugar", qty: 0.12, unit: "kg", unitCost: 12 },
    ],
    variables: [
      { id: 1, item: "Cookie sleeve / box", amount: 0.65 },
      { id: 2, item: "Labor per cookie", amount: 1.15 },
      { id: 3, item: "Label / seal", amount: 0.18 },
    ],
    targetMarginPct: 42,
  },
  cheesecake9: {
    name: "Blueberry Cheesecake - 9 inch",
    yield: 1,
    ingredients: [
      { id: 1, item: "Cream cheese", qty: 1.2, unit: "kg", unitCost: 38 },
      { id: 2, item: "Digestive biscuit", qty: 0.35, unit: "kg", unitCost: 18 },
      { id: 3, item: "Butter", qty: 0.18, unit: "kg", unitCost: 42 },
      { id: 4, item: "Sugar", qty: 0.28, unit: "kg", unitCost: 6 },
      { id: 5, item: "Eggs", qty: 5, unit: "pcs", unitCost: 0.85 },
      { id: 6, item: "Blueberry topping", qty: 0.45, unit: "kg", unitCost: 42 },
      { id: 7, item: "Cream", qty: 0.25, unit: "L", unitCost: 18 },
    ],
    variables: [
      { id: 1, item: "Cake board and box", amount: 12 },
      { id: 2, item: "Labor per cake", amount: 38 },
      { id: 3, item: "Delivery cushion", amount: 5 },
    ],
    targetMarginPct: 34,
  },
  cheesecake12: {
    name: "Blueberry Cheesecake - 12 inch",
    yield: 1,
    ingredients: [
      { id: 1, item: "Cream cheese", qty: 2.1, unit: "kg", unitCost: 38 },
      { id: 2, item: "Digestive biscuit", qty: 0.6, unit: "kg", unitCost: 18 },
      { id: 3, item: "Butter", qty: 0.32, unit: "kg", unitCost: 42 },
      { id: 4, item: "Sugar", qty: 0.5, unit: "kg", unitCost: 6 },
      { id: 5, item: "Eggs", qty: 9, unit: "pcs", unitCost: 0.85 },
      { id: 6, item: "Blueberry topping", qty: 0.8, unit: "kg", unitCost: 42 },
      { id: 7, item: "Cream", qty: 0.45, unit: "L", unitCost: 18 },
    ],
    variables: [
      { id: 1, item: "Large cake board and box", amount: 18 },
      { id: 2, item: "Labor per cake", amount: 55 },
      { id: 3, item: "Delivery cushion", amount: 8 },
    ],
    targetMarginPct: 34,
  },
  muffins: {
    name: "Banana Muffins",
    yield: 12,
    ingredients: [
      { id: 1, item: "Bananas", qty: 0.65, unit: "kg", unitCost: 9 },
      { id: 2, item: "Flour", qty: 0.38, unit: "kg", unitCost: 8 },
      { id: 3, item: "Sugar", qty: 0.22, unit: "kg", unitCost: 6 },
      { id: 4, item: "Eggs", qty: 3, unit: "pcs", unitCost: 0.85 },
      { id: 5, item: "Butter", qty: 0.18, unit: "kg", unitCost: 42 },
      { id: 6, item: "Walnuts", qty: 0.12, unit: "kg", unitCost: 58 },
    ],
    variables: [
      { id: 1, item: "Muffin cup", amount: 0.35 },
      { id: 2, item: "Box share", amount: 0.75 },
      { id: 3, item: "Labor per muffin", amount: 1.8 },
    ],
    targetMarginPct: 38,
  },
  croissant: {
    name: "Chocolate Pistachio Croissant",
    yield: 24,
    ingredients: sampleIngredients,
    variables: sampleVariables,
    targetMarginPct: 35,
  },
};

const cloneRows = (rows) => rows.map((row) => ({ ...row }));
const defaultPresetKey = "crinkles";

const currency = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 2,
});

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function roundToNearest(value, increment) {
  if (!increment) return value;
  return Math.ceil(value / increment) * increment;
}

function calculate({
  batchYield,
  ingredients,
  variables,
  wastagePct,
  monthlyOverheads,
  monthlyProduction,
  overheadMode,
  customOverhead,
  platformPct,
  cardFeePct,
  targetMarginPct,
  marginMode,
  vatIncluded,
  vatPct,
  priceIncrement,
}) {
  const safeYield = Math.max(1, numberValue(batchYield));
  const ingredientBatchCost = ingredients.reduce(
    (sum, row) => sum + numberValue(row.qty) * numberValue(row.unitCost),
    0
  );
  const ingredientUnitCost = ingredientBatchCost / safeYield;
  const variableUnitCost = variables.reduce((sum, row) => sum + numberValue(row.amount), 0);
  const wastageCost = ingredientUnitCost * (numberValue(wastagePct) / 100);
  const overheadUnitCost =
    overheadMode === "custom"
      ? numberValue(customOverhead)
      : numberValue(monthlyOverheads) / Math.max(1, numberValue(monthlyProduction));
  const baseUnitCost = ingredientUnitCost + variableUnitCost + wastageCost + overheadUnitCost;
  const feePct = numberValue(platformPct) + numberValue(cardFeePct);
  const marginPct = Math.min(95, Math.max(0, numberValue(targetMarginPct))) / 100;
  const vatRate = vatIncluded ? numberValue(vatPct) / 100 : 0;
  let suggestedBeforeVat;

  if (marginMode === "markup") {
    suggestedBeforeVat = baseUnitCost * (1 + marginPct);
  } else {
    suggestedBeforeVat = baseUnitCost / Math.max(0.05, 1 - marginPct - feePct / 100);
  }

  const suggestedGross = roundToNearest(suggestedBeforeVat * (1 + vatRate), numberValue(priceIncrement));
  const sellingBeforeVat = suggestedGross / (1 + vatRate);
  const sellingFees = sellingBeforeVat * (feePct / 100);
  const profit = sellingBeforeVat - baseUnitCost - sellingFees;
  const margin = sellingBeforeVat > 0 ? profit / sellingBeforeVat : 0;
  const breakEven = baseUnitCost / Math.max(0.05, 1 - feePct / 100);

  return {
    ingredientBatchCost,
    ingredientUnitCost,
    variableUnitCost,
    wastageCost,
    overheadUnitCost,
    baseUnitCost,
    sellingFees,
    suggestedGross,
    sellingBeforeVat,
    profit,
    margin,
    breakEven,
  };
}

function excelText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excelNumber(value) {
  return Number(value || 0).toFixed(2);
}

function fileNameForProduct(product) {
  const cleanName = String(product || "pastry-product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${cleanName || "pastry-product"}-pricing.xls`;
}

function renderExcelTable(title, headers, rows) {
  const headerCells = headers.map((header) => `<th>${excelText(header)}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${excelText(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `
    <h2>${excelText(title)}</h2>
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

function downloadExcelReport({ product, batchYield, ingredients, variables, settings, totals, costParts, scenarios }) {
  const summaryRows = [
    ["Product", product],
    ["Batch Yield", batchYield],
    ["Unit Cost", excelNumber(totals.baseUnitCost)],
    ["Suggested Price", excelNumber(totals.suggestedGross)],
    ["Expected Profit", excelNumber(totals.profit)],
    ["Net Margin %", excelNumber(totals.margin * 100)],
    ["Break-even Price", excelNumber(totals.breakEven)],
    ["Batch Ingredient Cost", excelNumber(totals.ingredientBatchCost)],
  ];

  const settingRows = [
    ["VAT enabled", settings.vatIncluded ? "Yes" : "No"],
    ["VAT rate %", settings.vatPct],
    ["Card fee %", settings.cardFeePct],
    ["Delivery / marketplace fee %", settings.platformPct],
    ["Wastage buffer %", settings.wastagePct],
    ["Overhead mode", settings.overheadMode],
    ["Monthly overheads AED", settings.monthlyOverheads],
    ["Monthly production pcs", settings.monthlyProduction],
    ["Custom overhead per unit AED", settings.customOverhead],
    ["Margin mode", settings.marginMode],
    ["Target %", settings.targetMarginPct],
    ["Round price to AED", settings.priceIncrement],
  ];

  const ingredientRows = ingredients.map((row) => [
    row.item,
    row.qty,
    row.unit,
    excelNumber(row.unitCost),
    excelNumber(numberValue(row.qty) * numberValue(row.unitCost)),
  ]);

  const variableRows = variables.map((row) => [
    row.item,
    excelNumber(row.amount),
  ]);

  const costRows = costParts.map(([label, amount]) => [label, excelNumber(amount)]);
  const scenarioRows = scenarios.map((scenario) => [
    scenario.label,
    excelNumber(scenario.grossPrice),
    excelNumber(scenario.profit),
    excelNumber(scenario.margin * 100),
  ]);

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #20231f; }
          h1 { font-size: 22px; }
          h2 { margin-top: 22px; font-size: 16px; color: #805111; }
          table { border-collapse: collapse; margin-bottom: 12px; min-width: 560px; }
          th { background: #e9ede3; font-weight: 700; }
          th, td { border: 1px solid #cfd6c8; padding: 7px 9px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Midnight Flour Pricing - ${excelText(product)}</h1>
        ${renderExcelTable("Pricing Summary", ["Metric", "Value"], summaryRows)}
        ${renderExcelTable("Ingredient Costs", ["Ingredient", "Qty", "Unit", "AED / unit", "Total AED"], ingredientRows)}
        ${renderExcelTable("Direct Variable Costs", ["Cost", "AED / unit"], variableRows)}
        ${renderExcelTable("Dubai Settings", ["Setting", "Value"], settingRows)}
        ${renderExcelTable("Cost Breakdown", ["Cost type", "AED / unit"], costRows)}
        ${renderExcelTable("Price Scenarios", ["Scenario", "Selling price AED", "Profit AED", "Margin %"], scenarioRows)}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileNameForProduct(product);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const defaultPreset = productPresets[defaultPresetKey];
  const [presetKey, setPresetKey] = useState(defaultPresetKey);
  const [product, setProduct] = useState(defaultPreset.name);
  const [batchYield, setBatchYield] = useState(defaultPreset.yield);
  const [ingredients, setIngredients] = useState(cloneRows(defaultPreset.ingredients));
  const [variables, setVariables] = useState(cloneRows(defaultPreset.variables));
  const [settings, setSettings] = useState({
    wastagePct: 8,
    monthlyOverheads: 16500,
    monthlyProduction: 2800,
    overheadMode: "monthly",
    customOverhead: 4.25,
    platformPct: 0,
    cardFeePct: 2.5,
    targetMarginPct: defaultPreset.targetMarginPct,
    marginMode: "margin",
    vatIncluded: true,
    vatPct: 5,
    priceIncrement: 0.5,
  });

  const totals = useMemo(
    () => calculate({ batchYield, ingredients, variables, ...settings }),
    [batchYield, ingredients, variables, settings]
  );

  const scenarios = [-15, -5, 0, 10, 20].map((change) => {
    const grossPrice = Math.max(0, totals.suggestedGross * (1 + change / 100));
    const beforeVat = grossPrice / (settings.vatIncluded ? 1 + settings.vatPct / 100 : 1);
    const fees = beforeVat * ((settings.platformPct + settings.cardFeePct) / 100);
    const profit = beforeVat - totals.baseUnitCost - fees;
    return {
      label: change === 0 ? "Suggested" : `${change > 0 ? "+" : ""}${change}%`,
      grossPrice,
      profit,
      margin: beforeVat ? profit / beforeVat : 0,
    };
  });

  const updateIngredient = (id, field, value) => {
    setIngredients((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateVariable = (id, field, value) => {
    setVariables((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const loadPreset = (key) => {
    const nextPreset = productPresets[key];
    if (!nextPreset) {
      setPresetKey("custom");
      return;
    }
    setPresetKey(key);
    setProduct(nextPreset.name);
    setBatchYield(nextPreset.yield);
    setIngredients(cloneRows(nextPreset.ingredients));
    setVariables(cloneRows(nextPreset.variables));
    setSettings((state) => ({ ...state, targetMarginPct: nextPreset.targetMarginPct }));
  };

  const resetSample = () => {
    const currentPreset = productPresets[presetKey] || productPresets[defaultPresetKey];
    setProduct(currentPreset.name);
    setBatchYield(currentPreset.yield);
    setIngredients(cloneRows(currentPreset.ingredients));
    setVariables(cloneRows(currentPreset.variables));
    setSettings({
      wastagePct: 8,
      monthlyOverheads: 16500,
      monthlyProduction: 2800,
      overheadMode: "monthly",
      customOverhead: 4.25,
      platformPct: 0,
      cardFeePct: 2.5,
      targetMarginPct: currentPreset.targetMarginPct,
      marginMode: "margin",
      vatIncluded: true,
      vatPct: 5,
      priceIncrement: 0.5,
    });
  };

  const costParts = [
    ["Ingredients", totals.ingredientUnitCost],
    ["Direct variable", totals.variableUnitCost],
    ["Wastage", totals.wastageCost],
    ["Overhead", totals.overheadUnitCost],
    ["Selling fees", totals.sellingFees],
  ];
  const maxPart = Math.max(...costParts.map((part) => part[1]), 1);

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Calculator size={22} /></div>
          <div>
            <h1>Midnight Flour Pricing</h1>
            <p>Dubai pastry cost-price calculator</p>
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="ghost" onClick={resetSample}>
            <RefreshCcw size={16} /> Reset
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => downloadExcelReport({ product, batchYield, ingredients, variables, settings, totals, costParts, scenarios })}
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button type="button" className="primary" onClick={() => window.print()}>
            <ArrowDownToLine size={16} /> Print
          </button>
        </div>
      </header>

      <section className="kpis" aria-label="Pricing summary">
        <Kpi icon={<WalletCards />} label="Unit Cost" value={currency.format(totals.baseUnitCost)} />
        <Kpi icon={<CircleDollarSign />} label="Suggested Price" value={currency.format(totals.suggestedGross)} />
        <Kpi icon={<Percent />} label="Expected Profit" value={currency.format(totals.profit)} positive={totals.profit >= 0} />
        <Kpi label="Net Margin" value={`${(totals.margin * 100).toFixed(1)}%`} positive={totals.margin >= 0.2} />
        <Kpi label="Break-even" value={currency.format(totals.breakEven)} />
      </section>

      <div className="workspace">
        <aside className="rail panel">
          <SectionTitle title="Product" />
          <label>
            Sample product
            <select value={presetKey} onChange={(event) => loadPreset(event.target.value)}>
              <option value="crinkles">Crinkles Cookies</option>
              <option value="cheesecake9">Blueberry Cheesecake - 9 inch</option>
              <option value="cheesecake12">Blueberry Cheesecake - 12 inch</option>
              <option value="muffins">Banana Muffins</option>
              <option value="croissant">Chocolate Pistachio Croissant</option>
              <option value="custom">Custom product</option>
            </select>
          </label>
          <label>
            Product name
            <input value={product} onChange={(event) => {
              setProduct(event.target.value);
              setPresetKey("custom");
            }} />
          </label>
          <label>
            Batch Yield
            <div className="unit-input">
              <input type="number" min="1" value={batchYield} onChange={(event) => setBatchYield(event.target.value)} />
              <span>pcs</span>
            </div>
          </label>
          <div className="hint">
            Batch ingredient costs are divided by yield. Direct variable costs are treated per pastry.
          </div>

          <SectionTitle title="Dubai Settings" />
          <ToggleRow
            label="VAT 5%"
            active={settings.vatIncluded}
            onClick={() => setSettings((state) => ({ ...state, vatIncluded: !state.vatIncluded }))}
          />
          <NumberSetting label="VAT rate" suffix="%" value={settings.vatPct} onChange={(vatPct) => setSettings((state) => ({ ...state, vatPct }))} />
          <NumberSetting label="Card fee" suffix="%" value={settings.cardFeePct} onChange={(cardFeePct) => setSettings((state) => ({ ...state, cardFeePct }))} />
          <NumberSetting label="Delivery / marketplace fee" suffix="%" value={settings.platformPct} onChange={(platformPct) => setSettings((state) => ({ ...state, platformPct }))} />
          <NumberSetting label="Round price to" suffix="AED" value={settings.priceIncrement} onChange={(priceIncrement) => setSettings((state) => ({ ...state, priceIncrement }))} step="0.25" />
        </aside>

        <section className="panel main-panel">
          <div className="panel-head">
            <SectionTitle title="Ingredient Costs" subtitle={`${product || "Pastry product"} batch`} />
            <button
              type="button"
              className="small"
              onClick={() => setIngredients((rows) => [...rows, { id: Date.now(), item: "New item", qty: 1, unit: "kg", unitCost: 0 }])}
            >
              <Plus size={15} /> Add
            </button>
          </div>
          <EditableTable
            rows={ingredients}
            columns={[
              ["item", "Ingredient", "text"],
              ["qty", "Qty", "number"],
              ["unit", "Unit", "text"],
              ["unitCost", "AED / unit", "number"],
            ]}
            update={updateIngredient}
            remove={(id) => setIngredients((rows) => rows.filter((row) => row.id !== id))}
            total={(row) => numberValue(row.qty) * numberValue(row.unitCost)}
          />

          <div className="split">
            <div>
              <div className="panel-head compact">
                <SectionTitle title="Direct Variable Costs" />
                <button
                  type="button"
                  className="small"
                  onClick={() => setVariables((rows) => [...rows, { id: Date.now(), item: "New cost", amount: 0 }])}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
              <EditableTable
                rows={variables}
                columns={[
                  ["item", "Cost", "text"],
                  ["amount", "AED / unit", "number"],
                ]}
                update={updateVariable}
                remove={(id) => setVariables((rows) => rows.filter((row) => row.id !== id))}
                total={(row) => numberValue(row.amount)}
              />
            </div>

            <div className="settings-box">
              <SectionTitle title="Overhead Allocation" />
              <div className="segment">
                <button className={settings.overheadMode === "monthly" ? "active" : ""} onClick={() => setSettings((state) => ({ ...state, overheadMode: "monthly" }))}>Monthly</button>
                <button className={settings.overheadMode === "custom" ? "active" : ""} onClick={() => setSettings((state) => ({ ...state, overheadMode: "custom" }))}>Per unit</button>
              </div>
              {settings.overheadMode === "monthly" ? (
                <>
                  <NumberSetting label="Monthly overheads" suffix="AED" value={settings.monthlyOverheads} onChange={(monthlyOverheads) => setSettings((state) => ({ ...state, monthlyOverheads }))} />
                  <NumberSetting label="Monthly production" suffix="pcs" value={settings.monthlyProduction} onChange={(monthlyProduction) => setSettings((state) => ({ ...state, monthlyProduction }))} />
                </>
              ) : (
                <NumberSetting label="Overhead per unit" suffix="AED" value={settings.customOverhead} onChange={(customOverhead) => setSettings((state) => ({ ...state, customOverhead }))} />
              )}
              <NumberSetting label="Wastage buffer" suffix="%" value={settings.wastagePct} onChange={(wastagePct) => setSettings((state) => ({ ...state, wastagePct }))} />
              <div className="segment">
                <button className={settings.marginMode === "margin" ? "active" : ""} onClick={() => setSettings((state) => ({ ...state, marginMode: "margin" }))}>Margin</button>
                <button className={settings.marginMode === "markup" ? "active" : ""} onClick={() => setSettings((state) => ({ ...state, marginMode: "markup" }))}>Markup</button>
              </div>
              <NumberSetting label="Target" suffix="%" value={settings.targetMarginPct} onChange={(targetMarginPct) => setSettings((state) => ({ ...state, targetMarginPct }))} />
            </div>
          </div>
        </section>

        <aside className="panel insights">
          <SectionTitle title="Expected Profit" subtitle="AED per pastry" />
          <div className="profit-number">{currency.format(totals.profit)}</div>
          <div className="mini-grid">
            <span>Cost before fees</span><b>{currency.format(totals.baseUnitCost)}</b>
            <span>VAT collected</span><b>{settings.vatIncluded ? currency.format(totals.suggestedGross - totals.sellingBeforeVat) : currency.format(0)}</b>
            <span>Selling fees</span><b>{currency.format(totals.sellingFees)}</b>
            <span>Batch ingredient cost</span><b>{currency.format(totals.ingredientBatchCost)}</b>
          </div>

          <SectionTitle title="Cost Breakdown" />
          <div className="bars">
            {costParts.map(([label, amount]) => (
              <div className="bar-row" key={label}>
                <div className="bar-label"><span>{label}</span><b>{currency.format(amount)}</b></div>
                <div className="track"><span style={{ width: `${Math.max(5, (amount / maxPart) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="panel scenarios">
        <SectionTitle title="Price Scenarios" subtitle="VAT-inclusive AED prices, where VAT is enabled" />
        <div className="scenario-grid">
          {scenarios.map((scenario) => (
            <div className="scenario" key={scenario.label}>
              <span>{scenario.label}</span>
              <strong>{currency.format(scenario.grossPrice)}</strong>
              <small className={scenario.profit >= 0 ? "good" : "bad"}>
                {currency.format(scenario.profit)} profit - {(scenario.margin * 100).toFixed(1)}%
              </small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

function Kpi({ icon, label, value, positive }) {
  return (
    <article className={`kpi ${positive === false ? "risk" : positive ? "ok" : ""}`}>
      <div className="kpi-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ToggleRow({ label, active, onClick }) {
  return (
    <button type="button" className="toggle-row" onClick={onClick}>
      <span>{label}</span>
      <i className={active ? "on" : ""} />
    </button>
  );
}

function NumberSetting({ label, suffix, value, onChange, step = "0.1" }) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      <div className="unit-input">
        <input type="number" step={step} value={value} onChange={(event) => onChange(numberValue(event.target.value))} />
        <em>{suffix}</em>
      </div>
    </label>
  );
}

function EditableTable({ rows, columns, update, remove, total }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column[0]}>{column[1]}</th>)}
            <th>Total</th>
            <th aria-label="Remove" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map(([field, , type]) => (
                <td key={field}>
                  <input
                    type={type}
                    value={row[field]}
                    step={type === "number" ? "0.01" : undefined}
                    onChange={(event) => update(row.id, field, type === "number" ? numberValue(event.target.value) : event.target.value)}
                  />
                </td>
              ))}
              <td className="row-total">{currency.format(total(row))}</td>
              <td>
                <button type="button" className="icon-btn" onClick={() => remove(row.id)} aria-label="Remove row">
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
