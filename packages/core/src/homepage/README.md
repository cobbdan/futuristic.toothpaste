# Strands Agents SDK Homepage

This directory contains the implementation of the Strands Agents SDK homepage based on the Figma design provided in issue #52.

## Files

- `index.html` - Complete standalone HTML homepage
- `homepageViewProvider.ts` - VS Code extension integration example
- `../../resources/css/homepage.css` - Stylesheet with complete styling

## Features

### Navigation
- **Logo**: STRANDS AGENTS SDK branding with gradient icon
- **Version Dropdown**: Shows current version (0.0.x)
- **Dark Mode Toggle**: Button for theme switching
- **Search**: Input field with search functionality
- **GitHub Stats**: Version, stars, and forks display
- **Secondary Navigation**: Home, User Guide, Examples, API Reference, Contribute

### Content Sections
- **Hero Section**: Main title, description, and call-to-action button
- **Features Section**: Four key benefits with icons and descriptions
- **Background Animation**: Animated green gradient vectors

### Responsive Design
- Mobile-first approach
- Breakpoints at 1200px, 768px, and 480px
- Flexible layout that adapts to different screen sizes

## Integration

The homepage can be integrated into VS Code extensions in several ways:

### 1. Standalone Webview
Use `index.html` directly as a webview panel or page.

### 2. VS Code Extension View
Use `homepageViewProvider.ts` as an example to integrate into the sidebar or panel system:

```typescript
import { registerHomepageCommands } from './homepage/homepageViewProvider'

export function activate(context: vscode.ExtensionContext) {
    registerHomepageCommands(context)
}
```

### 3. Template Integration
Use with the existing `BaseTemplates` system for consistent CSP and structure.

## Design Specifications

### Colors
- **Calm Black**: #0E0E0E
- **Cyber Green**: #00FF77  
- **Grey Palette**: #F9F9F9, #EFEFEF, #E0E0E0, #777777, #555555, #1F1F1F, #161616

### Typography
- **Font Family**: Figtree (with system fallbacks)
- **Hero Title**: 64px, font-weight 600, line-height 1.1
- **Feature Titles**: 24px, font-weight 400, line-height 1.5
- **Body Text**: 16px, font-weight 400, line-height 1.5

### Layout
- **Max Width**: 1280px for navbar, 1024px for content
- **Padding**: Responsive padding (128px desktop, 32px mobile)
- **Grid System**: Flexible grid for features section

## Development

To preview the homepage:

1. Serve the HTML file with a local server
2. Ensure CSS path is correctly referenced
3. Test responsive behavior at different screen sizes

## Notes

- The implementation follows the existing codebase patterns for webviews
- SVG icons are simplified for demonstration; full icon set can be added as needed
- Interactive features (search, dropdowns) are styled but not fully functional
- Integration with VS Code commands and messaging is demonstrated in the provider example