import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    ...compat.extends("prettier"),
    {
        rules: {
            // "indent": ["error", 4],
            // "prettier/prettier": ["error", { "tabWidth": 4 }],
            // "@typescript-eslint/no-unused-vars": "off",
            // "@typescript-eslint/no-explicit-any": "off",
            // "@typescript-eslint/ban-ts-comment": "off",
            // "react/no-unescaped-entities": "off",
        },
    },
];

export default eslintConfig;
