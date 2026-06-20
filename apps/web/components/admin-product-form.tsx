"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";
import { getAuthTokenCookie } from "@/lib/client-auth";

export function AdminProductForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(getAuthTokenCookie());
  }, []);

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const imageFile = form.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        setMessage("Please upload an image file.");
        return;
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        setMessage("Please upload an image smaller than 5MB.");
        return;
      }
    }

    const imageData = imageFile && imageFile.size > 0 ? await fileToDataUrl(imageFile) : null;

    const payload = {
      name: String(form.get("name")),
      slug: String(form.get("slug")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      image_url: String(form.get("image_url") || "") || null,
      image_data: imageData,
      inventory: Number(form.get("inventory")),
      status: String(form.get("status"))
    };

    if (!token) {
      setMessage("Please login as admin again. No admin session token was found.");
      return;
    }

    const response = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setMessage("Product created.");
      formElement.reset();
      router.refresh();
      return;
    }

    setMessage(await readErrorMessage(response, "Could not create product."));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload product</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={createProduct}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Product name" required />
            <Input name="slug" placeholder="product-slug" required />
            <Input name="price" type="number" min="0" step="0.01" placeholder="Price" required />
            <Input name="inventory" type="number" min="0" placeholder="Inventory" required />
            <Input name="image" type="file" accept="image/*" className="md:col-span-2" />
            <Input name="image_url" className="md:col-span-2" placeholder="Optional image URL if not uploading a file" />
            <select name="status" className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <Textarea name="description" className="md:col-span-2" placeholder="Description" />
          </div>
          <Button type="submit">Create product</Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    if (typeof data.message === "string") return data.message;
    if (data.message?.fieldErrors) {
      return Object.values(data.message.fieldErrors).flat().filter(Boolean).join(" ") || fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
