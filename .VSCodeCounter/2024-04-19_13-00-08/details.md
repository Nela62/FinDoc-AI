# Details

Date : 2024-04-19 13:00:08

Directory /Users/helen/Coding/finpanel_web

Total : 325 files,  82766 codes, 1682 comments, 3767 blanks, all 88215 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/Dockerfile](/backend/Dockerfile) | Docker | 33 | 6 | 26 | 65 |
| [backend/README.md](/backend/README.md) | Markdown | 0 | 0 | 1 | 1 |
| [backend/app/__init__.py](/backend/app/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/api/__init__.py](/backend/app/api/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/api/api.py](/backend/app/api/api.py) | Python | 4 | 6 | 3 | 13 |
| [backend/app/api/crud.py](/backend/app/api/crud.py) | Python | 109 | 2 | 15 | 126 |
| [backend/app/api/endpoints/__init__.py](/backend/app/api/endpoints/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/api/endpoints/conversation.py](/backend/app/api/endpoints/conversation.py) | Python | 0 | 170 | 18 | 188 |
| [backend/app/api/endpoints/documents.py](/backend/app/api/endpoints/documents.py) | Python | 9 | 30 | 10 | 49 |
| [backend/app/api/endpoints/generator.py](/backend/app/api/endpoints/generator.py) | Python | 102 | 56 | 41 | 199 |
| [backend/app/api/endpoints/health.py](/backend/app/api/endpoints/health.py) | Python | 13 | 0 | 5 | 18 |
| [backend/app/api/endpoints/metrics.py](/backend/app/api/endpoints/metrics.py) | Python | 16 | 0 | 6 | 22 |
| [backend/app/api/endpoints/reports.py](/backend/app/api/endpoints/reports.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/chat/__init__.py](/backend/app/chat/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/chat/constants.py](/backend/app/chat/constants.py) | Python | 16 | 0 | 5 | 21 |
| [backend/app/chat/engine.py](/backend/app/chat/engine.py) | Python | 280 | 5 | 35 | 320 |
| [backend/app/chat/messaging.py](/backend/app/chat/messaging.py) | Python | 148 | 0 | 21 | 169 |
| [backend/app/chat/qa_response_synth.py](/backend/app/chat/qa_response_synth.py) | Python | 55 | 1 | 5 | 61 |
| [backend/app/chat/tools.py](/backend/app/chat/tools.py) | Python | 130 | 2 | 30 | 162 |
| [backend/app/chat/utils.py](/backend/app/chat/utils.py) | Python | 17 | 0 | 4 | 21 |
| [backend/app/core/__init__.py](/backend/app/core/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/core/config.py](/backend/app/core/config.py) | Python | 137 | 14 | 33 | 184 |
| [backend/app/db/base.py](/backend/app/db/base.py) | Python | 36 | 0 | 6 | 42 |
| [backend/app/documents/__init__.py](/backend/app/documents/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/documents/download_sec_filings.py](/backend/app/documents/download_sec_filings.py) | Python | 83 | 46 | 20 | 149 |
| [backend/app/documents/file_utils.py](/backend/app/documents/file_utils.py) | Python | 139 | 1 | 23 | 163 |
| [backend/app/documents/stock_utils.py](/backend/app/documents/stock_utils.py) | Python | 31 | 2 | 12 | 45 |
| [backend/app/documents/upsert_db_sec_documents.py](/backend/app/documents/upsert_db_sec_documents.py) | Python | 105 | 12 | 19 | 136 |
| [backend/app/main.py](/backend/app/main.py) | Python | 59 | 27 | 24 | 110 |
| [backend/app/metrics/__init__.py](/backend/app/metrics/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/metrics/fetch_metrics.py](/backend/app/metrics/fetch_metrics.py) | Python | 6 | 0 | 3 | 9 |
| [backend/app/models/__init__.py](/backend/app/models/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/models/base.py](/backend/app/models/base.py) | Python | 14 | 1 | 6 | 21 |
| [backend/app/models/db.py](/backend/app/models/db.py) | Python | 77 | 2 | 26 | 105 |
| [backend/app/reports/__init__.py](/backend/app/reports/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/reports/constants.py](/backend/app/reports/constants.py) | Python | 15 | 0 | 7 | 22 |
| [backend/app/reports/engine.py](/backend/app/reports/engine.py) | Python | 165 | 33 | 37 | 235 |
| [backend/app/reports/messaging.py](/backend/app/reports/messaging.py) | Python | 148 | 0 | 21 | 169 |
| [backend/app/reports/tools.py](/backend/app/reports/tools.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/schema.py](/backend/app/schema.py) | Python | 129 | 2 | 45 | 176 |
| [backend/app/supabase/__init__.py](/backend/app/supabase/__init__.py) | Python | 0 | 0 | 1 | 1 |
| [backend/app/supabase/client.py](/backend/app/supabase/client.py) | Python | 8 | 0 | 3 | 11 |
| [backend/app/utils/contexts.py](/backend/app/utils/contexts.py) | Python | 63 | 12 | 11 | 86 |
| [backend/data/sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.html](/backend/data/sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.html) | HTML | 3 | 0 | 3 | 6 |
| [backend/data/sec-edgar-filings/0001018724/10-Q/0001018724-23-000018/primary-document.html](/backend/data/sec-edgar-filings/0001018724/10-Q/0001018724-23-000018/primary-document.html) | HTML | 2 | 0 | 3 | 5 |
| [backend/poetry.lock](/backend/poetry.lock) | toml | 3,954 | 0 | 298 | 4,252 |
| [backend/pyproject.toml](/backend/pyproject.toml) | toml | 48 | 0 | 6 | 54 |
| [backend/scripts/data/sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.html](/backend/scripts/data/sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.html) | HTML | 3 | 0 | 3 | 6 |
| [backend/scripts/data/sec-edgar-filings/0001018724/10-Q/0001018724-23-000018/primary-document.html](/backend/scripts/data/sec-edgar-filings/0001018724/10-Q/0001018724-23-000018/primary-document.html) | HTML | 2 | 0 | 3 | 5 |
| [backend/scripts/download_sec_pdf.py](/backend/scripts/download_sec_pdf.py) | Python | 76 | 39 | 16 | 131 |
| [backend/scripts/file_utils.py](/backend/scripts/file_utils.py) | Python | 139 | 1 | 23 | 163 |
| [docker-compose.yml](/docker-compose.yml) | YAML | 21 | 2 | 0 | 23 |
| [frontend/.eslintrc.json](/frontend/.eslintrc.json) | JSON with Comments | 6 | 1 | 1 | 8 |
| [frontend/.prettierrc.json](/frontend/.prettierrc.json) | JSON | 12 | 0 | 1 | 13 |
| [frontend/Dockerfile](/frontend/Dockerfile) | Docker | 49 | 18 | 25 | 92 |
| [frontend/README.md](/frontend/README.md) | Markdown | 23 | 0 | 14 | 37 |
| [frontend/components.json](/frontend/components.json) | JSON | 17 | 0 | 0 | 17 |
| [frontend/middleware.ts](/frontend/middleware.ts) | TypeScript | 10 | 8 | 3 | 21 |
| [frontend/next.config.mjs](/frontend/next.config.mjs) | JavaScript | 26 | 19 | 10 | 55 |
| [frontend/package.json](/frontend/package.json) | JSON | 134 | 0 | 1 | 135 |
| [frontend/pnpm-lock.yaml](/frontend/pnpm-lock.yaml) | YAML | 6,331 | 0 | 792 | 7,123 |
| [frontend/postcss.config.js](/frontend/postcss.config.js) | JavaScript | 7 | 0 | 1 | 8 |
| [frontend/public/next.svg](/frontend/public/next.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/public/vercel.svg](/frontend/public/vercel.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/sentry.client.config.ts](/frontend/sentry.client.config.ts) | TypeScript | 15 | 9 | 8 | 32 |
| [frontend/sentry.edge.config.ts](/frontend/sentry.edge.config.ts) | TypeScript | 7 | 6 | 5 | 18 |
| [frontend/sentry.server.config.ts](/frontend/sentry.server.config.ts) | TypeScript | 7 | 7 | 6 | 20 |
| [frontend/src/app/(auth)/components/AuthForm.tsx](/frontend/src/app/(auth)/components/AuthForm.tsx) | TypeScript JSX | 59 | 1 | 9 | 69 |
| [frontend/src/app/(auth)/components/BrandSubmitButton.tsx](/frontend/src/app/(auth)/components/BrandSubmitButton.tsx) | TypeScript JSX | 39 | 3 | 6 | 48 |
| [frontend/src/app/(auth)/components/SubmitButton.tsx](/frontend/src/app/(auth)/components/SubmitButton.tsx) | TypeScript JSX | 18 | 3 | 6 | 27 |
| [frontend/src/app/(auth)/components/formActions.ts](/frontend/src/app/(auth)/components/formActions.ts) | TypeScript | 16 | 0 | 7 | 23 |
| [frontend/src/app/(auth)/layout.tsx](/frontend/src/app/(auth)/layout.tsx) | TypeScript JSX | 40 | 33 | 3 | 76 |
| [frontend/src/app/(auth)/login/page.tsx](/frontend/src/app/(auth)/login/page.tsx) | TypeScript JSX | 92 | 62 | 14 | 168 |
| [frontend/src/app/(auth)/register/page.tsx](/frontend/src/app/(auth)/register/page.tsx) | TypeScript JSX | 113 | 12 | 8 | 133 |
| [frontend/src/app/(protected)/layout.tsx](/frontend/src/app/(protected)/layout.tsx) | TypeScript JSX | 29 | 0 | 6 | 35 |
| [frontend/src/app/(protected)/reports/[url]/EditorComponent.tsx](/frontend/src/app/(protected)/reports/%5Burl%5D/EditorComponent.tsx) | TypeScript JSX | 112 | 23 | 13 | 148 |
| [frontend/src/app/(protected)/reports/[url]/page.tsx](/frontend/src/app/(protected)/reports/%5Burl%5D/page.tsx) | TypeScript JSX | 84 | 1 | 17 | 102 |
| [frontend/src/app/(protected)/reports/[url]/prompts.ts](/frontend/src/app/(protected)/reports/%5Burl%5D/prompts.ts) | TypeScript | 114 | 0 | 38 | 152 |
| [frontend/src/app/(protected)/reports/all/AllReportsTable.tsx](/frontend/src/app/(protected)/reports/all/AllReportsTable.tsx) | TypeScript JSX | 148 | 0 | 9 | 157 |
| [frontend/src/app/(protected)/reports/all/page.tsx](/frontend/src/app/(protected)/reports/all/page.tsx) | TypeScript JSX | 35 | 6 | 9 | 50 |
| [frontend/src/app/(protected)/reports/new/page.tsx](/frontend/src/app/(protected)/reports/new/page.tsx) | TypeScript JSX | 253 | 35 | 22 | 310 |
| [frontend/src/app/(protected)/reports/page.tsx](/frontend/src/app/(protected)/reports/page.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [frontend/src/app/api/chat/route.ts](/frontend/src/app/api/chat/route.ts) | TypeScript | 16 | 5 | 6 | 27 |
| [frontend/src/app/api/completion/route.ts](/frontend/src/app/api/completion/route.ts) | TypeScript | 16 | 13 | 7 | 36 |
| [frontend/src/app/api/generation/route.ts](/frontend/src/app/api/generation/route.ts) | TypeScript | 30 | 17 | 9 | 56 |
| [frontend/src/app/api/image/route.ts](/frontend/src/app/api/image/route.ts) | TypeScript | 19 | 0 | 5 | 24 |
| [frontend/src/app/auth/callback/route.ts](/frontend/src/app/auth/callback/route.ts) | TypeScript | 12 | 4 | 4 | 20 |
| [frontend/src/app/chart/page.tsx](/frontend/src/app/chart/page.tsx) | TypeScript JSX | 117 | 16 | 11 | 144 |
| [frontend/src/app/editor.css](/frontend/src/app/editor.css) | CSS | 79 | 0 | 19 | 98 |
| [frontend/src/app/global-error.tsx](/frontend/src/app/global-error.tsx) | TypeScript JSX | 22 | 0 | 4 | 26 |
| [frontend/src/app/globals.css](/frontend/src/app/globals.css) | CSS | 56 | 0 | 23 | 79 |
| [frontend/src/app/layout.tsx](/frontend/src/app/layout.tsx) | TypeScript JSX | 30 | 0 | 5 | 35 |
| [frontend/src/app/page.tsx](/frontend/src/app/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/components/OldNavBar/NavBar.tsx](/frontend/src/components/OldNavBar/NavBar.tsx) | TypeScript JSX | 58 | 0 | 8 | 66 |
| [frontend/src/components/OldNavBar/index.tsx](/frontend/src/components/OldNavBar/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/ReactQueryClientProvider.tsx](/frontend/src/components/ReactQueryClientProvider.tsx) | TypeScript JSX | 22 | 2 | 3 | 27 |
| [frontend/src/components/RightSidebar/RightSidebar.tsx](/frontend/src/components/RightSidebar/RightSidebar.tsx) | TypeScript JSX | 31 | 1 | 5 | 37 |
| [frontend/src/components/RightSidebar/components/Audit.tsx](/frontend/src/components/RightSidebar/components/Audit.tsx) | TypeScript JSX | 68 | 3 | 5 | 76 |
| [frontend/src/components/RightSidebar/components/InspectCitation.tsx](/frontend/src/components/RightSidebar/components/InspectCitation.tsx) | TypeScript JSX | 22 | 0 | 6 | 28 |
| [frontend/src/components/RightSidebar/index.ts](/frontend/src/components/RightSidebar/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/components/TableOfContents/TableOfContents.tsx](/frontend/src/components/TableOfContents/TableOfContents.tsx) | TypeScript JSX | 52 | 0 | 10 | 62 |
| [frontend/src/components/TableOfContents/index.tsx](/frontend/src/components/TableOfContents/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/Toolbar/EditorToolbar.tsx](/frontend/src/components/Toolbar/EditorToolbar.tsx) | TypeScript JSX | 176 | 20 | 5 | 201 |
| [frontend/src/components/Toolbar/components/AIDropdown.tsx](/frontend/src/components/Toolbar/components/AIDropdown.tsx) | TypeScript JSX | 115 | 19 | 4 | 138 |
| [frontend/src/components/Toolbar/components/ContentTypePicker.tsx](/frontend/src/components/Toolbar/components/ContentTypePicker.tsx) | TypeScript JSX | 62 | 0 | 8 | 70 |
| [frontend/src/components/Toolbar/components/EditLinkPopover.tsx](/frontend/src/components/Toolbar/components/EditLinkPopover.tsx) | TypeScript JSX | 21 | 0 | 3 | 24 |
| [frontend/src/components/Toolbar/components/FontFamilyPicker.tsx](/frontend/src/components/Toolbar/components/FontFamilyPicker.tsx) | TypeScript JSX | 69 | 0 | 7 | 76 |
| [frontend/src/components/Toolbar/components/FontSizePicker.tsx](/frontend/src/components/Toolbar/components/FontSizePicker.tsx) | TypeScript JSX | 45 | 0 | 6 | 51 |
| [frontend/src/components/Toolbar/hooks/useTextmenuCommands.ts](/frontend/src/components/Toolbar/hooks/useTextmenuCommands.ts) | TypeScript | 56 | 31 | 9 | 96 |
| [frontend/src/components/Toolbar/hooks/useTextmenuContentTypes.ts](/frontend/src/components/Toolbar/hooks/useTextmenuContentTypes.ts) | TypeScript | 95 | 14 | 3 | 112 |
| [frontend/src/components/Toolbar/hooks/useTextmenuStates.ts](/frontend/src/components/Toolbar/hooks/useTextmenuStates.ts) | TypeScript | 40 | 0 | 6 | 46 |
| [frontend/src/components/Toolbar/index.ts](/frontend/src/components/Toolbar/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/components/Toolbar/types.ts](/frontend/src/components/Toolbar/types.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [frontend/src/components/TopBar/TopBar.tsx](/frontend/src/components/TopBar/TopBar.tsx) | TypeScript JSX | 84 | 5 | 6 | 95 |
| [frontend/src/components/TopBar/export/ExportButton.tsx](/frontend/src/components/TopBar/export/ExportButton.tsx) | TypeScript JSX | 51 | 1 | 9 | 61 |
| [frontend/src/components/TopBar/export/components/docxExport.ts](/frontend/src/components/TopBar/export/components/docxExport.ts) | TypeScript | 508 | 14 | 15 | 537 |
| [frontend/src/components/TopBar/index.tsx](/frontend/src/components/TopBar/index.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/chat/AiChat.tsx](/frontend/src/components/chat/AiChat.tsx) | TypeScript JSX | 23 | 0 | 4 | 27 |
| [frontend/src/components/chat/index.ts](/frontend/src/components/chat/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/components/header/Header.tsx](/frontend/src/components/header/Header.tsx) | TypeScript JSX | 85 | 0 | 4 | 89 |
| [frontend/src/components/header/actions.ts](/frontend/src/components/header/actions.ts) | TypeScript | 8 | 0 | 4 | 12 |
| [frontend/src/components/header/index.ts](/frontend/src/components/header/index.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [frontend/src/components/menus/ContentItemMenu/ContentItemMenu.tsx](/frontend/src/components/menus/ContentItemMenu/ContentItemMenu.tsx) | TypeScript JSX | 81 | 0 | 6 | 87 |
| [frontend/src/components/menus/ContentItemMenu/hooks/useContentItemActions.tsx](/frontend/src/components/menus/ContentItemMenu/hooks/useContentItemActions.tsx) | TypeScript JSX | 62 | 0 | 17 | 79 |
| [frontend/src/components/menus/ContentItemMenu/hooks/useData.tsx](/frontend/src/components/menus/ContentItemMenu/hooks/useData.tsx) | TypeScript JSX | 23 | 0 | 5 | 28 |
| [frontend/src/components/menus/ContentItemMenu/index.tsx](/frontend/src/components/menus/ContentItemMenu/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/menus/LinkMenu/LinkMenu.tsx](/frontend/src/components/menus/LinkMenu/LinkMenu.tsx) | TypeScript JSX | 65 | 0 | 12 | 77 |
| [frontend/src/components/menus/LinkMenu/index.tsx](/frontend/src/components/menus/LinkMenu/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/menus/TextMenu/TextMenu.tsx](/frontend/src/components/menus/TextMenu/TextMenu.tsx) | TypeScript JSX | 184 | 19 | 5 | 208 |
| [frontend/src/components/menus/TextMenu/components/AIDropdown.tsx](/frontend/src/components/menus/TextMenu/components/AIDropdown.tsx) | TypeScript JSX | 115 | 19 | 4 | 138 |
| [frontend/src/components/menus/TextMenu/components/ContentTypePicker.tsx](/frontend/src/components/menus/TextMenu/components/ContentTypePicker.tsx) | TypeScript JSX | 62 | 0 | 8 | 70 |
| [frontend/src/components/menus/TextMenu/components/EditLinkPopover.tsx](/frontend/src/components/menus/TextMenu/components/EditLinkPopover.tsx) | TypeScript JSX | 21 | 0 | 3 | 24 |
| [frontend/src/components/menus/TextMenu/components/FontFamilyPicker.tsx](/frontend/src/components/menus/TextMenu/components/FontFamilyPicker.tsx) | TypeScript JSX | 69 | 0 | 7 | 76 |
| [frontend/src/components/menus/TextMenu/components/FontSizePicker.tsx](/frontend/src/components/menus/TextMenu/components/FontSizePicker.tsx) | TypeScript JSX | 45 | 0 | 6 | 51 |
| [frontend/src/components/menus/TextMenu/hooks/useTextmenuCommands.ts](/frontend/src/components/menus/TextMenu/hooks/useTextmenuCommands.ts) | TypeScript | 56 | 31 | 9 | 96 |
| [frontend/src/components/menus/TextMenu/hooks/useTextmenuContentTypes.ts](/frontend/src/components/menus/TextMenu/hooks/useTextmenuContentTypes.ts) | TypeScript | 95 | 14 | 3 | 112 |
| [frontend/src/components/menus/TextMenu/hooks/useTextmenuStates.ts](/frontend/src/components/menus/TextMenu/hooks/useTextmenuStates.ts) | TypeScript | 40 | 0 | 6 | 46 |
| [frontend/src/components/menus/TextMenu/index.tsx](/frontend/src/components/menus/TextMenu/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/menus/index.ts](/frontend/src/components/menus/index.ts) | TypeScript | 3 | 0 | 1 | 4 |
| [frontend/src/components/menus/types.ts](/frontend/src/components/menus/types.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [frontend/src/components/navBar/NavBar.tsx](/frontend/src/components/navBar/NavBar.tsx) | TypeScript JSX | 105 | 1 | 2 | 108 |
| [frontend/src/components/panels/Colorpicker/ColorButton.tsx](/frontend/src/components/panels/Colorpicker/ColorButton.tsx) | TypeScript JSX | 30 | 0 | 6 | 36 |
| [frontend/src/components/panels/Colorpicker/Colorpicker.tsx](/frontend/src/components/panels/Colorpicker/Colorpicker.tsx) | TypeScript JSX | 55 | 0 | 9 | 64 |
| [frontend/src/components/panels/Colorpicker/index.tsx](/frontend/src/components/panels/Colorpicker/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/panels/LinkEditorPanel/LinkEditorPanel.tsx](/frontend/src/components/panels/LinkEditorPanel/LinkEditorPanel.tsx) | TypeScript JSX | 86 | 0 | 9 | 95 |
| [frontend/src/components/panels/LinkEditorPanel/index.tsx](/frontend/src/components/panels/LinkEditorPanel/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/panels/LinkPreviewPanel/LinkPreviewPanel.tsx](/frontend/src/components/panels/LinkPreviewPanel/LinkPreviewPanel.tsx) | TypeScript JSX | 38 | 0 | 3 | 41 |
| [frontend/src/components/panels/LinkPreviewPanel/index.tsx](/frontend/src/components/panels/LinkPreviewPanel/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/panels/index.tsx](/frontend/src/components/panels/index.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [frontend/src/components/pdf-viewer/PdfOptionsBar.tsx](/frontend/src/components/pdf-viewer/PdfOptionsBar.tsx) | TypeScript JSX | 168 | 1 | 11 | 180 |
| [frontend/src/components/pdf-viewer/ViewPdf.tsx](/frontend/src/components/pdf-viewer/ViewPdf.tsx) | TypeScript JSX | 60 | 1 | 5 | 66 |
| [frontend/src/components/pdf-viewer/VirtualizedPdf.tsx](/frontend/src/components/pdf-viewer/VirtualizedPdf.tsx) | TypeScript JSX | 321 | 27 | 41 | 389 |
| [frontend/src/components/pdf-viewer/pdfDisplayConstants.tsx](/frontend/src/components/pdf-viewer/pdfDisplayConstants.tsx) | TypeScript JSX | 8 | 2 | 2 | 12 |
| [frontend/src/components/ui/Dropdown/Dropdown.tsx](/frontend/src/components/ui/Dropdown/Dropdown.tsx) | TypeScript JSX | 35 | 0 | 4 | 39 |
| [frontend/src/components/ui/Dropdown/index.tsx](/frontend/src/components/ui/Dropdown/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/Icon.tsx](/frontend/src/components/ui/Icon.tsx) | TypeScript JSX | 16 | 0 | 6 | 22 |
| [frontend/src/components/ui/Loader/Loader.tsx](/frontend/src/components/ui/Loader/Loader.tsx) | TypeScript JSX | 34 | 0 | 5 | 39 |
| [frontend/src/components/ui/Loader/index.ts](/frontend/src/components/ui/Loader/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/Loader/types.ts](/frontend/src/components/ui/Loader/types.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [frontend/src/components/ui/OldCombobox/Combobox.tsx](/frontend/src/components/ui/OldCombobox/Combobox.tsx) | TypeScript JSX | 128 | 18 | 9 | 155 |
| [frontend/src/components/ui/OldCombobox/index.ts](/frontend/src/components/ui/OldCombobox/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/Panel/index.tsx](/frontend/src/components/ui/Panel/index.tsx) | TypeScript JSX | 83 | 0 | 26 | 109 |
| [frontend/src/components/ui/PopoverMenu.tsx](/frontend/src/components/ui/PopoverMenu.tsx) | TypeScript JSX | 119 | 1 | 13 | 133 |
| [frontend/src/components/ui/Spinner/Spinner.tsx](/frontend/src/components/ui/Spinner/Spinner.tsx) | TypeScript JSX | 7 | 0 | 4 | 11 |
| [frontend/src/components/ui/Spinner/index.tsx](/frontend/src/components/ui/Spinner/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/Surface.tsx](/frontend/src/components/ui/Surface.tsx) | TypeScript JSX | 27 | 0 | 5 | 32 |
| [frontend/src/components/ui/TipTapButton/TipTapButton.tsx](/frontend/src/components/ui/TipTapButton/TipTapButton.tsx) | TypeScript JSX | 89 | 0 | 12 | 101 |
| [frontend/src/components/ui/TipTapButton/index.tsx](/frontend/src/components/ui/TipTapButton/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/TipTapTextarea/TipTapTextarea.tsx](/frontend/src/components/ui/TipTapTextarea/TipTapTextarea.tsx) | TypeScript JSX | 18 | 0 | 4 | 22 |
| [frontend/src/components/ui/TipTapTextarea/index.tsx](/frontend/src/components/ui/TipTapTextarea/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/TipTapToggle/Toggle.tsx](/frontend/src/components/ui/TipTapToggle/Toggle.tsx) | TypeScript JSX | 50 | 0 | 7 | 57 |
| [frontend/src/components/ui/TipTapToggle/index.tsx](/frontend/src/components/ui/TipTapToggle/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/components/ui/TipTapTooltip/index.tsx](/frontend/src/components/ui/TipTapTooltip/index.tsx) | TypeScript JSX | 70 | 1 | 13 | 84 |
| [frontend/src/components/ui/TipTapTooltip/types.ts](/frontend/src/components/ui/TipTapTooltip/types.ts) | TypeScript | 15 | 0 | 3 | 18 |
| [frontend/src/components/ui/Toolbar.tsx](/frontend/src/components/ui/Toolbar.tsx) | TypeScript JSX | 109 | 0 | 17 | 126 |
| [frontend/src/components/ui/avatar.tsx](/frontend/src/components/ui/avatar.tsx) | TypeScript JSX | 44 | 0 | 7 | 51 |
| [frontend/src/components/ui/badge.tsx](/frontend/src/components/ui/badge.tsx) | TypeScript JSX | 31 | 0 | 6 | 37 |
| [frontend/src/components/ui/breadcrumb.tsx](/frontend/src/components/ui/breadcrumb.tsx) | TypeScript JSX | 105 | 0 | 11 | 116 |
| [frontend/src/components/ui/button.tsx](/frontend/src/components/ui/button.tsx) | TypeScript JSX | 52 | 0 | 6 | 58 |
| [frontend/src/components/ui/card.tsx](/frontend/src/components/ui/card.tsx) | TypeScript JSX | 68 | 0 | 9 | 77 |
| [frontend/src/components/ui/data-table.tsx](/frontend/src/components/ui/data-table.tsx) | TypeScript JSX | 78 | 0 | 6 | 84 |
| [frontend/src/components/ui/dropdown-menu.tsx](/frontend/src/components/ui/dropdown-menu.tsx) | TypeScript JSX | 187 | 0 | 19 | 206 |
| [frontend/src/components/ui/form.tsx](/frontend/src/components/ui/form.tsx) | TypeScript JSX | 154 | 0 | 26 | 180 |
| [frontend/src/components/ui/hover-card.tsx](/frontend/src/components/ui/hover-card.tsx) | TypeScript JSX | 23 | 0 | 7 | 30 |
| [frontend/src/components/ui/input-otp.tsx](/frontend/src/components/ui/input-otp.tsx) | TypeScript JSX | 63 | 0 | 9 | 72 |
| [frontend/src/components/ui/input.tsx](/frontend/src/components/ui/input.tsx) | TypeScript JSX | 21 | 0 | 5 | 26 |
| [frontend/src/components/ui/label.tsx](/frontend/src/components/ui/label.tsx) | TypeScript JSX | 21 | 0 | 6 | 27 |
| [frontend/src/components/ui/menubar.tsx](/frontend/src/components/ui/menubar.tsx) | TypeScript JSX | 221 | 0 | 20 | 241 |
| [frontend/src/components/ui/popover.tsx](/frontend/src/components/ui/popover.tsx) | TypeScript JSX | 26 | 0 | 8 | 34 |
| [frontend/src/components/ui/progress.tsx](/frontend/src/components/ui/progress.tsx) | TypeScript JSX | 24 | 0 | 5 | 29 |
| [frontend/src/components/ui/resizable.tsx](/frontend/src/components/ui/resizable.tsx) | TypeScript JSX | 39 | 0 | 7 | 46 |
| [frontend/src/components/ui/scroll-area.tsx](/frontend/src/components/ui/scroll-area.tsx) | TypeScript JSX | 43 | 0 | 6 | 49 |
| [frontend/src/components/ui/select.tsx](/frontend/src/components/ui/select.tsx) | TypeScript JSX | 151 | 0 | 14 | 165 |
| [frontend/src/components/ui/separator.tsx](/frontend/src/components/ui/separator.tsx) | TypeScript JSX | 27 | 0 | 5 | 32 |
| [frontend/src/components/ui/skeleton.tsx](/frontend/src/components/ui/skeleton.tsx) | TypeScript JSX | 13 | 0 | 3 | 16 |
| [frontend/src/components/ui/sonner.tsx](/frontend/src/components/ui/sonner.tsx) | TypeScript JSX | 26 | 0 | 6 | 32 |
| [frontend/src/components/ui/switch.tsx](/frontend/src/components/ui/switch.tsx) | TypeScript JSX | 25 | 0 | 5 | 30 |
| [frontend/src/components/ui/table.tsx](/frontend/src/components/ui/table.tsx) | TypeScript JSX | 110 | 0 | 11 | 121 |
| [frontend/src/components/ui/tabs.tsx](/frontend/src/components/ui/tabs.tsx) | TypeScript JSX | 48 | 0 | 8 | 56 |
| [frontend/src/components/ui/textarea.tsx](/frontend/src/components/ui/textarea.tsx) | TypeScript JSX | 20 | 0 | 5 | 25 |
| [frontend/src/components/ui/toast.tsx](/frontend/src/components/ui/toast.tsx) | TypeScript JSX | 116 | 0 | 14 | 130 |
| [frontend/src/components/ui/toaster.tsx](/frontend/src/components/ui/toaster.tsx) | TypeScript JSX | 32 | 0 | 4 | 36 |
| [frontend/src/components/ui/toggle-group.tsx](/frontend/src/components/ui/toggle-group.tsx) | TypeScript JSX | 52 | 0 | 10 | 62 |
| [frontend/src/components/ui/toggle.tsx](/frontend/src/components/ui/toggle.tsx) | TypeScript JSX | 39 | 0 | 7 | 46 |
| [frontend/src/components/ui/tooltip.tsx](/frontend/src/components/ui/tooltip.tsx) | TypeScript JSX | 23 | 0 | 8 | 31 |
| [frontend/src/components/ui/use-toast.ts](/frontend/src/components/ui/use-toast.ts) | TypeScript | 160 | 3 | 32 | 195 |
| [frontend/src/extensions/AiGenerator/AiGenerator.tsx](/frontend/src/extensions/AiGenerator/AiGenerator.tsx) | TypeScript JSX | 95 | 0 | 12 | 107 |
| [frontend/src/extensions/AiGenerator/components/AiGeneratorView.tsx](/frontend/src/extensions/AiGenerator/components/AiGeneratorView.tsx) | TypeScript JSX | 162 | 189 | 25 | 376 |
| [frontend/src/extensions/AiGenerator/index.ts](/frontend/src/extensions/AiGenerator/index.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [frontend/src/extensions/AiImage/AiImage.tsx](/frontend/src/extensions/AiImage/AiImage.tsx) | TypeScript JSX | 81 | 4 | 13 | 98 |
| [frontend/src/extensions/AiImage/components/AiImageView.tsx](/frontend/src/extensions/AiImage/components/AiImageView.tsx) | TypeScript JSX | 0 | 190 | 25 | 215 |
| [frontend/src/extensions/AiImage/index.ts](/frontend/src/extensions/AiImage/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/AiWriter/AiWriter.tsx](/frontend/src/extensions/AiWriter/AiWriter.tsx) | TypeScript JSX | 81 | 4 | 13 | 98 |
| [frontend/src/extensions/AiWriter/components/AiWriterView.tsx](/frontend/src/extensions/AiWriter/components/AiWriterView.tsx) | TypeScript JSX | 187 | 30 | 26 | 243 |
| [frontend/src/extensions/AiWriter/index.ts](/frontend/src/extensions/AiWriter/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Citation/Citation.tsx](/frontend/src/extensions/Citation/Citation.tsx) | TypeScript JSX | 64 | 12 | 13 | 89 |
| [frontend/src/extensions/Citation/index.ts](/frontend/src/extensions/Citation/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Document/Document.ts](/frontend/src/extensions/Document/Document.ts) | TypeScript | 5 | 0 | 3 | 8 |
| [frontend/src/extensions/Document/index.ts](/frontend/src/extensions/Document/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Figcaption/Figcaption.ts](/frontend/src/extensions/Figcaption/Figcaption.ts) | TypeScript | 64 | 4 | 23 | 91 |
| [frontend/src/extensions/Figcaption/index.ts](/frontend/src/extensions/Figcaption/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Figure/Figure.ts](/frontend/src/extensions/Figure/Figure.ts) | TypeScript | 47 | 1 | 15 | 63 |
| [frontend/src/extensions/Figure/index.ts](/frontend/src/extensions/Figure/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/FontSize/FontSize.ts](/frontend/src/extensions/FontSize/FontSize.ts) | TypeScript | 57 | 0 | 8 | 65 |
| [frontend/src/extensions/FontSize/index.ts](/frontend/src/extensions/FontSize/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Heading/Heading.ts](/frontend/src/extensions/Heading/Heading.ts) | TypeScript | 12 | 0 | 4 | 16 |
| [frontend/src/extensions/Heading/index.ts](/frontend/src/extensions/Heading/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/HorizontalRule/HorizontalRule.ts](/frontend/src/extensions/HorizontalRule/HorizontalRule.ts) | TypeScript | 8 | 0 | 3 | 11 |
| [frontend/src/extensions/HorizontalRule/index.ts](/frontend/src/extensions/HorizontalRule/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Image/Image.ts](/frontend/src/extensions/Image/Image.ts) | TypeScript | 5 | 0 | 3 | 8 |
| [frontend/src/extensions/Image/index.ts](/frontend/src/extensions/Image/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/ImageBlock/ImageBlock.ts](/frontend/src/extensions/ImageBlock/ImageBlock.ts) | TypeScript | 88 | 0 | 16 | 104 |
| [frontend/src/extensions/ImageBlock/components/ImageBlockMenu.tsx](/frontend/src/extensions/ImageBlock/components/ImageBlockMenu.tsx) | TypeScript JSX | 111 | 0 | 13 | 124 |
| [frontend/src/extensions/ImageBlock/components/ImageBlockView.tsx](/frontend/src/extensions/ImageBlock/components/ImageBlockView.tsx) | TypeScript JSX | 52 | 1 | 11 | 64 |
| [frontend/src/extensions/ImageBlock/components/ImageBlockWidth.tsx](/frontend/src/extensions/ImageBlock/components/ImageBlockWidth.tsx) | TypeScript JSX | 32 | 0 | 7 | 39 |
| [frontend/src/extensions/ImageBlock/index.ts](/frontend/src/extensions/ImageBlock/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/ImageUpload/ImageUpload.ts](/frontend/src/extensions/ImageUpload/ImageUpload.ts) | TypeScript | 40 | 0 | 14 | 54 |
| [frontend/src/extensions/ImageUpload/index.ts](/frontend/src/extensions/ImageUpload/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/ImageUpload/view/ImageUpload.tsx](/frontend/src/extensions/ImageUpload/view/ImageUpload.tsx) | TypeScript JSX | 21 | 0 | 5 | 26 |
| [frontend/src/extensions/ImageUpload/view/ImageUploader.tsx](/frontend/src/extensions/ImageUpload/view/ImageUploader.tsx) | TypeScript JSX | 71 | 0 | 6 | 77 |
| [frontend/src/extensions/ImageUpload/view/hooks.ts](/frontend/src/extensions/ImageUpload/view/hooks.ts) | TypeScript | 88 | 0 | 25 | 113 |
| [frontend/src/extensions/ImageUpload/view/index.tsx](/frontend/src/extensions/ImageUpload/view/index.tsx) | TypeScript JSX | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Link/Link.ts](/frontend/src/extensions/Link/Link.ts) | TypeScript | 31 | 0 | 9 | 40 |
| [frontend/src/extensions/Link/index.ts](/frontend/src/extensions/Link/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/MultiColumn/Column.ts](/frontend/src/extensions/MultiColumn/Column.ts) | TypeScript | 26 | 0 | 8 | 34 |
| [frontend/src/extensions/MultiColumn/Columns.ts](/frontend/src/extensions/MultiColumn/Columns.ts) | TypeScript | 53 | 0 | 13 | 66 |
| [frontend/src/extensions/MultiColumn/index.ts](/frontend/src/extensions/MultiColumn/index.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [frontend/src/extensions/MultiColumn/menus/ColumnsMenu.tsx](/frontend/src/extensions/MultiColumn/menus/ColumnsMenu.tsx) | TypeScript JSX | 80 | 0 | 10 | 90 |
| [frontend/src/extensions/MultiColumn/menus/index.ts](/frontend/src/extensions/MultiColumn/menus/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/Selection/Selection.ts](/frontend/src/extensions/Selection/Selection.ts) | TypeScript | 30 | 0 | 7 | 37 |
| [frontend/src/extensions/Selection/index.ts](/frontend/src/extensions/Selection/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/SlashCommand/CommandButton.tsx](/frontend/src/extensions/SlashCommand/CommandButton.tsx) | TypeScript JSX | 29 | 0 | 5 | 34 |
| [frontend/src/extensions/SlashCommand/MenuList.tsx](/frontend/src/extensions/SlashCommand/MenuList.tsx) | TypeScript JSX | 117 | 2 | 29 | 148 |
| [frontend/src/extensions/SlashCommand/SlashCommand.ts](/frontend/src/extensions/SlashCommand/SlashCommand.ts) | TypeScript | 205 | 4 | 51 | 260 |
| [frontend/src/extensions/SlashCommand/groups.ts](/frontend/src/extensions/SlashCommand/groups.ts) | TypeScript | 173 | 2 | 5 | 180 |
| [frontend/src/extensions/SlashCommand/index.ts](/frontend/src/extensions/SlashCommand/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/SlashCommand/types.ts](/frontend/src/extensions/SlashCommand/types.ts) | TypeScript | 21 | 0 | 5 | 26 |
| [frontend/src/extensions/Table/Cell.ts](/frontend/src/extensions/Table/Cell.ts) | TypeScript | 100 | 0 | 26 | 126 |
| [frontend/src/extensions/Table/Header.ts](/frontend/src/extensions/Table/Header.ts) | TypeScript | 73 | 0 | 17 | 90 |
| [frontend/src/extensions/Table/Row.ts](/frontend/src/extensions/Table/Row.ts) | TypeScript | 6 | 0 | 3 | 9 |
| [frontend/src/extensions/Table/Table.ts](/frontend/src/extensions/Table/Table.ts) | TypeScript | 3 | 0 | 3 | 6 |
| [frontend/src/extensions/Table/index.ts](/frontend/src/extensions/Table/index.ts) | TypeScript | 4 | 0 | 1 | 5 |
| [frontend/src/extensions/Table/menus/TableColumn/index.tsx](/frontend/src/extensions/Table/menus/TableColumn/index.tsx) | TypeScript JSX | 62 | 0 | 10 | 72 |
| [frontend/src/extensions/Table/menus/TableColumn/utils.ts](/frontend/src/extensions/Table/menus/TableColumn/utils.ts) | TypeScript | 30 | 0 | 9 | 39 |
| [frontend/src/extensions/Table/menus/TableRow/index.tsx](/frontend/src/extensions/Table/menus/TableRow/index.tsx) | TypeScript JSX | 63 | 0 | 10 | 73 |
| [frontend/src/extensions/Table/menus/TableRow/utils.ts](/frontend/src/extensions/Table/menus/TableRow/utils.ts) | TypeScript | 30 | 0 | 9 | 39 |
| [frontend/src/extensions/Table/menus/index.tsx](/frontend/src/extensions/Table/menus/index.tsx) | TypeScript JSX | 2 | 0 | 1 | 3 |
| [frontend/src/extensions/Table/utils.ts](/frontend/src/extensions/Table/utils.ts) | TypeScript | 201 | 4 | 50 | 255 |
| [frontend/src/extensions/TableOfContentsNode/TableOfContentsNode.tsx](/frontend/src/extensions/TableOfContentsNode/TableOfContentsNode.tsx) | TypeScript JSX | 52 | 0 | 9 | 61 |
| [frontend/src/extensions/TableOfContentsNode/index.ts](/frontend/src/extensions/TableOfContentsNode/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/TrailingNode/index.ts](/frontend/src/extensions/TrailingNode/index.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [frontend/src/extensions/TrailingNode/trailing-node.ts](/frontend/src/extensions/TrailingNode/trailing-node.ts) | TypeScript | 54 | 7 | 13 | 74 |
| [frontend/src/extensions/extension-kit.ts](/frontend/src/extensions/extension-kit.ts) | TypeScript | 120 | 9 | 5 | 134 |
| [frontend/src/extensions/index.ts](/frontend/src/extensions/index.ts) | TypeScript | 35 | 2 | 2 | 39 |
| [frontend/src/hooks/useBlockEditor.ts](/frontend/src/hooks/useBlockEditor.ts) | TypeScript | 65 | 24 | 16 | 105 |
| [frontend/src/hooks/usePdfViewer.tsx](/frontend/src/hooks/usePdfViewer.tsx) | TypeScript JSX | 116 | 1 | 21 | 138 |
| [frontend/src/lib/api.ts](/frontend/src/lib/api.ts) | TypeScript | 25 | 113 | 23 | 161 |
| [frontend/src/lib/constants.ts](/frontend/src/lib/constants.ts) | TypeScript | 8 | 0 | 1 | 9 |
| [frontend/src/lib/data/daily_ibm_full.ts](/frontend/src/lib/data/daily_ibm_full.ts) | TypeScript | 43,068 | 0 | 0 | 43,068 |
| [frontend/src/lib/data/earnings_ibm.ts](/frontend/src/lib/data/earnings_ibm.ts) | TypeScript | 1,019 | 0 | 1 | 1,020 |
| [frontend/src/lib/data/income_statement_ibm.ts](/frontend/src/lib/data/income_statement_ibm.ts) | TypeScript | 2,079 | 0 | 1 | 2,080 |
| [frontend/src/lib/data/initialContent.ts](/frontend/src/lib/data/initialContent.ts) | TypeScript | 748 | 0 | 2 | 750 |
| [frontend/src/lib/data/newAmazonReport.tsx](/frontend/src/lib/data/newAmazonReport.tsx) | TypeScript JSX | 843 | 0 | 3 | 846 |
| [frontend/src/lib/data/tickers.ts](/frontend/src/lib/data/tickers.ts) | TypeScript | 30 | 0 | 2 | 32 |
| [frontend/src/lib/data/weekly_ibm.ts](/frontend/src/lib/data/weekly_ibm.ts) | TypeScript | 8,935 | 0 | 1 | 8,936 |
| [frontend/src/lib/queries.ts](/frontend/src/lib/queries.ts) | TypeScript | 12 | 0 | 3 | 15 |
| [frontend/src/lib/supabase/client.ts](/frontend/src/lib/supabase/client.ts) | TypeScript | 7 | 0 | 2 | 9 |
| [frontend/src/lib/supabase/database.types.ts](/frontend/src/lib/supabase/database.types.ts) | TypeScript | 266 | 0 | 7 | 273 |
| [frontend/src/lib/supabase/middleware.ts](/frontend/src/lib/supabase/middleware.ts) | TypeScript | 64 | 10 | 5 | 79 |
| [frontend/src/lib/supabase/server.ts](/frontend/src/lib/supabase/server.ts) | TypeScript | 29 | 6 | 3 | 38 |
| [frontend/src/lib/utils.ts](/frontend/src/lib/utils.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [frontend/src/lib/utils/cssVar.ts](/frontend/src/lib/utils/cssVar.ts) | TypeScript | 11 | 0 | 4 | 15 |
| [frontend/src/lib/utils/database.types.ts](/frontend/src/lib/utils/database.types.ts) | TypeScript | 266 | 0 | 7 | 273 |
| [frontend/src/lib/utils/formatText.ts](/frontend/src/lib/utils/formatText.ts) | TypeScript | 49 | 2 | 9 | 60 |
| [frontend/src/lib/utils/getRenderContainer.ts](/frontend/src/lib/utils/getRenderContainer.ts) | TypeScript | 33 | 2 | 9 | 44 |
| [frontend/src/lib/utils/index.ts](/frontend/src/lib/utils/index.ts) | TypeScript | 15 | 0 | 4 | 19 |
| [frontend/src/lib/utils/isCustomNodeSelected.ts](/frontend/src/lib/utils/isCustomNodeSelected.ts) | TypeScript | 49 | 0 | 10 | 59 |
| [frontend/src/lib/utils/isTextSelected.ts](/frontend/src/lib/utils/isTextSelected.ts) | TypeScript | 17 | 3 | 6 | 26 |
| [frontend/src/lib/utils/multi-line-highlight.ts](/frontend/src/lib/utils/multi-line-highlight.ts) | TypeScript | 183 | 16 | 29 | 228 |
| [frontend/src/lib/utils/nanoId.ts](/frontend/src/lib/utils/nanoId.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [frontend/src/providers/store-provider.tsx](/frontend/src/providers/store-provider.tsx) | TypeScript JSX | 24 | 0 | 10 | 34 |
| [frontend/src/stores/citations-store.ts](/frontend/src/stores/citations-store.ts) | TypeScript | 25 | 2 | 5 | 32 |
| [frontend/src/stores/documents-store.ts](/frontend/src/stores/documents-store.ts) | TypeScript | 31 | 0 | 7 | 38 |
| [frontend/src/stores/editor-store.ts](/frontend/src/stores/editor-store.ts) | TypeScript | 25 | 0 | 3 | 28 |
| [frontend/src/stores/pdf-store.ts](/frontend/src/stores/pdf-store.ts) | TypeScript | 25 | 1 | 4 | 30 |
| [frontend/src/stores/sidebar-tabs-store.ts](/frontend/src/stores/sidebar-tabs-store.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [frontend/src/stores/store.ts](/frontend/src/stores/store.ts) | TypeScript | 37 | 5 | 3 | 45 |
| [frontend/src/styles/index.css](/frontend/src/styles/index.css) | CSS | 37 | 0 | 13 | 50 |
| [frontend/src/styles/partials/animations.css](/frontend/src/styles/partials/animations.css) | CSS | 37 | 0 | 3 | 40 |
| [frontend/src/styles/partials/blocks.css](/frontend/src/styles/partials/blocks.css) | CSS | 41 | 6 | 15 | 62 |
| [frontend/src/styles/partials/code.css](/frontend/src/styles/partials/code.css) | CSS | 61 | 0 | 13 | 74 |
| [frontend/src/styles/partials/collab.css](/frontend/src/styles/partials/collab.css) | CSS | 10 | 0 | 2 | 12 |
| [frontend/src/styles/partials/lists.css](/frontend/src/styles/partials/lists.css) | CSS | 42 | 0 | 12 | 54 |
| [frontend/src/styles/partials/placeholder.css](/frontend/src/styles/partials/placeholder.css) | CSS | 20 | 3 | 5 | 28 |
| [frontend/src/styles/partials/table.css](/frontend/src/styles/partials/table.css) | CSS | 107 | 0 | 26 | 133 |
| [frontend/src/styles/partials/typography.css](/frontend/src/styles/partials/typography.css) | CSS | 70 | 0 | 19 | 89 |
| [frontend/src/types/report.ts](/frontend/src/types/report.ts) | TypeScript | 27 | 0 | 5 | 32 |
| [frontend/src/types/supabase.ts](/frontend/src/types/supabase.ts) | TypeScript | 3 | 0 | 2 | 5 |
| [frontend/tailwind.config.ts](/frontend/tailwind.config.ts) | TypeScript | 78 | 0 | 3 | 81 |
| [frontend/tsconfig.json](/frontend/tsconfig.json) | JSON with Comments | 26 | 0 | 1 | 27 |
| [supabase/migrations/20240418061830_create_reports_table.sql](/supabase/migrations/20240418061830_create_reports_table.sql) | SQL | 26 | 0 | 1 | 27 |
| [supabase/migrations/20240418063213_remote_schema.sql](/supabase/migrations/20240418063213_remote_schema.sql) | SQL | 29 | 0 | 30 | 59 |
| [supabase/migrations/20240418063432_create_vector_table.sql](/supabase/migrations/20240418063432_create_vector_table.sql) | SQL | 29 | 1 | 5 | 35 |
| [supabase/migrations/20240418065307_remote_schema.sql](/supabase/migrations/20240418065307_remote_schema.sql) | SQL | 15 | 0 | 9 | 24 |
| [supabase/seed.sql](/supabase/seed.sql) | SQL | 0 | 0 | 1 | 1 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)