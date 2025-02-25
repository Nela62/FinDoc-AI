import { Group } from './types';

export const GROUPS: Group[] = [
  // {
  //   name: 'ai',
  //   title: 'AI',
  //   commands: [
  //     {
  //       name: 'aiWriter',
  //       label: 'AI Writer',
  //       iconName: 'Sparkles',
  //       description: 'Let AI finish your thoughts',
  //       shouldBeHidden: (editor) => editor.isActive('columns'),
  //       action: (editor) => editor.chain().focus().setAiWriter().run(),
  //     },
  //     {
  //       name: 'aiImage',
  //       label: 'AI Chart',
  //       iconName: 'Sparkles',
  //       description: 'Generate an image from text',
  //       shouldBeHidden: (editor) => editor.isActive('columns'),
  //       action: (editor) => editor.chain().focus().setAiImage().run(),
  //     },
  //   ],
  // },
  {
    name: 'format',
    title: 'Format',
    commands: [
      {
        name: 'heading1',
        label: 'Heading 1',
        iconName: 'Heading1',
        description: 'High priority section title',
        aliases: ['h1'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 1 }).run();
        },
      },
      {
        name: 'heading2',
        label: 'Heading 2',
        iconName: 'Heading2',
        description: 'Medium priority section title',
        aliases: ['h2'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 2 }).run();
        },
      },
      {
        name: 'heading3',
        label: 'Heading 3',
        iconName: 'Heading3',
        description: 'Low priority section title',
        aliases: ['h3'],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 3 }).run();
        },
      },

      {
        name: 'bulletList',
        label: 'Bullet List',
        iconName: 'List',
        description: 'Unordered list of items',
        aliases: ['ul'],
        action: (editor) => {
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        name: 'numberedList',
        label: 'Numbered List',
        iconName: 'ListOrdered',
        description: 'Ordered list of items',
        aliases: ['ol'],
        action: (editor) => {
          editor.chain().focus().toggleOrderedList().run();
        },
      },
    ],
  },

  {
    name: 'insert',
    title: 'Insert',
    commands: [
      {
        name: 'table',
        label: 'Table',
        iconName: 'Table',
        description: 'Insert a table',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: false })
            .run();
        },
      },
      {
        name: 'image',
        label: 'Image',
        iconName: 'Image',
        description: 'Insert an image',
        aliases: ['img'],
        action: (editor) => {
          editor.chain().focus().setImageUpload().run();
        },
      },
      {
        name: 'columns',
        label: 'Columns',
        iconName: 'Columns2',
        description: 'Add two column content',
        aliases: ['cols'],
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor
            .chain()
            .focus()
            .setColumns()
            .focus(editor.state.selection.head - 1)
            .run();
        },
      },
      {
        name: 'horizontalRule',
        label: 'Horizontal Rule',
        iconName: 'Minus',
        description: 'Insert a horizontal divider',
        aliases: ['hr'],
        action: (editor) => {
          editor.chain().focus().setHorizontalRule().run();
        },
      },
      {
        name: 'toc',
        label: 'Table of Contents',
        iconName: 'Book',
        aliases: ['outline'],
        description: 'Insert a table of contents',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        action: (editor) => {
          editor.chain().focus().insertTableOfContents().run();
        },
      },
    ],
  },
  {
    name: 'blocks',
    title: 'Blocks',
    commands: [
      {
        name: 'aiBusinessDescription',
        label: 'Business Description',
        iconName: 'Briefcase',
        description: 'Generate business description for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor.chain().focus().setAiGenerator('business_description').run(),
      },
      {
        name: 'aiInvestmentThesis',
        label: 'Investment Thesis',
        iconName: 'Banknote',
        description: 'Generate an investment thesis for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor.chain().focus().setAiGenerator('investment_thesis').run(),
      },
      {
        name: 'aiManagementAndRisks',
        label: 'Management and Risks',
        iconName: 'Speech',
        description:
          'Generate a management and risks section for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor.chain().focus().setAiGenerator('management_and_risks').run(),
      },
      {
        name: 'aiRecentDevelopments',
        label: 'Recent Developments',
        iconName: 'Speech',
        description:
          'Generate a recent developments section for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor.chain().focus().setAiGenerator('recent_developments').run(),
      },
      {
        name: 'aiEarningsAndGrowthAnalysis',
        label: 'Earnings and Growth Analysis',
        iconName: 'Speech',
        description:
          'Generate an earnings and growth analysis section for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor.chain().focus().setAiGenerator('management_and_risks').run(),
      },
      {
        name: 'aiFinancialStrengthAndDividend',
        label: 'Financial Strength and Dividend',
        iconName: 'Speech',
        description:
          'Generate a financial strength and dividend section for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor
            .chain()
            .focus()
            .setAiGenerator('financial_strength_and_dividend')
            .run(),
      },
      {
        name: 'aiValuation',
        label: 'Valuation',
        iconName: 'Speech',
        description: 'Generate a valuation section for the selected company',
        shouldBeHidden: (editor) => editor.isActive('columns'),
        // action: (editor) => editor.chain().focus().setAiCompetitiveAdvantages().run(),
        action: (editor) =>
          editor.chain().focus().setAiGenerator('valuation').run(),
      },
    ],
  },
];

export default GROUPS;
