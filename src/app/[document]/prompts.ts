export const getPrompts = (company: string) => {
  const executiveSummary = `
  Generate a concise executive summary for an equity research report on ${company}. Include the following information:

1. Investment recommendation: [Buy/Hold/Sell]
   - Target price: [Price]
   - Upside/downside potential: [Percentage]

2. Investment thesis:
   - Key points: [2-3 key reasons supporting the investment recommendation]

3. Company overview:
   - Business description: [Brief description of the company's main products/services]
   - Industry: [Industry name]
   - Market position: [Company's market share or competitive position]

4. Financial highlights:
   - Revenue (latest fiscal year): [Revenue figure]
   - Revenue growth (year-over-year): [Growth percentage]
   - EPS (latest fiscal year): [EPS figure]
   - EPS growth (year-over-year): [Growth percentage]
   - Valuation: [Key valuation metrics, e.g., P/E ratio, EV/EBITDA]

5. Catalysts and risks:
   - Potential catalysts: [Positive factors that could drive the stock price]
   - Key risks: [Main risks that could negatively impact the company or stock]

Your executive summary should be a 150-200 word paragraph that concisely summarizes the key points of your equity research report. It should provide a high-level overview of your investment recommendation, the supporting investment thesis, company background, financial performance, and potential catalysts and risks.

Structure the executive summary as follows:
1. Open with a clear statement of your investment recommendation, target price, and upside/downside potential.
2. Briefly explain the main reasons behind your recommendation, highlighting 2-3 key points from your investment thesis.
3. Provide a one-sentence overview of the company, its industry, and market position.
4. Mention key financial metrics, focusing on revenue, earnings, and valuation.
5. Conclude by noting the main potential catalysts and risks that could impact the stock.

Use clear, concise language and avoid technical jargon. The executive summary should give readers a quick understanding of your investment view and the supporting arguments without going into extensive detail. It should entice the reader to delve deeper into the full report to understand your analysis better.

Each paragraph should be wrapped in <p></p> XML tags.
`;

  const investmentThesis = `Generate a compelling investment thesis for ${company} based on the following information:

1. Company overview: [Brief description of the company, its products/services, and target market]

2. Financial performance: [Key financial metrics, such as revenue growth, profitability, and cash flow]

3. Industry analysis: [Overview of the industry, including market size, growth prospects, competitive landscape, and regulatory environment]

4. Competitive advantages: [Company's unique selling proposition, market position, and competitive strengths]

5. Growth opportunities: [Potential catalysts for future growth, such as new product launches, market expansion, or strategic partnerships]

6. Risks and challenges: [Identify potential risks and challenges that could impact the company's performance]

7. Valuation: [Current valuation metrics and comparison to industry peers]

Your investment thesis should be a 150-200 word paragraph that summarizes the key reasons why ${company} presents a compelling investment opportunity. Consider the company's financial performance, competitive advantages, growth prospects, and valuation. Highlight the most important factors that support your bullish or bearish outlook on the stock.

The thesis should be clear, concise, and persuasive, providing a high-level rationale for your investment recommendation. Use a mix of quantitative and qualitative insights to support your argument. End with a clear statement indicating whether you believe the stock is a buy, hold, or sell based on your analysis.

Each paragraph should be wrapped in <p></p> XML tags.
`;

  const companyOverview = `Generate a concise two-paragraph company overview for an equity research report based on the following information:

1. ${company}, headquartered in [Location], was incorporated in [Year].

2. The company offers [Products/Services], with a mission to [Mission] and core objectives of [Objectives].

3. [Company Name] operates in the [Industry], which is characterized by [Market Dynamics], [Growth Trends], [Regulatory Environment], and key competitors such as [Competitors].

4. Within the industry, [Company Name] holds a [Market Position], with a market share of [Market Share]. The company's competitive advantages include [Advantages], such as [Brand Recognition], [Customer Base], and [Distribution Network].

5. ${company} serves [Geographies] and has expansion strategies focused on [Expansion Strategies].

6. The company's operational capabilities include [Manufacturing Capabilities], [Partnerships], and [Supply Chain Strengths].

7. Recent significant events for [Company Name] include [Mergers and Acquisitions], [Divestitures], and [Major Contracts].

Using the provided information, generate a summary that highlights the company's core business, industry position, and key characteristics. The first paragraph should focus on points 1-4, while the second paragraph should cover points 5-7. Ensure that the most critical information is conveyed concisely and effectively for the equity research report.

Each paragraph should be wrapped in <p></p> XML tags.
`;

  const industryAnalysis = `Generate a comprehensive industry analysis for the [Industry Name] industry, focusing on the following aspects:

1. Industry overview:
   - Definition and scope of the industry
   - Key products/services offered
   - Major players and market share distribution

2. Market size and growth:
   - Current market size (in terms of revenue or volume)
   - Historical growth rates (past 3-5 years)
   - Projected future growth rates (next 3-5 years)
   - Key growth drivers and trends

3. Competitive landscape:
   - Intensity of competition (fragmented vs. consolidated)
   - Major competitors and their market positions
   - Barriers to entry and exit
   - Threat of substitutes and new entrants

4. Customer analysis:
   - Target customer segments
   - Customer preferences and buying behavior
   - Bargaining power of customers

5. Supplier analysis:
   - Key suppliers and their bargaining power
   - Supply chain dynamics and risks

6. Regulatory environment:
   - Key regulations and policies affecting the industry
   - Recent or anticipated regulatory changes
   - Impact of regulations on industry growth and profitability

7. Technological factors:
   - Impact of technology on the industry
   - Adoption of new technologies and digital disruption
   - Research and development (R&D) intensity

8. Macroeconomic factors:
   - Sensitivity to economic cycles
   - Impact of global economic trends
   - Foreign exchange risks (if applicable)

9. Industry challenges and opportunities:
   - Major challenges facing the industry
   - Untapped market opportunities
   - Potential disruptors or game-changers

Your industry analysis should be a 500-800 word section that provides a detailed and insightful overview of the [Industry Name] industry. The analysis should cover various aspects, including market size and growth, competitive dynamics, customer and supplier considerations, regulatory factors, technological trends, and macroeconomic influences.

Structure the industry analysis as follows:
1. Begin with a brief introduction to the industry, its definition, and scope.
2. Discuss the current market size, historical growth rates, and projected future growth, highlighting key growth drivers and trends.
3. Analyze the competitive landscape, including major players, market share distribution, entry barriers, and the threat of substitutes and new entrants.
4. Examine the target customer segments, their preferences, and buying behavior, as well as the bargaining power of customers.
5. Discuss key suppliers, their bargaining power, and any supply chain risks.
6. Outline the regulatory environment, including key regulations, recent or anticipated changes, and their impact on the industry.
7. Assess the impact of technology on the industry, including the adoption of new technologies, digital disruption, and R&D intensity.
8. Consider macroeconomic factors, such as sensitivity to economic cycles, global economic trends, and foreign exchange risks (if relevant).
9. Identify major challenges facing the industry, untapped market opportunities, and potential disruptors or game-changers.

Use clear, concise language and support your analysis with relevant data, statistics, and examples where appropriate. The industry analysis should provide readers with a comprehensive understanding of the industry dynamics and the factors that could impact the performance of companies operating within the industry.

Each paragraph should be wrapped in <p></p> XML tags.
`;

  return [
    { section: 'Executive Summary', prompt: executiveSummary },
    { section: 'Investment Thesis', prompt: investmentThesis },
    { section: 'Company Overview', prompt: companyOverview },
    { section: 'Industry Analysis', prompt: industryAnalysis },
  ];
};
