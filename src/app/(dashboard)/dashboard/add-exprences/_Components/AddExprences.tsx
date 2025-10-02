/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronRight, Save } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export function AddExprences() {
  const [preview, setPreview] = useState<string | null>(null);
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const queryClient = useQueryClient();
  const router = useRouter();

  // Move schema inside component and replace File with runtime check
  const formSchema = z.object({
    categoryName: z
      .string()
      .min(2, { message: "Title must be at least 2 characters." }),
    categorydescription: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(200, "Description must not exceed 200 characters"),
    image: z
      .any()
      .optional()
      .refine(
        (file) => !file || (file instanceof File && file.type.startsWith("image/")),
        { message: "Only image files are allowed" }
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
      categorydescription: "",
      image: undefined,
    },
  });

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/experience/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Experience creation failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success(data.message || "Experience created successfully!");
      router.push("/"); // Update route if needed
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Something went wrong");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.categoryName);
    formData.append("desccription", values.categorydescription);
    if (values.image) formData.append("image", values.image);

    createMutation.mutate(formData);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Add Experiences
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Add Experiences</span>
          </nav>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="w-[60%] space-y-6">
              <FormField
                control={form.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        className="h-[50px]"
                        placeholder="Experience Title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categorydescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Experience Description..."
                        className="h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        accept="image/*"
                        className="border border-gray-300 rounded px-3 py-3 w-full"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                          if (file) setPreview(URL.createObjectURL(file));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {preview && (
                      <div className="w-full h-[268px] relative border">
                        <Image
                          src={preview}
                          alt="preview"
                          fill
                          className="mt-4 rounded border border-gray-200 object-cover"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="mt-4 text-base bg-cyan-500 cursor-pointer hover:bg-cyan-600 w-[120px] h-[50px] flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="!w-5.5 !h-5.5 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
