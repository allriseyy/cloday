// components/Typography.tsx
import React from "react";
import { Text } from "react-native";
import styles from "../styles/UserManualStyles";

type Children = { children: React.ReactNode };

export const PageTitle = ({ children }: Children) => (
  <Text style={styles.pageTitle}>{children}</Text>
);

export const SectionTitle = ({ children }: Children) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

export const SubTitle = ({ children }: Children) => (
  <Text style={styles.subTitle}>{children}</Text>
);

export const P = ({ children }: Children) => (
  <Text style={styles.pageText}>{children}</Text>
);

export const Bold = ({ children }: Children) => (
  <Text style={styles.bold}>{children}</Text>
);

// Prevent Expo Router warning
export default {};
