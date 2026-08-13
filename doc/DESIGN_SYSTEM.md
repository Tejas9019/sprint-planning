# Authentication Components - Design System

## Design Philosophy

The authentication components follow a **clean, minimalist design** inspired by Google Calendar's interface, featuring:
- Light theme with white backgrounds
- Blue accent color for primary actions
- Clear visual hierarchy
- Accessibility-first approach
- Responsive design for all screen sizes

## Color Palette

### Primary Colors
```
Primary Blue:      #1a73e8 (Action buttons, links, focused states)
Light Blue:        #f8fafd (Hover backgrounds)
Active Blue:       #e8f0fe (Active/selected states)
```

### Neutral Colors
```
White:             #ffffff (Background, cards)
Light Gray:        #f1f3f4 (Secondary backgrounds)
Border Gray:       #dadce0 (Borders, dividers)
Text Primary:      #3c4043 (Body text)
Text Secondary:    #70757a (Labels, hints)
Text Heading:      #1f1f1f (Titles, form labels)
```

### Status Colors
```
Error Red:         #e53e3e (Error messages, invalid states)
Error Light:       #fed7d7 (Error backgrounds)
Success Green:     #48bb78 (Success messages)
Success Light:     #c6f6d5 (Success backgrounds)
```

## Typography

### Font Family
- Primary: Roboto (default system font)
- Fallback: Arial, sans-serif

### Font Sizes & Weights

| Element | Size | Weight | Line Height |
|---------|------|--------|------------|
| Page Title (h1) | 30px | 700 | 1.2 |
| Subheading (h2) | 20px | 600 | 1.3 |
| Form Label | 14px | 500 | 1.4 |
| Body Text | 14px | 400 | 1.5 |
| Small Text | 12px | 400 | 1.4 |
| Button | 14px | 500 | 1.2 |

## Spacing System

Based on 4px unit:
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
```

### Component Spacing
- Form fields: 16px vertical gap
- Field groups: 24px vertical gap
- Buttons: 16px padding (horizontal), 12px (vertical)
- Container: 40px padding on desktop, 16px on mobile
- Max width: 448px (medium screens)

## Input Fields

### Style
- **Border**: 2px solid
- **Padding**: 12px 16px
- **Border Radius**: 8px
- **Transition**: 0.3s ease
- **Height**: 48px

### States

**Default**
- Border: #dadce0 (gray)
- Background: white
- Text: #3c4043

**Hover**
- Border: #dadce0 (unchanged)
- Background: white (unchanged)
- Cursor: pointer

**Focus**
- Border: #1a73e8 (blue)
- Background: white
- Shadow: None (clean design)

**Error**
- Border: #e53e3e (red)
- Background: #fed7d7 (light red)
- Text: #c53030 (dark red)

**Disabled**
- Border: #dadce0 (gray)
- Background: #f1f3f4 (light gray)
- Text: #70757a (secondary gray)
- Cursor: not-allowed

## Buttons

### Primary Button (Main Action)
```
Background: #1a73e8 (blue)
Text: white
Padding: 12px 16px
Border Radius: 8px
Font Weight: 500
```

**Hover**
- Background: #1765cc (darker blue)
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

**Active**
- Background: #1558a4 (darkest blue)
- Shadow: inset 0 2px 4px rgba(0,0,0,0.1)

**Disabled**
- Background: #9ca3af (gray)
- Cursor: not-allowed
- Opacity: 0.6

### Secondary Button (Text)
```
Background: transparent
Text: #1a73e8 (blue)
Border: none
Font Weight: 500
```

**Hover**
- Text: #1765cc (darker blue)
- Background: rgba(26, 115, 232, 0.04)

## Form Layout

### Single Column (Mobile & Tablet)
- Max width: 448px
- Margin: 0 auto
- Padding: 16px (mobile), 32px (tablet/desktop)

### Two Column Row (Desktop)
- Used for: First name + Last name
- Gap: 16px between columns
- Responsive: Stacks on mobile

## Error & Success Messages

### Error State
```
Background: #fed7d7 (light red)
Border: 1px solid #fc8181 (medium red)
Text: #c53030 (dark red)
Icon: AlertCircle (lucide)
Padding: 12px 16px
Border Radius: 8px
```

### Success State
```
Background: #c6f6d5 (light green)
Border: 1px solid #9ae6b4 (medium green)
Text: #276749 (dark green)
Icon: CheckCircle (lucide)
Padding: 12px 16px
Border Radius: 8px
```

## Checkboxes & Toggles

### Checkbox
- Size: 20px × 20px
- Border: 2px solid #dadce0
- Border Radius: 4px
- Transition: 0.2s

**Checked**
- Background: #1a73e8
- Border: #1a73e8
- Icon: ✓ (white)

**Focus**
- Ring: 2px solid #1a73e8
- Ring Offset: 2px

## Icons

### Sizes
- Small: 16px × 16px (inline)
- Medium: 20px × 20px (input toggles)
- Large: 32px × 32px (headers)

### Sources
- Lucide Icons library
- Colors: Match text or action context

### Commonly Used
- Eye / EyeOff: Password toggle
- AlertCircle: Error messages
- CheckCircle: Success messages
- Mail: Email verification
- ArrowLeft: Navigation back

## Shadow System

### Card Shadow
```
0 1px 2px rgba(60, 64, 67, 0.3),
0 1px 3px rgba(60, 64, 67, 0.15)
```

### Hover Shadow (Buttons)
```
0 2px 4px rgba(0, 0, 0, 0.1)
```

### Focus Shadow
```
0 0 0 3px rgba(26, 115, 232, 0.1)
```

## Breakpoints

```
Mobile:     320px - 640px
Tablet:     641px - 1024px
Desktop:    1025px+
```

## Responsive Design

### Mobile (320px - 640px)
- Full width form
- 16px padding
- Single column layout
- Touch-friendly buttons (48px min height)
- Larger fonts for readability

### Tablet (641px - 1024px)
- Max width: 448px
- 32px padding
- Same as desktop layout
- 20px font sizes

### Desktop (1025px+)
- Max width: 448px
- Centered on screen
- 40px padding
- Comfortable whitespace

## Animations & Transitions

### Border Transitions
- Duration: 0.3s
- Timing: ease
- Used on: focus states, error states

### Color Transitions
- Duration: 0.2s
- Timing: ease
- Used on: button hover, link hover

### Shadow Transitions
- Duration: 0.3s
- Timing: ease
- Used on: button hover, focus

## Accessibility

### Color Contrast
- Normal text (14px+): 4.5:1 ratio minimum
- Large text (18px+): 3:1 ratio minimum
- All interactive elements: 4.5:1 contrast

### Focus Indicators
- Always visible
- High contrast
- Outline: 2px
- Offset: 2px

### Touch Targets
- Minimum size: 44px × 44px
- Icon buttons: 48px × 48px
- Input fields: 48px height

## Implementation Notes

All components are built with **Tailwind CSS** for consistency and easy customization. Color values are defined as CSS custom properties in `index.css` and can be changed globally.

### Custom Tailwind Config
```tsx
// In tailwind.config.ts or via CSS variables
--bg-primary: #ffffff
--text-primary: #3c4043
--google-blue: #1a73e8
```

## Usage Example

```tsx
// Button classes
className="bg-blue-600 hover:bg-blue-700"

// Input classes
className="border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500"

// Error state
className="border-red-500 bg-red-50 focus:border-red-600"
```
