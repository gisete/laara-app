# SKILL: Create a New Screen

Use this skill whenever creating a new Expo Router screen in Laara.
Read this fully before writing any code.

---

## When to use this skill

- Adding a new tab screen in `app/(tabs)/`
- Adding a new flow screen (e.g. `app/log-session/some-step.tsx`)
- Adding a new modal/form screen (e.g. `app/add-material/new-type.tsx`)

---

## Step 1 — Decide the file location

| Screen type | Location |
|---|---|
| Tab screen | `app/(tabs)/name.tsx` |
| Flow step | `app/flow-name/step-name.tsx` |
| Form/modal | `app/flow-name/[param].tsx` |

Register new tabs in `app/(tabs)/_layout.tsx`.

---

## Step 2 — Use the standard screen shell

```tsx
// app/[path]/screen-name.tsx
import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";

export default function ScreenNameScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // Use useFocusEffect (not useEffect) when data should refresh on re-focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      // const result = await querySomething();
      // setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSomeAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // ...
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryAccent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.content}>
        {/* screen content */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

## Step 3 — Form screens (add/edit)

If the screen is a form, use this extended pattern:

```tsx
export default function FormScreen() {
  const params = useLocalSearchParams();
  const materialId = params.id ? parseInt(params.id as string) : null;
  const isEditMode = materialId !== null;

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        <FormHeader
          title={isEditMode ? "Edit X" : "Add X"}
          onBack={() => router.back()}
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* form fields */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Field Label</Text>
              <TextInput
                style={[styles.input, focusedField === "fieldName" && styles.inputFocused]}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocusedField("fieldName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ActionButtons OUTSIDE KeyboardAvoidingView — this is intentional */}
        <View style={styles.buttonContainer}>
          <ActionButtons
            onSave={handleSave}
            onCancel={() => router.back()}
            saveText={isEditMode ? "Save Changes" : "Add to Library"}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: colors.gray50 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.gray50,
  },
  formSection: { marginBottom: spacing.lg },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.grayMedium,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.grayDarkest,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.sm,
    minHeight: 48,
  },
  inputFocused: { borderColor: colors.primaryAccent },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl * 2,
  },
});
```

---

## Checklist

Before finishing a new screen:

- [ ] Uses `SafeAreaView` + `StatusBar` at root
- [ ] Uses `globalStyles.container` on SafeAreaView
- [ ] All colors from `@theme/colors` (no hardcoded hex)
- [ ] All spacing from `@theme/spacing`
- [ ] Data loaded via query function from `@database/queries` (not inline SQL)
- [ ] Loading state handled with `ActivityIndicator`
- [ ] User actions trigger `Haptics.impactAsync`
- [ ] If data refreshes on focus: uses `useFocusEffect` + `useCallback`
- [ ] TypeScript interfaces defined for all props and state shapes
- [ ] No `console.log` left in production code (console.error for errors only)
