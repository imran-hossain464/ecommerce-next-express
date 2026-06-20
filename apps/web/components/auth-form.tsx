"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api";
import { notifyAuthChanged } from "@/lib/client-auth";

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    const message =
      typeof data.message === "string"
        ? data.message
        : data.message?.fieldErrors
          ? Object.values(data.message.fieldErrors).flat().filter(Boolean).join(" ")
          : fallback;

    return [message, data.hint].filter(Boolean).join(" ");
  } catch {
    return fallback;
  }
}

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email")),
        password: String(form.get("password"))
      })
    });

    if (!response.ok) {
      setMessage(await readErrorMessage(response, "Invalid email or password."));
      return;
    }

    const data = await response.json();
    document.cookie = `app-auth-token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChanged();
    router.push(data.user.role === "admin" ? "/admin" : "/account");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={login}>
          <Input name="email" type="email" placeholder="Email address" required />
          <Input name="password" type="password" placeholder="Password" required />
          <Button type="submit">Login</Button>
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
          <p className="text-sm text-muted-foreground">
            New customer? <Link className="font-medium text-foreground underline" href="/register">Create an account</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: String(form.get("full_name")),
        email: String(form.get("email")),
        phone: String(form.get("phone") || ""),
        password: String(form.get("password"))
      })
    });

    if (!response.ok) {
      setMessage(await readErrorMessage(response, "Could not create account."));
      return;
    }

    const data = await response.json();
    document.cookie = `app-auth-token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChanged();
    router.push("/account");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={register}>
          <Input name="full_name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Email address" required />
          <Input name="phone" placeholder="Phone number" />
          <Input name="password" type="password" placeholder="Password, minimum 8 characters" required />
          <Button type="submit">Register</Button>
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
          <p className="text-sm text-muted-foreground">
            Already registered? <Link className="font-medium text-foreground underline" href="/login">Login</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
