import { Button } from "@/components/ui/button";
import { Fingerprint, Lock, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.12 75), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.18 200), transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(oklch(0.78 0.12 75 / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.78 0.12 75 / 0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full"
      >
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-2xl bg-navy-card border border-gold/30 flex items-center justify-center shadow-gold">
              <img
                src="/assets/generated/moira-logo-transparent.dim_80x80.png"
                alt="Moira"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-navy-deep" />
            </div>
          </motion.div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display font-bold text-3xl text-foreground tracking-tight"
            >
              Moira
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gold font-body text-sm font-medium tracking-widest uppercase mt-0.5"
            >
              SmartBank AI
            </motion.p>
          </div>
        </div>

        {/* 26.ai vault security badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono-code text-xs font-bold tracking-wider"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.025 245), oklch(0.14 0.03 200))",
            border: "1px solid oklch(0.82 0.14 200 / 0.4)",
            color: "oklch(0.82 0.14 200)",
            boxShadow:
              "0 0 20px oklch(0.82 0.14 200 / 0.2), inset 0 1px 0 oklch(0.82 0.14 200 / 0.1)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: "oklch(0.82 0.14 200)" }}
          />
          VAULT SECURITY BY 26.AI
          <Zap className="w-3 h-3" style={{ color: "oklch(0.82 0.14 200)" }} />
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {[
            { icon: Shield, label: "Secure" },
            { icon: Fingerprint, label: "Biometric" },
            { icon: Lock, label: "Encrypted" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-card border border-border text-muted-foreground text-xs font-body"
            >
              <Icon className="w-3 h-3 text-gold" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full bg-navy-card border border-border rounded-2xl p-6 shadow-card"
        >
          <div className="text-center mb-6">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Sign in to access your smart banking dashboard
            </p>
          </div>

          {isLoginError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-body">
              {loginError?.message ?? "Login failed. Please try again."}
            </div>
          )}

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 bg-gold text-navy-deep font-display font-bold text-base hover:bg-gold/90 transition-all duration-200 rounded-xl shadow-gold"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-deep border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Sign In Securely</span>
              </div>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground font-body mt-4">
            Secured by Internet Computer Protocol
          </p>
        </motion.div>

        {/* Version badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground font-mono-code"
        >
          v50.0 · Mini Browser Edition · 26.ai Vault
        </motion.div>
      </motion.div>
    </div>
  );
}
