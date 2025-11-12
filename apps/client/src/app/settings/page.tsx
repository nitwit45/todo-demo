"use client";

import { useState } from "react";
import { Shield, Loader2, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { setup2FA, verify2FA, disable2FA } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Image from "next/image";

function SettingsPageContent() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const result = await setup2FA();
      if (result.success && result.data) {
        setQrCode(result.data.qrCode);
        setSecret(result.data.secret);
        setShowSetup(true);
        toast({
          title: "QR Code Generated",
          description: "Scan the QR code with your authenticator app",
        });
      }
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verify2FA(verificationCode);
      if (result.success && user) {
        updateUser({ ...user, twoFactorEnabled: true });
        setShowSetup(false);
        setQrCode("");
        setSecret("");
        setVerificationCode("");
        toast({
          title: "2FA Enabled!",
          description: "Two-factor authentication has been enabled for your account",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (
      !confirm("Are you sure you want to disable 2FA? This will make your account less secure.")
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await disable2FA();
      if (result.success && user) {
        updateUser({ ...user, twoFactorEnabled: false });
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to disable 2FA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-6">
      <div className="container mx-auto max-w-4xl px-4 py-12 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account security and preferences</p>
        </div>

        {/* User Info Card */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="text-lg">{user?.name}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-lg">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 2FA Card */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
              <p className="text-muted-foreground">
                Add an extra layer of security to your account using an authenticator app
              </p>
            </div>
            {user?.twoFactorEnabled ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Enabled</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Disabled</span>
              </div>
            )}
          </div>

          {!user?.twoFactorEnabled && !showSetup && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">How it works</h3>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>2. Scan the QR code or enter the secret key manually</li>
                  <li>3. Enter the 6-digit code to verify and enable 2FA</li>
                </ol>
              </div>
              <Button onClick={handleSetup2FA} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Shield className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          )}

          {showSetup && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-background">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg">
                    {qrCode && (
                      <Image
                        src={qrCode}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="w-48 h-48"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">Or enter this code manually:</p>
                    <code className="px-3 py-1.5 bg-muted rounded text-sm font-mono">{secret}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleVerify2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Enable
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSetup(false);
                      setQrCode("");
                      setSecret("");
                      setVerificationCode("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {user?.twoFactorEnabled && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your account is protected with two-factor authentication. You&apos;ll need to
                  enter a code from your authenticator app when signing in.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable Two-Factor Authentication
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
