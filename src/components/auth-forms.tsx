"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { DEMO_ADMIN, DEMO_MEMBER } from "@/lib/constants";

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={fieldClass}
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
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="role" value={role} />
      <StatusBanner error={state?.error} />
      <Field
        id={emailId}
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder={demo.email}
        value={email}
        onChange={setEmail}
      />
      <Field
        id={passwordId}
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />
      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0B2340] px-4 text-sm font-medium text-white hover:bg-[#08182C]"
      >
        {role === "admin" ? "Enter operations console" : "Sign in to E-Banking"}
      </button>
      <div className="rounded-lg bg-[#F4F7F5] px-3 py-3 text-xs leading-5 text-[#3E4A44]">
        <p className="font-medium text-[#0B2340]">Demo sign-in</p>
        <p className="mt-1">
          {demo.email}
          <br />
          {demo.password}
        </p>
        <button
          type="button"
          className="mt-2 font-medium text-[#2F7A45] underline-offset-2 hover:underline"
          onClick={() => {
            setEmail(demo.email);
            setPassword(demo.password);
          }}
        >
          Fill demo credentials
        </button>
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
  const prefix = useId();

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${prefix}-first`} label="First name" name="firstName" autoComplete="given-name" />
        <Field id={`${prefix}-last`} label="Last name" name="lastName" autoComplete="family-name" />
      </div>
      <Field
        id={`${prefix}-email`}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
      />
      <Field
        id={`${prefix}-password`}
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <Field id={`${prefix}-phone`} label="Mobile phone" name="phone" autoComplete="tel" />
      <Field id={`${prefix}-address`} label="Street address" name="address" autoComplete="street-address" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={`${prefix}-city`} label="City" name="city" autoComplete="address-level2" />
        <Field id={`${prefix}-state`} label="State" name="state" autoComplete="address-level1" placeholder="GA" />
        <Field id={`${prefix}-zip`} label="ZIP" name="zip" autoComplete="postal-code" />
      </div>
      <Field id={`${prefix}-dob`} label="Date of birth" name="dateOfBirth" type="date" />
      <FormButton className="h-11 w-full bg-[#0B2340] text-white hover:bg-[#08182C]">
        Open my membership
      </FormButton>
    </form>
  );
}
