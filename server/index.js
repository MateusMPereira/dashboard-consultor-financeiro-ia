import express from "express";
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(express.json({ limit: "5mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "..", "dist")));

const normalizePhone = (raw) => {
  if (!raw) return null;
  return String(raw).replace(/\D/g, "");
};

const buildQuickChartPie = (labels, values, colors, title) => {
  const cfg = {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors }],
    },
    options: {
      plugins: { title: { display: !!title, text: title, font: { size: 16 } } },
    },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(cfg))}`;
};

const buildQuickChartLine = (labels, datasets, title) => {
  const cfg = { type: "line", data: { labels, datasets }, options: { plugins: { title: { display: !!title, text: title } } } };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(cfg))}`;
};

app.post("/api/report", async (req, res) => {
  try {
    const phoneRaw = req.body?.phone || req.query?.phone;
    const phone = normalizePhone(phoneRaw);
    if (!phone) return res.status(400).json({ error: "Número de telefone inválido" });

    // Find user by whatsapp_numero
    const { data: user, error: userError } = await supabase.from("usuarios").select("*").eq("whatsapp_numero", phone).maybeSingle();
    if (userError || !user) return res.status(400).json({ error: "Usuário não encontrado" });

    // Find company and ensure active
    const { data: empresa, error: empresaError } = await supabase.from("empresas").select("*").eq("id", user.empresa_id).eq("ativo", true).maybeSingle();
    if (empresaError || !empresa) return res.status(400).json({ error: "Empresa não encontrada ou inativa" });

    // Prepare dates
    const today = new Date();
    const selectedDate = today;
    const currentMonthStart = format(startOfMonth(selectedDate), "yyyy-MM-dd");
    const currentMonthEnd = format(endOfMonth(selectedDate), "yyyy-MM-dd");
    const previousMonthStart = format(startOfMonth(subMonths(selectedDate, 1)), "yyyy-MM-dd");
    const previousMonthEnd = format(endOfMonth(subMonths(selectedDate, 1)), "yyyy-MM-dd");

    // Fetch lancamentos for cards and pies (previousMonthStart .. currentMonthEnd)
    const { data: lancamentosCP, error: lancError } = await supabase
      .from("lancamentos")
      .select("*, subcategorias(*, categorias(*))")
      .eq("empresa_id", empresa.id)
      .gte("data_referencia", previousMonthStart)
      .lte("data_referencia", currentMonthEnd);

    if (lancError) return res.status(400).json({ error: "Erro ao buscar lançamentos" });

    const allLancamentos = (lancamentosCP || []).map((item) => ({ ...item, tipo: item.subcategorias?.categorias?.natureza || "despesa" }));

    // Compute metrics (simplified, same logic as frontend)
    let netIncomes = 0;
    let previousNetIncomes = 0;
    let totalCMV = 0;
    let previousTotalCMV = 0;
    let operatingExpenses = 0;
    let previousOperatingExpenses = 0;
    let variableCosts = 0;
    let previousVariableCosts = 0;
    let taxes = 0;
    let previousTaxes = 0;

    const cmvBySubcategory = {};
    const fixedExpensesBySubcategory = {};
    const variableExpensesBySubcategory = {};

    const fixedCostKeywords = [
      "DESPESAS FIXAS",
      "DESPESA FIXA",
      "CUSTOS FIXOS",
      "CUSTO FIXO",
    ];
    const variableCostKeywords = [
      "DESPESAS VARIAVEIS",
      "DESPESAS VARIÁVEIS",
      "DESPESA VARIAVEL",
      "DESPESA VARIÁVEL",
      "CUSTOS VARIAVEIS",
      "CUSTOS VARIÁVEIS",
      "CUSTO VARIAVEL",
      "CUSTO VARIÁVEL",
    ];
    const cmvKeywords = [
      "CMV",
      "CUSTO DE MERCADORIA VENDIDA",
      "CUSTOS DE MERCADORIA VENDIDA",
      "CUSTO POR MERCADORIA VENDIDA",
      "CUSTOS POR MERCADORIA VENDIDA",
    ];
    const taxKeywords = ["IMPOSTO", "IMPOSTOS"];

    allLancamentos.forEach((lanc) => {
      const amount = parseFloat(lanc.valor);
      const isCurrentMonth = lanc.data_referencia >= currentMonthStart && lanc.data_referencia <= currentMonthEnd;
      const isPreviousMonth = lanc.data_referencia >= previousMonthStart && lanc.data_referencia <= previousMonthEnd;
      const desc = lanc.subcategorias?.categorias?.descricao?.toUpperCase();
      const isCMV = desc && cmvKeywords.some((k) => desc.includes(k)) && lanc.tipo === "despesa";
      const isFixedCost = desc && fixedCostKeywords.some((k) => desc.includes(k)) && lanc.tipo === "despesa";
      const isVariableCost = desc && variableCostKeywords.some((k) => desc.includes(k)) && lanc.tipo === "despesa";
      const isTax = desc && taxKeywords.some((k) => desc.includes(k)) && lanc.tipo === "despesa";

      if (lanc.tipo === "receita") {
        if (isCurrentMonth) netIncomes += amount;
        if (isPreviousMonth) previousNetIncomes += amount;
      } else {
        if (isTax) {
          if (isCurrentMonth) taxes += amount;
          if (isPreviousMonth) previousTaxes += amount;
        } else if (isCMV) {
          if (isCurrentMonth) {
            totalCMV += amount;
            const sub = lanc.subcategorias?.nome || "CMV Não Categorizado";
            cmvBySubcategory[sub] = (cmvBySubcategory[sub] || 0) + amount;
          }
          if (isPreviousMonth) previousTotalCMV += amount;
        } else {
          if (isCurrentMonth) {
            operatingExpenses += amount;
            const sub = lanc.subcategorias?.nome || "Despesa Não Categorizada";
            if (isFixedCost) fixedExpensesBySubcategory[sub] = (fixedExpensesBySubcategory[sub] || 0) + amount;
            else if (isVariableCost) {
              variableExpensesBySubcategory[sub] = (variableExpensesBySubcategory[sub] || 0) + amount;
              variableCosts += amount;
            }
          }
          if (isPreviousMonth) previousOperatingExpenses += amount;
          if (isPreviousMonth && isVariableCost) previousVariableCosts += amount;
        }
      }
    });

    const metrics = {
      netIncomes,
      previousNetIncomes,
      totalCMV,
      previousTotalCMV,
      operatingExpenses,
      previousOperatingExpenses,
      contributionMargin: netIncomes - (variableCosts + taxes),
      previousContributionMargin: previousNetIncomes - (previousVariableCosts + previousTaxes),
      ebitda: netIncomes - (totalCMV + operatingExpenses),
      previousEbitda: previousNetIncomes - (previousTotalCMV + previousOperatingExpenses),
    };

    // Build pie charts via QuickChart
    const colorPalette = ["#007bff", "#198754", "#dc3545", "#FFA500", "#800080", "#FFD700", "#000000", "#808080"];
    const cmvLabels = Object.keys(cmvBySubcategory);
    const cmvValues = cmvLabels.map((k) => cmvBySubcategory[k]);
    const fixedLabels = Object.keys(fixedExpensesBySubcategory);
    const fixedValues = fixedLabels.map((k) => fixedExpensesBySubcategory[k]);
    const variableLabels = Object.keys(variableExpensesBySubcategory);
    const variableValues = variableLabels.map((k) => variableExpensesBySubcategory[k]);

    const cmvChartUrl = cmvLabels.length ? buildQuickChartPie(cmvLabels, cmvValues, colorPalette.slice(0, cmvLabels.length), "Discretização do CMV") : null;
    const fixedChartUrl = fixedLabels.length ? buildQuickChartPie(fixedLabels, fixedValues, colorPalette.slice(0, fixedLabels.length), "Despesas Fixas") : null;
    const variableChartUrl = variableLabels.length ? buildQuickChartPie(variableLabels, variableValues, colorPalette.slice(0, variableLabels.length), "Despesas Variáveis") : null;

    // Build trends (last 6 months)
    const sixMonthsAgo = subMonths(today, 5);
    const { data: lancamentosTrend, error: trendError } = await supabase
      .from("lancamentos")
      .select("*, subcategorias(*, categorias(*))")
      .eq("empresa_id", empresa.id)
      .gte("data_referencia", format(startOfMonth(sixMonthsAgo), "yyyy-MM-dd"))
      .lte("data_referencia", format(endOfMonth(today), "yyyy-MM-dd"))
      .order("data_referencia", { ascending: true });

    if (trendError) return res.status(400).json({ error: "Erro ao buscar dados de tendência" });

    const trendMap = {};
    (lancamentosTrend || []).forEach((l) => {
      const monthKey = format(new Date(String(l.data_referencia)), "MMM");
      if (!trendMap[monthKey]) trendMap[monthKey] = { income: 0, cmv: 0, expenses: 0 };
      const amount = parseFloat(l.valor);
      const desc = l.subcategorias?.categorias?.descricao?.toUpperCase();
      const isCMV = desc && cmvKeywords.some((k) => desc.includes(k)) && (l.subcategorias?.categorias?.natureza === "despesa" || l.tipo === "despesa");
      if (l.tipo === "receita") trendMap[monthKey].income += amount;
      else if (isCMV) trendMap[monthKey].cmv += amount;
      else trendMap[monthKey].expenses += amount;
    });

    const months = Object.keys(trendMap);
    const incomeSeries = months.map((m) => trendMap[m].income);
    const cmvSeries = months.map((m) => trendMap[m].cmv);
    const expensesSeries = months.map((m) => trendMap[m].expenses);

    const trendChartUrl = months.length
      ? buildQuickChartLine(
          months,
          [
            { label: "Receita", data: incomeSeries, borderColor: "#007bff", fill: false },
            { label: "CMV", data: cmvSeries, borderColor: "#dc3545", fill: false },
            { label: "Despesas Operacionais", data: expensesSeries, borderColor: "#198754", fill: false },
          ],
          "Tendência (últimos 6 meses)"
        )
      : null;

    // Build HTML
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Relatório - ${empresa.nome}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #222 }
          .header { display:flex; justify-content:space-between; align-items:center }
          h1 { margin: 0 }
          .metrics { display:flex; gap:16px; margin-top:16px }
          .metric { border:1px solid #eee; padding:12px; border-radius:8px; width:180px }
          .charts { display:flex; gap:16px; margin-top:18px }
          .chart { flex:1; border:1px solid #eee; padding:8px; border-radius:8px }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Relatório - ${empresa.nome}</h1>
            <div>Usuário: ${user.nome} (${phone})</div>
            <div>Data: ${format(new Date(), "dd/MM/yyyy HH:mm")}</div>
          </div>
        </div>

        <div class="metrics">
          <div class="metric"><strong>Receita Líquida</strong><div>${metrics.netIncomes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></div>
          <div class="metric"><strong>CMV Total</strong><div>${metrics.totalCMV.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></div>
          <div class="metric"><strong>Despesas Operacionais</strong><div>${metrics.operatingExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></div>
          <div class="metric"><strong>Margem de Contribuição</strong><div>${metrics.contributionMargin.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></div>
          <div class="metric"><strong>Ebitda</strong><div>${metrics.ebitda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></div>
        </div>

        <div class="charts">
          <div class="chart">${cmvChartUrl ? `<h3>CMV</h3><img src="${cmvChartUrl}" style="width:100%" />` : "<h3>CMV</h3><div>Sem dados</div>"}</div>
          <div class="chart">${fixedChartUrl ? `<h3>Despesas Fixas</h3><img src="${fixedChartUrl}" style="width:100%" />` : "<h3>Despesas Fixas</h3><div>Sem dados</div>"}</div>
          <div class="chart">${variableChartUrl ? `<h3>Despesas Variáveis</h3><img src="${variableChartUrl}" style="width:100%" />` : "<h3>Despesas Variáveis</h3><div>Sem dados</div>"}</div>
        </div>

        <div style="margin-top:20px">
          ${trendChartUrl ? `<h3>Tendência</h3><img src="${trendChartUrl}" style="width:100%" />` : "<h3>Tendência</h3><div>Sem dados</div>"}
        </div>
      </body>
      </html>
    `;

    // Generate PDF
    const launchOptions = { args: ["--no-sandbox", "--disable-setuid-sandbox"] };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({ "Content-Type": "application/pdf", "Content-Length": pdfBuffer.length });
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("Report error:", err?.message || err);
    return res.status(400).json({ error: "Erro ao gerar relatório" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Report server running on port ${PORT}`));
