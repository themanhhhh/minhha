"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services";
import { rolePath } from "@/mocks/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const demos = [
  { label: "Học viên", email: "student@riki.vn" },
  { label: "Giáo viên", email: "teacher@riki.vn" },
  { label: "Học vụ", email: "academic@riki.vn" },
  { label: "Giám đốc", email: "director@riki.vn" },
];
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@riki.vn");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      router.replace(rolePath(response.user.role));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Đăng nhập không thành công.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader className="space-y-3 p-8">
        <div className="grid size-11 place-items-center rounded-xl bg-emerald-500 font-bold text-white lg:hidden">
          R
        </div>
        <div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription className="mt-2">
            Chào mừng bạn quay trở lại với Riki LMS.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@riki.vn"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}Đăng nhập{" "}
            {!loading && <ArrowRight className="size-4" />}
          </Button>
        </form>
        {/* <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <span className="relative mx-auto block w-fit bg-card px-3 text-xs text-muted-foreground">
            Tài khoản demo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demos.map((demo) => (
            <button
              type="button"
              key={demo.email}
              onClick={() => {
                setEmail(demo.email);
                setPassword("12345678");
              }}
              className="rounded-lg border bg-background px-3 py-2 text-left text-xs transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="block font-medium">{demo.label}</span>
              <span className="mt-0.5 block truncate text-muted-foreground">
                {demo.email}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mật khẩu demo: <span className="font-medium">12345678</span>
        </p> */}
      </CardContent>
    </Card>
  );
}
