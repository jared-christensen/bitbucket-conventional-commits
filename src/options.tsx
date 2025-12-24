import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

import { Storage } from "@plasmohq/storage";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useChromeAI } from "~hooks/use-chrome-ai";
import { useOpenAI } from "~hooks/use-openai";
import { optionsSchema, type Options } from "~schema/options-schema";

import "~styles/globals.css";

const storage = new Storage();

const OptionsIndex = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const chromeAI = useChromeAI();
  const openAI = useOpenAI();

  const form = useForm<z.infer<typeof optionsSchema>>({
    resolver: zodResolver(optionsSchema),
    defaultValues: {
      apiKey: "",
      aiProvider: "chrome",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      const options = await storage.get<Options>("options");
      if (options) {
        // Backwards compatibility: if user has an API key but no explicit provider choice,
        // they were using the extension before Chrome AI was added - default to OpenAI
        const effectiveProvider = options.aiProvider ?? (options.apiKey ? "openai" : "chrome");
        form.reset({ ...options, aiProvider: effectiveProvider });
      }
    };
    loadOptions();
  }, [form]);

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
                        chromeAI.clearTestResult();
                        openAI.clearTestResult();
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
                  {chromeAI.status === "checking" && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking...
                    </div>
                  )}
                  {chromeAI.status === "downloadable" && (
                    <Button size="sm" onClick={chromeAI.download}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                  {chromeAI.status === "downloading" && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading... This may take a few minutes.
                    </div>
                  )}
                  {chromeAI.status === "available" && (
                    <Button size="sm" disabled>
                      Downloaded
                    </Button>
                  )}
                  {(chromeAI.status === "unavailable" || chromeAI.status === "not-enabled") && (
                    <span className="text-red-600">Enable the flag and restart Chrome.</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={chromeAI.test}>
                    Test
                  </Button>
                  {chromeAI.testResult === "success" && (
                    <span className="text-sm text-green-600">Ready to use.</span>
                  )}
                  {chromeAI.testResult === "error" && (
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
                      onClick={() => openAI.test(form.getValues("apiKey"))}>
                      Test
                    </Button>
                    {openAI.testResult === "success" && (
                      <span className="text-sm text-green-600">Ready to use.</span>
                    )}
                    {openAI.testResult === "error" && (
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
