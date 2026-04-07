# Page Builder System Documentation ("The memory")

This document details the architecture, data structures, and implementation of the Page Builder system located at `/admin/pages`.

## 1. Project Rules & Standards
- **Memory Management**: Keep `plan.md` updated with all important project "memories".
- **File Size Limit**: No file should exceed **350 lines of code**. Large files must be refactored into smaller, modular components.

## 2. Current Status (Home Page & Modular Refactor)
- **Modularization**: All major Page Builder files have been split into modular sub-components and specialized renderers.
- **Line Limit**: Every file in the system is now **under 350 lines**, ensuring ease of maintenance.
- **Home Migration**: The Home page is now a fully functional Page Builder page with 10 specialized, non-deletable blocks.
- **Page Safety**: "Home", "About", and "Contact" pages are protected from deletion in the listing view.

## 3. Modular Architecture (New Structure)

### Admin Workspace (`src/pages/admin/`)
- `PageManagement.tsx`: Listing and creation (under 100 lines).
- `PageEditor.tsx`: Main workspace and preview layout (~130 lines).

### Refactored Components (`src/components/admin/page-builder/`)
- **Core Elements**: `BlockList`, `SortableBlock`, `PageCard`, `AddPageDialog`.
- **Dialogs**: `AddBlockDialog`, `EditBlockDialog`.
- **Forms**: `BlockEditorForm` (Coordinates fields).
- **Sub-Fields (`/fields/`)**: `AlignmentToggle`, `Field`, `ImageField`, `CTABackgroundEditor`.
- **Item Editor**: `ItemListEditor`, `ItemFieldDefs`, `MediaPicker` (highly modular).
- **Renderers (`/renderers/`)**:
    - `rendererUtils`: Shared icons (Lucide) and image URL helpers.
    - `BaseRenderer`: Styling wrappers and CSS logic (`buildBlockStyle`).
    - `CommonRenderers`: Hero (supports `slides[]`), Text (RichText), Image.
    - `ComplexRenderers`: Image-Text, Why-Us (icons), CTA.
    - `GridRenderers`: Cards, Stats, FAQ, Logos, Blog.

## 4. Migration & Page-Specific Rules

### Home Page Logic
- **Auto-Population**: If the Home page blocks are empty upon editor launch, they are automatically pre-populated with the 10 standard locked blocks.
- **Full Customizability**: Every section (Hero, About, Stats, etc.) is fully editable via specialized fields and a multi-item slide editor.
- **Locked Blocks**: Initial blocks have `isLocked: true`, hiding the "Remove" button.
- **Fixed Slider**: The first block (Slider) has `isFixed: true`, disabling its drag handle and reordering.
- **Allowed Blocks**: On the Home page, the "Add Block" modal is filtered to only show common sections.

### Type System (`src/types/pageBuilder.ts`)
- `isLocked`: Prevents removal of a block.
- `isFixed`: Prevents reordering of a block.
- **`slides` vs `items`**: The `hero` block uses a `slides` array for its slider data, while other multi-item blocks (stats, faq, features) use `items`. The `ItemListEditor` handles both automatically.
- **`paragraphs` Management**: In `about-split` or `image-text`, multiple paragraphs are currently edited via a single `RichTextEditor` and synced to the `paragraphs` array as the first element for simplicity.
- **New Block Types**: Added `qualification_hero`, `about-split`, `popular-qualifications`, and `features`.

## 5. System Overview
The Page Builder is a block-based Content Management System (CMS) that allows administrators to build pages by stacking modular "Content Blocks".

### Page Types Supported:
- **Static Pages**: General purpose pages (e.g., `services`, `custom-landing-page`).
- **Qualification Details**: Extended info for course pages.
- **Blog Posts**: Content for articles.

---

## 2. Core Components & Architecture

### Admin Interface (`src/pages/admin/`)
- **`PageManagement.tsx`**: High-level dashboard to list, create, and delete pages.
- **`PageEditor.tsx`**: The main workspace.
    - Uses `@dnd-kit` for vertical block reordering.
    - Features a side-by-side **Live Preview** using `BlockPreviewRenderer`.
    - Manages global page state (Title, Slug, SEO Meta, Published status).
- **`BlockEditorForm.tsx`**: The granular editor for block data.
- **`SEOPanel.tsx`**: Dedicated section for meta titles and descriptions.

### API & State (`src/redux/apis/pageBuilderApi.ts`)
- The system communicates with a backend API using Redux Toolkit Query.
- **Important**: Blocks are stored as an array of objects but are often sent/received as a **JSON string** in the `blocks` field of the page payload. Use `safeParseBlocks` when reading.

---

## 3. How Inputs are Managed (`BlockEditorForm.tsx`)

Managing inputs is the most complex part of the builder. It follows these principles:

### A. Local State Sync
Instead of updating the global Redux state on every keystroke, `BlockEditorForm` clones the block's data into a **local state** (`local`).
- Changes are only "pushed" to the parent `PageEditor` when the user clicks **"Save Changes"**.
- This prevents unnecessary re-renders of the entire page for small text edits.

### B. Field Rendering Logic
The form dynamically renders inputs based on the block's `type` and the keys present in its `data` object:
- **Text/Title**: Uses standard `Input` components.
- **Long Content**: Managed by `RichTextEditor` (typically a wrapper around a library like TipTap or similar).
- **Images**: Managed by `ImageField`. It includes:
    1. A file browser button.
    2. An immediate upload trigger using `useUploadCMSImageMutation`.
    3. Tracking of `isUploading` to disable the "Save" button until the server returns the image URL.
- **Lists (Items)**: Managed by `ItemListEditor`. This allows adding/removing items (e.g., FAQ rows, Module steps) and editing their internal fields.

### C. Styling & Alignment
- Every block has a **Global Alignment** toggle (Left/Center/Right).
- A **`BlockStylePanel`** allows for advanced CSS-like controls (Padding, Margin, Text Color, Background Color/Image) without writing code.

---

## 4. Data Structure (`ContentBlock`)

Located in `src/types/pageBuilder.ts`. A block object looks like this:

```typescript
{
  id: "block_123456789", // Unique ID generated on creation
  type: "hero",          // The block type (hero, text, etc.)
  label: "Hero Banner",  // Human-readable label for the admin
  alignment: "center",   // Global text alignment
  style: { ... },        // Custom CSS properties (padding, colors)
  data: {                // The content specific to this block
    title: "Welcome",
    subtitle: "...",
    image: "/url/to/image.jpg"
  }
}
```

---

## 5. Frontend Rendering Strategy

The frontend (public pages) does NOT use the exact same code as the admin preview.

1. **Fetching**: The page component (e.g., `QualificationDetail`) requests the page by slug.
2. **Parsing**: The `blocks` string is parsed into an array.
3. **Dispatching**: The component loops through the blocks and sends them to a **Block Renderer**.
4. **Implementation**:
    - `QualificationDetail.tsx` has its own `QualificationBlockRenderer`.
    - `BlogDetail.tsx` has `BlogBlockRenderer`.
    - These renderers use Tailwind CSS to recreate the design seen in the editor preview.

---

## 6. Developer Guidelines

### Adding a New Block Type
1. Define the block interface in `src/types/pageBuilder.ts`.
2. Add the type to the `BlockType` union and `BLOCK_TYPE_LABELS`.
3. Add default data in `getDefaultBlockData`.
4. Update `BlockEditorForm.tsx` to include the new fields.
5. Update `BlockPreviewRenderer.tsx` (Admin side) to show the preview.
6. Update the public renderers (e.g., `QualificationBlockRenderer`) to handle the new type.

### Memory Reminders
- **Slug Management**: Slugs are normalized to lowercase/kebab-case.
- **JSON Safety**: Always use the `TryCatch` and `handleResponse` utilities for API calls to ensure consistent error handling and toast notifications.
