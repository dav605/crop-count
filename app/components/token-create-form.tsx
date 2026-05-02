"use client";

import useError from "@/hooks/useError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@/hooks/useWallet";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";

export function TokenCreateForm() {
  const { handleError } = useError();
  const { account, connected } = useWallet();
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    category: z.string().min(1),
    kind: z.enum(["crop", "livestock"]),
    description: z.string().min(1),
    identifier: z.string().min(1),
    unitsTotal: z.coerce.number().int().gt(0),
    unitPrice: z.coerce.number().int().gt(0),
    expectedReturnAmount: z.coerce.number().int().gt(0),
    expectedReturnPeriod: z.string(),
    metadataUri: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      kind: "crop",
      description: "",
      identifier: "",
      unitsTotal: 100,
      unitPrice: 100,
      expectedReturnAmount: 0,
      expectedReturnPeriod: "6m",
      metadataUri: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);

      if (!connected || !account?.address) {
        throw new Error("Connect a Stellar wallet first");
      }

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator: account.address,
          category: values.category,
          kind: values.kind,
          description: values.description,
          identifier: values.identifier,
          unitsTotal: String(values.unitsTotal),
          unitPrice: String(values.unitPrice),
          expectedReturnAmount: String(values.expectedReturnAmount),
          expectedReturnPeriod: values.expectedReturnPeriod,
          metadataUri: values.metadataUri || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to create asset");
      }

      toast({
        title: "Asset listed",
        description: "Your asset is now available for fractional investment.",
      });
      router.push("/farm");
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wheat, Dairy, Poultry..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="crop">🌾 Crop</SelectItem>
                  <SelectItem value="livestock">🐄 Livestock</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="An Aberdeen Angus calf from a farm located in Spain, Province of Cáceres..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input
                  placeholder="42..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitsTotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total fractional units</FormLabel>
              <FormControl>
                <Input
                  placeholder="100"
                  type="number"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per unit (stable token base units)</FormLabel>
              <FormControl>
                <Input
                  placeholder="100"
                  type="number"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expectedReturnAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected total return amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="12000"
                  type="number"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expectedReturnPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected return period</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1m">1 month</SelectItem>
                  <SelectItem value="3m">3 months</SelectItem>
                  <SelectItem value="6m">6 months</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metadataUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata URI (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="ipfs://..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create
        </Button>
      </form>
    </Form>
  );
}
