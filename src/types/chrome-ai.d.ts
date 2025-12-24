declare global {
  const LanguageModel: {
    availability(): Promise<"unavailable" | "downloadable" | "downloading" | "available">;
    create(): Promise<{ prompt(input: string): Promise<string>; destroy(): void }>;
  } | undefined;
}

export {};
