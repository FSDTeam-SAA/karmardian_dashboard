/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // 👈 new import

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggle
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: formData?.email,
        password: formData?.password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res?.error);
      }

      toast.success("Login Successfully !");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image */}
      <div className="w-full lg:w-1/2 h-64 lg:h-auto relative">
        <Image
          src="/images/loginImage.jpg"
          alt="Sign Up Illustration"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-start p-6 bg-gray-50">
        <div className="w-full max-w-2xl">
          <CardHeader className="text-start">
            <CardTitle className="lg:text-[40px] md:text-[30px] text-[24px] font-semibold leading-[120%] text-[#000000]">
              Welcome 👋
            </CardTitle>
            <p className="text-[#B0B0B0] text-base leading-[120%] font-normal mb-8">
              Please enter your details
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-[51px] border border-[#272727] mt-2"
                />
              </div>

              {/* Password with eye toggle */}
              <div>
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-[51px] border border-[#272727] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-base h-[51px] bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md transition"
              >
                {isLoading ? "Sign In..." : "Sign in "}
              </Button>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
