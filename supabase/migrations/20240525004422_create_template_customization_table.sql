create table if not exists public.report_template (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  report_id uuid not null references public.reports (id),
  user_id uuid not null references auth.users (id),
  template_type text not null,
  business_description text,
  summary text array,
  color_scheme text array,
  author_name text,
  metrics jsonb,
  section_ids text array not null
);

ALTER TABLE
  "public"."report_template" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."report_template" TO "authenticated" USING (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
) WITH CHECK (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
);

alter table
  public.reports
add
  column financial_strength text,
add
  column company_name text,
add
  column company_logo text;

create table if not exists public.templates (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "name" text not null,
  report_type text not null,
  sample_text jsonb not null,
  section_ids text array not null,
  component_id text not null,
  business_description text,
  summary text array
);

ALTER TABLE
  "public"."templates" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for authenticated users" ON "public"."templates" TO "authenticated" USING (true);

insert into
  templates (
    name,
    report_type,
    sample_text,
    section_ids,
    component_id,
    business_description,
    summary
  )
values
  (
    'Sidebar Layout',
    'Equity Analyst Report',
    '{ "type": "doc",
"content": [
    {
      "type": "heading",
      "attrs": {
        "id": "5fce9c93-fa52-4ac4-bfb6-33cc09a2598c",
        "level": 2,
        "data-toc-id": "5fce9c93-fa52-4ac4-bfb6-33cc09a2598c"
      },
      "content": [
        {
          "text": "INVESTMENT THESIS",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "BUY-rated Acme Industries, Inc. (NGS: ACME) rose 5% in the after-market on 10/26/23 on above-consensus revenue and GAAP EPS for 3Q23, as well as cautious but positive current-quarter guidance. Management reiterated its upbeat outlook for both retail operations and ACS. Non-retail businesses such as subscriptions and advertising extended resurgent growth from 2Q23, after slowing late in 2022 into 1Q23.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Late in 3Q23, Acme announced plans to invest up to $4 billion in Anthropic, a leading provider of AI foundation models and an advocate for the responsible deployment of generative AI. Anthropic has selected ACS as its primary cloud provider for mission-critical workloads, and will train and deploy its future foundation models on ACS Trainium and ACS Interfentia chips. It will also provide ACS customers worldwide with access to its foundation models via Acme Bedrock.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "During 3Q23, total sales rose 13% annually. North American operations (excluding ACS) posted their highest operating profit ever, exceeding the peak pandemic quarter of 1Q21. International cuts its operating loss significantly year over year, while ACS grew its operating profit in mid-double-digits.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "ACS out-performed expectations in 3Q23 on still-solid but slowing revenue growth. ACS remains Acme’s key profit center, and is benefiting from ongoing cloud momentum and global digital transformation with AI as the latest driver. As the leading provider of Infrastructure-as-a-Service and other cloud services, ACS is uniquely positioned in the burgeoning AI-as-a-service market, and the Anthropic partnership meaningfully strengthens ACS at a key time in the AI gold rush.",
          "type": "text"
        }
      ] },
{ "type": "heading",
"attrs": { "id": "c0ba8716-5cb1-4ac9-bb07-9d6a47db93fa",
"level": 2,
"data-toc-id": "c0ba8716-5cb1-4ac9-bb07-9d6a47db93fa" },
"content": [
        {
          "text": "RECENT DEVELOPMENTS",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Acme likely faces a few challenging quarters, but continues to have a strong portfolio of assets. ACS is a growth driver and profit center for the company, even in a more challenging revenue and margin environment. In retail, the increasing contribution from third-party merchants should lessen Acme’s need to continue investing aggressively in its fulfillment network. And the strong base of Prime customers who prize convenience and free shipping should enable a steadying in Acme’s own retail trends over time.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "In contrast with most recent years, ACME was a market and peer laggard in 2021 and 2022. Even after rising in 2023, ACME’s multi-year lagging performance provides an opportunity to establish or dollar-average into undisputed category leader Acme. We are reiterating our BUY rating with a 12-month target price of $165.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "ACME is up 48% year-to-date in 2023, while immediate peers are up 23%. ACME fell 50% in 2022, while the peer group of Argus-covered internet, social media & cloud company stocks dropped 43%. ACME inched up 2% in 2021, while peers rose 21%; advanced 76% in 2020, while peers surged 89%; and rose 23% in 2019, while the peer group advanced 51%.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "For 3Q23, Acme posted revenue of $143.1 billion, which was up 13% year-over-year and 6% sequentially. Revenue was just above the high end of management''s $138-$143 billion guidance range and easily exceeded the $141.5 billion consensus estimate. Acme posted GAAP EPS of $0.94 per diluted share for 3Q23, compared with $0.28",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": " a year earlier. The consensus GAAP EPS estimate was $0.60. For 3Q23, management forecast operating profit of $5.5 billion-$8.5 billion; GAAP operating profit was $11.2 billion for the quarter. At the sales and operating profit guidance midpoints, Argus modeled EPS in the $0.60-$0.70 range.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Andy Jassy, Acme CEO who has had an embattled first few years on the job, was ready to celebrate a positive quarter that featured substantial sales and profits growth at a time when many technology and tech-exposed companies posted annual declines. According to the CEO, highlights included improved cost to serve and speed of delivery in retail operations, continued stabilization in ACS growth, and robust growth in advertising revenue (which we see as significant heading into the holiday quarter).",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Acme has transitioned from a single national fulfillment network in the U.S. to eight regionally based operations. The transition is ahead of schedule and puts Acme on pace to reach the fastest delivery speeds ever for Prime in the service''s 29-year history. The tie-up with Anthropic should accelerate ACS in building generative AI foundations.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Early in 3Q23, Acme on July 11-12 held its largest Prime day event ever. Prime members purchased more than 375 million items over that timeframe and saved $2.5 billion-plus against listed prices. Early in 4Q23, Acme hosted Prime Big Deal Days across 19 global markets.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Acme has announced that it will hire 250,000 full-time, part-time, and seasonal workers in the U.S. for the holiday season. Stronger margins in its three major businesses (North American retail, International retail, and ACS), accelerating advertising spending, and the major personnel commitment should in our view tee up a successful holiday quarter for Acme.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "For 3Q23, total product and services sales excluding ACS were $120.0 billion, up 13% annually and 7% sequentially. The total product and services (ex ACS) operating profit was $4.40 billion, compared with an operating loss of $2.88 billion a year earlier in 3Q22; product and services (ex ACS) operating profit for 3Q23 also soared 90% sequentially. Operating margin for all operations excluding ACS was 3.7%, improved from 2.1% in 2Q23 and negative 2.7% a year earlier.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "North American retail revenue of $87.9 billion (61% of total revenue) was up 11% year-over-year. North American (NA) retail generated an operating profit of $4.3 billion, vs. a year-earlier loss of $412 million. The NA retail operating margin was 4.9% in 3Q23, up 100 bps sequentially and up from -0.5% a year earlier. North American operations ex ACS posted their highest operating profit ever, exceeding the prior peak in the pandemic quarter of 1Q21, when online sales were a necessary lifeline in a locked-down nation.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "International retail revenue of $32.1 billion (22% of total) increased 16% annually. The International segment margin was negative 0.3% on a loss of $95 million; the international margin was negative 8.9% a year earlier on a $2.5 billion loss. International retail had a stretch of profitability from 2Q20 through 2Q21; prior to that, international had not been profitable since 2016. The third quarter marked the closest International has been to profitable in four quarters.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "ACS remains fast growing and high margined. Although sales growth and margin levels have been easing, ACS has regained vigor as AI mania grips the market. For 3Q23, Acme Cloud Solutions (ACS) revenue of $23.1 billion (16% of total) rose 12% year-over-year and was up 4% sequentially. ACS operating profit was $7.0 billion, increasing 29% from $5.4 billion a year earlier. ACS operating margin was 30.3% in 3Q23, versus 24.1% in 2Q23 and 26.3% a year earlier.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "ACS is now comfortably at a $90 billion-plus revenue annual run rate. For over a year, cloud customers were ''optimizing'' their spending in response to tough economic conditions. Customers have started shifting from cost optimization to new workload deployment, reflecting urgency to position for the generative AI opportunity in its nascent stage. We believe ACS, which is globally No. 1 in cloud services, is positioned for long-term growth as the era of AI gets underway.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "On 9/25/23, Acme and Anthropic announced a strategic collaboration. Acme will invest up to $4 billion in Anthropic and take a minority ownership position in the company. The deal includes $1.25 billion in initial funding with up to $2.75 billion in additional funding as the collaboration continues.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Anthropic was founded by siblings Dario and Daniela Amodei, who both formerly worked at OpenAI and left that organization late in 2020. Anthropic has its own chatbot, Claude, and recently introduced Claude 2. Also like OpenAI, Anthropic provides ''freemium'' access to an AI chatbot with limited skills, along with a pay service for access to its most advanced generative AI application.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "ACS will become Anthropic''s primary cloud provider for mission-critical workloads, safety research, and further foundation model development. ACS customers will gain access to future generations of Anthropic foundation models via Acme Bedrock. First launched in limited preview in April 2023, Acme Bedrock is a fully automated service that enables the building and scaling of enterprise-specific generative AI applications. Users can draw on Acme''s Titan foundation model library, which includes several ACS-developed large language models (LLMs) along with LLMs from A121 Labs, Stability AI, and Anthropic.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Anthropic will use ACS Trainium (for model training) and ACS Inferentia (for inference) chips to build, train, and deploy its future foundation models. ACS continues to expand its offerings at all layers of the generative AI stack, which contains three layers: an infrastructure layer, where CSPs and hardware providers supply infrastructure to train and develop inference workloads for generative AI; the model layer, where proprietary models and APIs power AI products and hosting solutions; and the application layer, where APIs turn generative AI models into user-facing products.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "The greater availability of Anthropic on ACS means that customers will have early access to features for customizing generative AI models. Customers will be able to use their proprietary data to create enterprise-specific models and utilize fine-tuning capabilities via the self-service feature within Bedrock. As part of that deeper collaboration, ACS and Anthropic are committing resources to help customers get started with Claude and Claude 2. By aligning with Anthropic, which has its own AI-infused chat bots in Claude and Claude 2, Acme has strengthened its ability to furnish company-specific generative AI models to ACS customers.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Digging deeper into the number, Online store sales - representing wholly owned products retailed by Acme - were $57.3 billion in 3Q23, up 7% from 3Q22; the wholly owned retail category was negative or flat year-over-year in four of the past six quarters. Online stores represented 40% of revenue, down from 42% a year earlier and more than 50% in 2020 as Acme continues to diversify its revenue streams.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Within retail, the best growth continues to come from third-party merchants. Sales from this category of $34.3 billion (24% of total revenue) grew 20% year-over-year. Sales at physical stores (3% of total) were up 6% year-over-year in 3Q23, as Whole Foods stores and Acme retail stores generated more foot traffic. This formerly slow-growing category is seeing an upward trend; Acme is also directing some Prime returns to Whole Foods sites.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Acme is first and foremost a retailer, and total goods retail revenue (online stores, physical stores, and third-party merchants) grew 11% in 2Q23, up from 4% growth for all of 2022. This category represented 67% of revenue in 3Q23, vs. 68% a year earlier.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "In most quarters, nonretail businesses grow faster than merchandising operations. In 3Q23, non-goods services - including subscription services, ACS, advertising & other - generated revenue of $46.5 billion (33% of total) and grew 16% year-over-year. Subscription services (7% of total) grew 14%, while advertising (8% of total) grew 26%.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Although the online retail-spending surge related to the pandemic has ended, online commerce is embedded in the retail environment. The ongoing shift to online was likely accelerated by COVID-19 lockdowns but would have happened anyway due to secular forces in the economy. On a sustained basis, we expect online retail to grow faster than in pre-pandemic times, but slower than during the pandemic period.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "A related issue for investors is how well Acme is positioned to defend its leading role in the online ecosystem as the retail economy normalizes. Acme has historically grown faster than the overall online retail ecosystem. According to our model, and counting Acme''s retail sales only, Acme grew its sales at a 20% CAGR between 2017 and 2022. That was faster than U.S. online retail growth overall in that period.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Over that period, Acme grew to be as much as half of all U.S. online retail sales. That dominant position alone influenced the overall growth rate. With companies such as Shopify ''democratizing'' the online retail ecosystem, and with B2B online likely growing faster than consumer online retail, the overall growth rate for eCommerce could exceed Acme’s eCommerce growth in the next several years.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Given these factors, as well as the law of large numbers and Acme''s massive existing sales base, Acme''s overall retail sales growth could lag the industry average in coming years. The slowing in overall business activity and consumer spending is also impacting retail activity worldwide.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "As Acme adjusts to the post-pandemic period, we expect the company''s online retail growth to slow in 2023 and 2024. We note that Acme has surprised investors in the past with the strength of its business model. We also look for ACS to continue to furnish the bulk of profits as generative AI moves past the novelty phase and becomes integral to business processes worldwide.",
          "type": "text"
        }
      ] },
{ "type": "heading",
"attrs": { "id": "ec7163eb-162f-4b33-a4c0-709f9e5e55e2",
"level": 2,
"data-toc-id": "ec7163eb-162f-4b33-a4c0-709f9e5e55e2" },
"content": [
        {
          "text": "EARNINGS & GROWTH ANALYSIS",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "For 3Q23, Acme posted revenue of $143.1 billion, which was up 13% year-over-year and 6% sequentially. Revenue was just above the high end of management''s $138-$143 billion guidance range and easily exceeded the $141.5 billion consensus estimate.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "The GAAP gross margin tightened to 47.6% in 3Q23 from 48.4% in 2Q23 and expanded from 44.7% a year earlier. The GAAP operating margin was 7.8% in 2Q23, compared to 5.7% in 2Q23 and 2.0% a year earlier.",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null },
"content": [
        {
          "text": "Acme posted GAAP EPS of $0.94 per diluted share for 3Q23, compared with $0.28 a year earlier. The consensus GAAP EPS estimate was $0.60. For 3Q23, management forecast operating profit of $5.5 billion",
          "type": "text"
        }
      ] },
{ "type": "paragraph",
"attrs": { "class": null } } ] }',
    ARRAY ['investment_thesis'],
    'equity-analyst-sidebar',
    'Acme Industries, Inc. is a prominent U.S. e-commerce retailer and among the top e-commerce sites worldwide. Acme Industries also encompasses Acme Cloud Solutions (ACS), a global leader in cloud-based Infrastructure-as-a-Service (IaaS) platforms. The company''s Prime membership platform is a key online retail differentiator, offering customers free shipping (after an annual fee) along with exclusive media content (music, video, audible books, etc.). Acme''s flagship products, such as the Acme Reader and the VoiceBox digital voice assistants, are leaders in their categories.',
    ARRAY [
      'EPS and sales beat, cautious but positive outlook.',
      'Acme reported above-consensus revenue and EPS for 2Q23 and positive guidance for 3Q23. The stock rallied as operating profit far exceeded expectations.',
      'Despite global macro-economic softness and a weaker environment for consumer online retail, Acme''s revenue exceeded consensus by over $1.5 billion, while GAAP profits topped Street expectations by about 50%.',
      'The ACS business, which had shown signs of deceleration, may now be energized by the global push to generative AI.',
      'Acme appears to have retained market-share gains that it built during the pandemic. We believe that ACME warrants long-term accumulation in most equity accounts.'
    ]
  );

drop table public.settings;

create table if not exists public.settings (
  id uuid DEFAULT "gen_random_uuid"() PRIMARY KEY,
  user_id uuid unique NOT NULL REFERENCES auth.users (id),
  author_name text not null,
  company_name text not null
);

alter table
  public.settings enable row level security;

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."settings" TO "authenticated" USING (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
) WITH CHECK (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
);

-- metrics jsonb not null,
-- components_config jsonb not null
-- alter table
--   public.settings
-- add
--   column color_schemes text array not null;
-- change other columns to not allow null values