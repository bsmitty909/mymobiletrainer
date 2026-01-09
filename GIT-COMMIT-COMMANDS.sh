#!/bin/bash
# Git commands to preserve current state before redesign
# Run these commands from the project root directory

# Check current status
git status

# Add all the new design system files
git add plans/DESIGN-SYSTEM-2024.md
git add REDESIGN-IMPLEMENTATION-GUIDE.md
git add app/src/theme/designTokens.ts
git add app/src/components/common/Button.tsx
git add app/src/utils/useThemeColors.ts
git add app/App.tsx

# Create the commit
git commit -m "feat: Add modern design system foundation (Phase 1)

- Create comprehensive design system inspired by Nike/Hevy
- Add design tokens with modern color palette (#0066FF primary)
- Implement new typography scale and spacing system
- Create modern Button component with animations
- Update theme system with enhanced colors
- Add detailed implementation guide

This preserves all existing functionality while establishing
the foundation for a professional app redesign.

Files added:
- plans/DESIGN-SYSTEM-2024.md (complete design specification)
- REDESIGN-IMPLEMENTATION-GUIDE.md (roadmap and guidelines)
- app/src/theme/designTokens.ts (centralized design tokens)
- app/src/components/common/Button.tsx (modern button component)

Files modified:
- app/src/utils/useThemeColors.ts (enhanced color system)
- app/App.tsx (updated theme colors)

Next: Phase 2 - Update common components"

# Show the commit
git log -1 --stat

echo ""
echo "✅ Commit created successfully!"
echo ""
echo "You can now safely proceed with the redesign."
echo "To revert to this state later, use: git checkout HEAD"
