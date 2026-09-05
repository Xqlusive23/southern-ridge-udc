"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ADMIN, DEMO_MEMBER } from "@/lib/constants";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="h-10"
      />
    </div>
  );
}

export function LoginForm({
  role = "member",
}: {
  role?: "member" | "admin";
}) {
  const [state, action] = useActionState(loginAction, null);
  const demo = role === "admin" ? DEMO_ADMIN : DEMO_MEMBER;

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="role" value={role} />
      <StatusBanner error={state?.error} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={demo.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
      />
      <FormButton className="h-11 w-full bg-[#0B2340] text-white hover:bg-[#08182C]">
        {role === "admin" ? "Enter operations console" : "Sign in to E-Banking"}
      </FormButton>
      <div className="rounded-lg bg-[#F4F7F5] px-3 py-3 text-xs leading-5 text-[#3E4A44]">
        <p className="font-medium text-[#0B2340]">Demo sign-in</p>
        <p>
          {demo.email}
          <br />
          {demo.password}
        </p>
      </div>
      {role === "member" ? (
        <p className="text-center text-sm text-muted-foreground">
          New to the credit union?{" "}
          <Link href="/open-account" className="font-medium text-[#2F7A45]">
            Open an account
          </Link>
        </p>
      ) : null}
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, null);

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" autoComplete="given-name" />
        <Field label="Last name" name="lastName" autoComplete="family-name" />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <Field label="Mobile phone" name="phone" autoComplete="tel" />
      <Field label="Street address" name="address" autoComplete="street-address" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" name="city" autoComplete="address-level2" />
        <Field label="State" name="state" autoComplete="address-level1" placeholder="GA" />
        <Field label="ZIP" name="zip" autoComplete="postal-code" />
      </div>
      <Field label="Date of birth" name="dateOfBirth" type="date" />
      <FormButton className="h-11 w-full bg-[#0B2340] text-white hover:bg-[#08182C]">
        Open my membership
      </FormButton>
    </form>
  );
}
