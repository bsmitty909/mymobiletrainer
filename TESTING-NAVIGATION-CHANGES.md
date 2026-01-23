# Testing Navigation Changes - Quick Start Guide

**Issue:** The navigation changes are in the code but not visible in the running app.

---

## 🔄 Step 1: Reload the App

The Expo dev server is running, but you need to reload the app to pick up the navigation changes.

### Option A: In the Expo App (Physical Device or Simulator)
1. **Shake your device** (or press `Cmd+D` on iOS Simulator / `Cmd+M` on Android Emulator)
2. Select **"Reload"** from the developer menu

### Option B: In the Terminal
In your Expo terminal, press:
- **`r`** - Reload the app
- **`shift+r`** - Restart and clear cache

---

## 🧹 Step 2: Clear Persisted State (If Onboarding Doesn't Show)

The app may have persisted `isOnboarded: true` from previous sessions, preventing onboarding from showing.

### Quick Fix: Reset App State

**Method 1: Clear App Data (Recommended)**
1. Stop the Expo dev server (Ctrl+C in terminal)
2. Clear the app data:
   - **iOS Simulator:** Delete the app and reinstall
   - **Android Emulator:** Settings → Apps → Expo Go → Clear Data
   - **Physical Device:** Uninstall and reinstall the Expo Go app
3. Restart Expo: `cd /Users/brandonsmith/Documents/mymobiletrainer/app && npx expo start`

**Method 2: Temporary isOnboarded Override**
If you want to force onboarding to show for testing, modify the userSlice temporarily:

```bash
# Edit the file to force isOnboarded to false
```

Location: `app/src/store/slices/userSlice.ts` line 13

Change:
```typescript
isOnboarded: false,  // Already set to false, should work
```

If it's somehow set to `true`, change it back to `false`.

---

## 🎯 Step 3: Verify Navigation Changes

Once you reload, you should see:

### ✅ On First Launch (isOnboarded = false)
**Onboarding Flow (5 screens):**
1. **Welcome Screen** - Initial welcome
2. **Training Mode Onboarding** ⭐ NEW - Choose percentage vs protocol
3. **Max Determination Intro** - Explain max testing
4. **Max Testing** - Test your maxes
5. **Max Summary** - Review results

### ✅ After Onboarding (isOnboarded = true)
**Main App with 4 Tabs:**
1. **Workout Tab** - 6 screens including MaxAttemptScreen
2. **Progress Tab** - 3 screens
3. **Exercises Tab** - 2 screens  
4. **Profile Tab** - 16 screens including:
   - Settings → **Training Mode Settings** ⭐ NEW
   - **Protocol Analytics** ⭐ NEW
   - **Mode Comparison** ⭐ NEW

**Global Modal (accessible anywhere):**
- **Protocol Trainer Dashboard** ⭐ NEW - Press any button that navigates to this

---

## 🐛 Troubleshooting

### Issue: "I still don't see onboarding"

**Check the userSlice state:**
```bash
# Verify isOnboarded is false
cat app/src/store/slices/userSlice.ts | grep -A 5 "initialState"
```

Should show:
```typescript
const initialState: UserState = {
  currentUser: null,
  profile: null,
  isOnboarded: false,  // ← Should be false
  loading: false,
  error: null,
};
```

**If it's `true`, change it to `false`:**
```bash
cd /Users/brandonsmith/Documents/mymobiletrainer/app && \
sed -i.bak 's/isOnboarded: true,/isOnboarded: false,/g' src/store/slices/userSlice.ts
```

### Issue: "I see errors or blank screens"

**Check for runtime errors:**
1. Look at the Expo terminal for error messages
2. Open React Native Debugger (Cmd+D → Debug)
3. Check console for TypeScript or runtime errors

**Common fixes:**
```bash
# Clear Metro bundler cache
cd /Users/brandonsmith/Documents/mymobiletrainer/app && \
npx expo start -c

# Reinstall dependencies (if needed)
rm -rf node_modules && npm install
```

---

## 📱 Quick Test Checklist

Once app is reloaded:

- [ ] Onboarding flow appears on first launch
- [ ] Training Mode Onboarding screen is visible (screen 2 of 5)
- [ ] Can complete full onboarding flow
- [ ] Main tabs appear after onboarding
- [ ] Can navigate to Training Mode Settings (Profile → Settings)
- [ ] Can navigate to Protocol Analytics (Profile tab)
- [ ] Can navigate to Mode Comparison (from Analytics)
- [ ] Protocol Trainer Dashboard accessible (modal)

---

## 🚀 Next Steps After Verification

Once you confirm the navigation changes are working:

1. **Test the new screens** - Navigate through each new screen
2. **Verify functionality** - Make sure buttons and forms work
3. **Check data flow** - Ensure state updates correctly
4. **Test Protocol features** - Try P1/P2/P3 protocols
5. **Review documentation** - See `SCREEN-NAVIGATION-INTEGRATION-COMPLETE.md`

---

## 💡 Pro Tips

**Force Different States:**
- To see onboarding again: Set `isOnboarded: false` in userSlice
- To skip onboarding: Set `isOnboarded: true` in userSlice
- To test modal: Add a test button that calls `navigation.navigate('ProtocolTrainerDashboard')`

**Monitor Changes:**
- Watch the Expo terminal for hot reload notifications
- Look for "Reloading..." messages when files change
- Check for compilation errors in the terminal

---

## 📞 Still Having Issues?

If the changes still aren't visible after following these steps, the issue might be:

1. **Cache problem** - Try `npx expo start -c` (clear cache)
2. **Bundle not updating** - Stop and restart Expo completely
3. **Platform-specific issue** - Try a different platform (iOS vs Android)
4. **Persisted storage** - The app might use AsyncStorage that needs clearing

**Debug command:**
```bash
cd /Users/brandonsmith/Documents/mymobiletrainer/app && \
npx expo start -c --clear 2>&1 | tee /tmp/expo-debug.log
```

This will show all errors and you can review the log file.

---

**Last Updated:** 2026-01-16  
**All Changes Made:** Navigation routes, TypeScript types, screen integrations  
**Ready for Testing:** ✅ Yes - Just needs app reload
