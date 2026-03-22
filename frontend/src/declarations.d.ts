declare module "*.webp";
declare module "*.png";
declare module "*.svg";
declare module "*.module.css";

interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL: string;
    };
}