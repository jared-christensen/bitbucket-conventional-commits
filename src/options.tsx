import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Storage } from "@plasmohq/storage";

import "~styles/globals.css";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { toast, Toaster } from "sonner";
import { Download, Eye, EyeOff, Loader2 } from "lucide-react";

import { optionsSchema, type Options } from "~schema/options-schema";

import "~types/chrome-ai.d";

type ChromeAIStatus = "checking" | "unavailable" | "not-enabled" | "downloadable" | "downloading" | "available";
type OpenAIStatus = "unconfigured" | "valid" | "invalid";

const storage = new Storage();

const OptionsIndex = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [chromeAIStatus, setChromeAIStatus] = useState<ChromeAIStatus>("checking");
  const [openAIStatus, setOpenAIStatus] = useState<OpenAIStatus>("unconfigured");
  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<z.infer<typeof optionsSchema>>({
    resolver: zodResolver(optionsSchema),
    defaultValues: {
      apiKey: "",
      aiProvider: "chrome",
    },
  });

  const checkChromeAI = async () => {
    if (typeof LanguageModel === "undefined") {
      setChromeAIStatus("not-enabled");
      return;
    }

    try {
      const availability = await LanguageModel.availability();
      setChromeAIStatus(availability === "unavailable" ? "unavailable" : availability);
    } catch {
      setChromeAIStatus("unavailable");
    }
  };

  const downloadChromeAI = async () => {
    if (typeof LanguageModel === "undefined") return;

    setIsDownloading(true);
    setChromeAIStatus("downloading");

    try {
      const session = await LanguageModel.create();
      session.destroy();
      setChromeAIStatus("available");
    } catch {
      checkChromeAI();
    } finally {
      setIsDownloading(false);
    }
  };

  const testOpenAIKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say hello" }],
          temperature: 0.3,
          max_tokens: 10,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      const options = await storage.get<Options>("options");
      if (options) {
        form.reset(options);
        if (options.apiKey) {
          setOpenAIStatus("valid");
        }
      }
    };
    loadOptions();
    checkChromeAI();
  }, [form]);

  const [showApiKey, setShowApiKey] = useState(false);
  const [chromeAITestResult, setChromeAITestResult] = useState<"success" | "error" | null>(null);
  const [openAITestResult, setOpenAITestResult] = useState<"success" | "error" | null>(null);
  const [saveResult, setSaveResult] = useState<"success" | "invalid" | null>(null);

  const handleSave = async (values: z.infer<typeof optionsSchema>) => {
    setIsSaving(true);
    try {
      await storage.set("options", values);
      toast.success("Saved");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProvider = form.watch("aiProvider");

  return (
    <div className="p-5 font-sans text-base">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>AI Provider</CardTitle>
            <CardDescription>Choose which AI to use for generating commit messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <FormField
                control={form.control}
                name="aiProvider"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        storage.set("options", { ...form.getValues(), aiProvider: value });
                        setChromeAITestResult(null);
                        setOpenAITestResult(null);
                        setSaveResult(null);
                      }}
                      value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="chrome">Chrome AI</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

            {selectedProvider === "chrome" && (
              <div className="space-y-4">
                <div className="text-sm space-y-2">
                  <p>1. Enable Chrome flag:</p>
                  <code className="block bg-muted px-2 py-1 rounded text-xs select-all">
                    chrome://flags/#prompt-api-for-gemini-nano
                  </code>
                </div>

                <div className="text-sm space-y-2">
                  <p>2. Download model (~1.5GB):</p>
                  {chromeAIStatus === "checking" && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking...
                    </div>
                  )}
                  {chromeAIStatus === "downloadable" && (
                    <Button size="sm" onClick={downloadChromeAI} disabled={isDownloading}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                  {chromeAIStatus === "downloading" && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading... This may take a few minutes.
                    </div>
                  )}
                  {chromeAIStatus === "available" && (
                    <Button size="sm" disabled>
                      Downloaded
                    </Button>
                  )}
                  {(chromeAIStatus === "unavailable" || chromeAIStatus === "not-enabled") && (
                    <span className="text-red-600">Enable the flag and restart Chrome.</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const session = await LanguageModel.create();
                        await session.prompt("Say hi");
                        session.destroy();
                        setChromeAITestResult("success");
                      } catch {
                        setChromeAITestResult("error");
                      }
                    }}>
                    Test
                  </Button>
                  {chromeAITestResult === "success" && (
                    <span className="text-sm text-green-600">Ready to use.</span>
                  )}
                  {chromeAITestResult === "error" && (
                    <span className="text-sm text-red-600">Test failed.</span>
                  )}
                </div>
              </div>
            )}

            {selectedProvider === "openai" && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type={showApiKey ? "text" : "password"} className="pr-10" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowApiKey(!showApiKey)}>
                              {showApiKey ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const apiKey = form.getValues("apiKey");
                        if (!apiKey) return;
                        const isValid = await testOpenAIKey(apiKey);
                        if (isValid) {
                          setOpenAITestResult("success");
                        } else {
                          setOpenAITestResult("error");
                        }
                      }}>
                      Test
                    </Button>
                    {openAITestResult === "success" && (
                      <span className="text-sm text-green-600">Ready to use.</span>
                    )}
                    {openAITestResult === "error" && (
                      <span className="text-sm text-red-600">Test failed.</span>
                    )}
                  </div>

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        <Toaster position="top-center" />
      </div>
    </div>
  );
};

export default OptionsIndex;
