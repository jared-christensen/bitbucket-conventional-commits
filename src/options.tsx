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
import { Toaster } from "@/src/components/ui/toaster";
import { toast } from "@/src/hooks/use-toast";
import { Loader2 } from "lucide-react";

import { optionsSchema, type Options } from "~schema/options-schema";

const storage = new Storage();

const OptionsIndex = () => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof optionsSchema>>({
    resolver: zodResolver(optionsSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      const options = await storage.get<Options>("options");
      if (options) {
        form.reset(options);
      }
    };
    loadOptions();
  }, [form]);

  const handleSaveAndTest = async (values: z.infer<typeof optionsSchema>) => {
    setIsSaving(true);
    try {
      await storage.set("options", values);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${values.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say hello" }],
          temperature: 0.3,
          max_tokens: 10,
        }),
      });
      await response.json();
      if (!response.ok) {
        throw new Error("Invalid API Key or request failed");
      }
      toast({
        title: "Settings saved & API key tested",
        description: "Your OpenAI API key is valid and working.",
      });
    } catch (e) {
      toast({
        title: "Settings saved but test failed",
        description: "Your API key could not be validated.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 font-sans text-base">
      <div className="mx-auto max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveAndTest)} className="space-y-6">
            {/* Section 1: OpenAI API Key */}
            <Card>
              <CardHeader>
                <CardTitle>OpenAI API Key</CardTitle>
                <CardDescription>
                  To use this extension, you’ll need to provide your own OpenAI API key. You can create one by visiting{" "}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline">
                    OpenAI's API key page
                  </a>
                  . Please note that OpenAI API access usually requires a paid account.
                  <br />
                  <br />
                  Your API key will be saved privately in your browser and only used by this extension.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OpenAI API Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="my-6" />
          </form>
        </Form>
        <Toaster />
      </div>
    </div>
  );
};

export default OptionsIndex;
